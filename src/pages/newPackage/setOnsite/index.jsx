/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-13 11:25:03
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
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);

    const [list, setList] = useState([
        { id: 1, userName: "林菊华", phone: "12346789043", selected: false, role: '客服', avatar: "" },
        { id: 2, userName: "王子文", phone: "12346789043", selected: false, role: '驻场', avatar: "" },
        { id: 3, userName: "李佳芯", phone: "12346789043", selected: false, role: '管理员', avatar: "" },
        { id: 4, userName: "甄晓晓", phone: "12346789043", selected: false, role: '客服', avatar: "" },
    ])

    const setOnSite = (index) => {
        setList(list => {
            let _list = list.map(item => {
                item.selected = false;
                return item;
            });
            _list[index].selected = true;
            return _list;
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='设置驻场'></Navbar>

            {/* <View className='tab_wrapper'>
                <View className='tab_item' onClick={() => { setShowRoleModel(true) }}>
                    <View>全部状态</View>
                    <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                </View>
                <View className='tab_item' onClick={() => { setShowLimitModel(true) }}>
                    <View>全部角色</View>
                    <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                </View>
            </View> */}

            <View className='list_wrapper'>
                {
                    list.length > 0 && list.map((item, index) => {
                        return (
                            <View className='list_item' key={index} onClick={() => setOnSite(index)}>
                                <View className='list_item_left'>
                                    <View className='avatar'></View>
                                    <View className='item_infos'>
                                        <View className='item_name'>
                                            <View>{item.userName}</View>
                                            <View className='item_role'>{item.role}</View>
                                        </View>
                                        <View className='item_phone'>{item.phone}</View>
                                    </View>
                                </View>
                                <Image className='list_item_right' src={`${Taro.$cdnUrl}/index/index_icon2${item.selected ? 7 : 8}.webp`}></Image>
                            </View>
                        )
                    })
                }
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
