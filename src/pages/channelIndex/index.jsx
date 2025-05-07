/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-06 10:53:34
 * @Description:
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { View, Text, Input, Button, Image, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import { debounce } from '@/util/utils'
import './index.scss'

import { myChannelList } from '@/util/api'

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
        userStore: { isLogin, refreshUserInfo, userInfo, companyInfo, getRoleAndPermissionFunc, setMyPermissions },
        businessStore: { setSourceList }
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true)
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [list, setList] = useState([]);

    useEffect(() => {
        if (isLogin) {
            getRoleAndPermissionFunc();
            refreshUserInfo();
            setMyPermissions();
        }
    }, [isLogin])

    useEffect(() => {
        console.log('供应商管理页面,companyInfo', userInfo, companyInfo);
        getList(1)
    }, [])

    const getList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
            companySerialCode: companyInfo.companySerialCode,
            // supplierSerialCode: '',
            searchInfo: searchValue
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await myChannelList(params);
        Taro.hideLoading();
        console.log("code, data", code, data);
        setIsRefresh(false);
        if (code === 200 && data?.responses?.length > 0) {
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

    const handleScrollToLower = debounce(() => {    // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (goonLoad) {
            getList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {    // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
        getList(1);
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px - 360rpx)`;
    }

    Taro.useShareAppMessage(res => {
        let title = '邀请您加入我的供应商';
        let imageUrl = `${Taro.$cdnUrl}/supplier/supplier_55.webp` // 图片 URL
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        let par = { companySerialCode: companyInfo.companySerialCode, role: 'SUPPLIER' }
        let path = `/pages/supplierProject/index`;
        const params = new URLSearchParams(par);
        path = `${path}?${params.toString()}`;
        return {
            title,
            imageUrl,
            path
        }
    })

    return (
        <View className='channel_container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    {
                        !isLogin &&
                        <View className='default_logo'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon60.webp`}></Image>
                        </View> ||
                        <View className='user_infos'>
                            <Image src={userInfo?.avatar}></Image>
                            <View>{userInfo.nickName ? userInfo.nickName : ''}</View>
                            <View className='role_tag'>渠道</View>
                        </View>
                    }
                </View>
            </View>
            <View style={`height:${statusTitleHeight + contenTitleHeight}px;`}></View>

            <View className='search_wrapper'>
                <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                <Input className='search_input'
                    placeholder='输入关键词搜索供应商'
                    confirmType='search'
                    placeholderStyle='color: #777777;'
                    onInput={(e) => { setSearchValue(e.detail.value) }}
                    onConfirm={(e) => {
                        setgoonLoad(true);
                        getList(1);
                    }}
                    value={searchValue}></Input>
            </View>


            <View className='btns'>
                <View className='btns_item' onClick={()=>{
                    Taro.navigateTo({ url: `/pages/channelPackage/newInterviewWorker/index` })
                }}>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_97.webp`}></Image>
                    <View>面试录入</View>
                </View>
                <Button open-type='share' className='btns_item'>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_96.webp`}></Image>
                    <View>邀请供应商</View>
                </Button>
            </View>

            <View className='supplier_title'>
                <View>我的供应商</View>
                {/* <Button open-type='share' className='supplier_title_right'>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_6.webp`}></Image>
                    <View>邀请供应商加入</View>
                </Button> */}
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
                            <View className='supplier_list' key={index} onClick={() => {
                                Taro.navigateTo({ url: `/pages/supplierPackage/supplierDetail/index?channelSerialCode=${item.channelSerialCode}&channelCode=${item.channelCode}` })
                            }}>
                                <View className='supplier_list_name'>
                                    <View>{item.channelName}</View>
                                    {/* {
                                        item.companyVerified ? <View className='supplier_list_name_auth'>已认证</View> : ''
                                    } */}
                                </View>
                                <View className='supplier_list_nums'>
                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.coopContracts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>合作项目</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.deliveredCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已入职</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.resignCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已离职</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.settlementCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已结费</View>
                                    </View>
                                </View>
                            </View>
                        )
                    })
                }
                {
                    list.length >= 5 &&
                    <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                }
                {
                    list.length === 0 && requestState === 3 &&
                    <Taro.NoData></Taro.NoData>
                }
            </ScrollView>


            <TabBar actCurrent={0} />
        </View>
    )
})

export default inject('store')(Index)
