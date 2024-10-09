/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-08 17:45:13
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import { reverseGeocoder } from '@/util/getLocation';
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store
    const [formData, setFormData] = useState({});
    const [ispassword, setIsPassword] = useState(true);

    const [showRoleModel, setShowRoleModel] = useState(false);
    const [roleList, setRoleList] = useState(['客服', '驻场', '销售']);

    const [showLimitModel, setShowLimitModel] = useState(false);
    const [tabHeight, setTabHeight] = useState(44);
    const [bottomHeight, setBottomHeight] = useState(92);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);

    const [list, setList] = useState([
        { id: 1, userName: "林菊华", phone: "12346789043", status: 1, role: '客服', avatar: "" },
        { id: 2, userName: "王子文", phone: "12346789043", status: 1, role: '驻场', avatar: "" },
        { id: 3, userName: "李佳芯", phone: "12346789043", status: 1, role: '管理员', avatar: "" },
        { id: 4, userName: "甄晓晓", phone: "12346789043", status: 0, role: '客服', avatar: "" },
    ])

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


    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabHeight + bottomHeight + 15}px)`;
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='员工管理'></Navbar>

            <View className='tab_wrapper'>
                <View className='tab_item' onClick={() => { setShowRoleModel(true) }}>
                    <View>全部状态</View>
                    <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                </View>
                <View className='tab_item' onClick={() => { setShowLimitModel(true) }}>
                    <View>全部角色</View>
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
                    list.length>0 && list.map((item, index) => {
                        return (
                            <View className='employee_item' key={item.id} onClick={()=>{
                                Taro.navigateTo({
                                    url: `/pages/minePackage/employeeDetail/index?id=${item.id}`
                                })
                            }}>
                                <View className='employee_item_left'>
                                    <View className='employee_item_avatar'></View>
                                    <View className='employee_item_info'>
                                        <View className='employee_item_name'>
                                            <View>{item.userName}</View>
                                            <View className='employee_item_role'>{item.role}</View>
                                        </View>
                                        <View className='employee_item_phone'>{item.phone}</View>
                                    </View>
                                </View>
                                <View className='employee_item_right'>
                                    <View style={`color:${item.status === 1 ? '#04B400':'#F00000'}`}>{item.status === 1 ? '启用' : '停用'}</View>
                                    <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn'>新增账号</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showRoleModel} onClose={() => { setShowRoleModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>选择角色</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowRoleModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    roleList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item === formData.role ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => setFormData({ ...formData, role: item })}
                                            >{item}</View>
                                        )
                                    })
                                }
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
                                {
                                    roleList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item === formData.role ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => setFormData({ ...formData, role: item })}
                                            >{item}</View>
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
