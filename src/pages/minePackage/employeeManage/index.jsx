/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-26 10:30:34
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Text, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getRoleName } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'

import { companyMemberList } from '@/util/api'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { companyInfo, roles },
        businessStore: { setEmployeeInfo }
    } = store

    const [showRoleModel, setShowRoleModel] = useState(false);
    const [roleList, setRoleList] = useState(['客服', '驻场', '销售']);

    const [showLimitModel, setShowLimitModel] = useState(false);
    const [tabHeight, setTabHeight] = useState(44);
    const [bottomHeight, setBottomHeight] = useState(92);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;
    const [type, setType] = useState(null);       // 状态 null 全部 0 启用 1停用
    const [roleId, setRoleId] = useState('');     // 角色 2-客服 3-驻场

    const [list, setList] = useState([]);

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.tab_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setTabHeight(_query.height)
            }

            const _bot = await selectorQueryDomInfo('.bottom_wrapper');
            if (_bot?.height) {
                console.log("_query_query_query_bot", _bot.height);
                setBottomHeight(_bot.height)
            }
        }, 0);
    }, [])

    useDidShow(() => {
        getList(1);
    })

    useEffect(() => {
        getList(1);
    }, [roleId, type]);

    const getList = async (_pageNo) => {
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            companySerialCode: companyInfo.companySerialCode,
            roleId: roleId,
            status: type
        }
        const { code, data } = await companyMemberList(params);
        Taro.hideLoading();
        console.log("getList", code, data);

        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            setList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
            setgoonLoad(true);
            setPageNo(data.pageNo);
            setRequestState(2);
        } else {
            setgoonLoad(false);
            setRequestState(3);
            if (_pageNo === 1) {
                setList([]);
            }
        }
    }


    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (goonLoad) {
            getList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
        getList(1);
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabHeight + bottomHeight + 15}px)`;
    }

    const setTypeFunc = (_type) => {
        if (_type != type) {
            setgoonLoad(true);
            setType(_type);
            setTimeout(() => {
                setShowRoleModel(false);
            }, 300);
        }
    }

    const setRoleIdFunc = (_roleId) => {
        if (_roleId != roleId) {
            setgoonLoad(true);
            setRoleId(_roleId);
            setTimeout(() => {
                setShowLimitModel(false);
            }, 300);
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='员工管理'></Navbar>

            <View className='tab_wrapper'>
                <View className='tab_item' onClick={() => { setShowRoleModel(true) }}>
                    <View>{type === null ? '全部状态' : type == '0' ? '启用' : '停用'}</View>
                    <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                </View>
                <View className='tab_item' onClick={() => { setShowLimitModel(true) }}>
                    <View>{roleId === '' ? '全部角色' : roleId == '2' ? '客服' : roleId == '3' ? '驻场' : roleId == '1' ? "超级管理员" : ''}</View>
                    <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                </View>
            </View>

            <ScrollView
                scrollY
                className='scrollWrapper'
                style={{ height: getHeight() }}
                scrollWithAnimation
                showScrollbar={false}
                enablePassive
                refresherEnabled
                refresherTriggered={isRefresh}
                onScrollToLower={handleScrollToLower}
                onRefresherRefresh={handleScrollToUpper}
                lowerThreshold={300}
            >
                {
                    list.length > 0 && list.map((item, index) => {
                        return (
                            <View className='employee_item' key={item.userSerialCode} onClick={() => {
                                // setEmployeeInfo(item);
                                Taro.navigateTo({
                                    url: `/pages/minePackage/employeeDetail/index?userSerialCode=${item.userSerialCode}`
                                })
                            }}>
                                <View className='employee_item_left'>
                                    <Image src={item.avatar} className='employee_item_avatar'></Image>
                                    <View className='employee_item_info'>
                                        <View className='employee_item_name'>
                                            <View>{item.name}</View>
                                            {
                                                item.roles.map((i, idx) => {
                                                    return (
                                                        <View className='employee_item_role' key={idx}>{getRoleName(i.roleId)}</View>
                                                    )
                                                })
                                            }
                                            {/* <View className='employee_item_role'>{item.roleName}</View> */}
                                        </View>
                                        <View className='employee_item_phone'>{item.phone}</View>
                                    </View>
                                </View>
                                <View className='employee_item_right'>
                                    <View style={`color:${item.status == '0' ? '#04B400' : '#F00000'}`}>{item.status == '0' ? '启用' : '停用'}</View>
                                    <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                                </View>
                            </View>
                        )
                    })
                }

                {
                    list.length >= 10 &&
                    <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                }

                {
                    list.length === 0 && requestState === 3 &&
                    <Taro.NoData></Taro.NoData>
                }
            </ScrollView>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn' onClick={() => { Taro.navigateTo({ url: '/pages/newPackage/newEmployee/index' }) }}>
                    <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_1.webp`}></Image>
                    <View>新增账号</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showRoleModel} onClose={() => { setShowRoleModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>选择状态</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowRoleModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                <View className={`filter_wrapper_item ${type === null ? 'filter_wrapper_item_active' : ''}`} onClick={() => setTypeFunc(null)}>全部</View>
                                <View className={`filter_wrapper_item ${type == '0' ? 'filter_wrapper_item_active' : ''}`} onClick={() => setTypeFunc('0')}>启用</View>
                                <View className={`filter_wrapper_item ${type == '1' ? 'filter_wrapper_item_active' : ''}`} onClick={() => setTypeFunc('1')}>停用</View>
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>

            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showLimitModel} onClose={() => { setShowLimitModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>选择角色</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowLimitModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                <View className={`filter_wrapper_item ${roleId === '' ? 'filter_wrapper_item_active' : ''}`}
                                    onClick={() => setRoleIdFunc('')}>全部角色</View>
                                {/* <View className={`filter_wrapper_item ${roleId == '2' ? 'filter_wrapper_item_active' : ''}`}
                                    onClick={() => setRoleIdFunc('2')}>客服</View>
                                <View className={`filter_wrapper_item ${roleId == '3' ? 'filter_wrapper_item_active' : ''}`}
                                    onClick={() => setRoleIdFunc('3')}>驻场</View> */}
                                {
                                    roles.map((item, index) => {
                                        return (
                                            <View className={`filter_wrapper_item ${roleId == item.roleId ? 'filter_wrapper_item_active' : ''}`} onClick={() => setRoleIdFunc(item.roleId)} key={index}>{item.roleName}</View>
                                        )
                                    })
                                }
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
