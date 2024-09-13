/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 11:44:14
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 15:30:13
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Textarea, Text, Input, Block, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store

    const [status, setStatus] = useState(1);


    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title=''></Navbar>

            <View className='container_bg'>
                <View className='infos_wrap'>
                    <View className='avatar'></View>
                    <View className='names'>
                        <View className='name'>林菊华</View>
                        <View className='time'>在职时间：2024.8.27-至今</View>
                    </View>
                    <View className='info_title'>账号信息</View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon17.webp`}></Image>
                        <View className='info_item_label'>手机号码</View>
                        <View className='info_item_value'>18904930403</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon18.webp`}></Image>
                        <View className='info_item_label'>角色</View>
                        <View className='info_item_value'>客服</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon19.webp`}></Image>
                        <View className='info_item_label'>权限</View>
                        <View className='info_item_value'>客服、项目管理、名单管理</View>
                    </View>
                </View>
            </View>

            <View className='detail_btns'>
                <View className='btns_wrap'>
                    {
                        status === 0 ? <View className='btn open_btn'>启用</View> : <View className='btn disable_btn'>禁用</View>
                    }

                    <View className='btn upload_password'>修改密码</View>
                    <View className='btn edit_btn'>编辑</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
