/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 10:31:42
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Block } from '@tarojs/components'
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

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='新建员工'></Navbar>

            <View className='add_title'>账号信息</View>
            <View className='employee_group'>
                <View className='employee_item'>
                    <View className='employee_item_label'>姓名</View>
                    <Input
                        className='employee_item_input'
                        placeholder='请输入员工姓名'
                        placeholderStyle='color: #999999;'
                        value={formData.name}
                        onInput={(e) => setFormData({ ...formData, name: e.detail.value })}></Input>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>手机号码</View>
                    <Input
                        type='number'
                        className='employee_item_input'
                        placeholder='请输入员工账户的手机号码'
                        placeholderStyle='color: #999999;'
                        value={formData.phone}
                        onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}></Input>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>密码</View>
                    <Input
                        password={ispassword}
                        className='employee_item_input'
                        placeholder='长度不低于8位，包含字母和数字'
                        placeholderStyle='color: #999999;'
                        value={formData.password}
                        onInput={(e) => setFormData({ ...formData, password: e.detail.value })}></Input>
                    <Image onClick={() => setIsPassword(!ispassword)} src={`${Taro.$cdnUrl}/index/index_eye.webp`}></Image>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>确认密码</View>
                    <Input
                        password={ispassword}
                        className='employee_item_input'
                        placeholder='长度不低于8位，包含字母和数字'
                        placeholderStyle='color: #999999;'
                        value={formData.subPassword}
                        onInput={(e) => setFormData({ ...formData, subPassword: e.detail.value })}></Input>
                    <Image onClick={() => setIsPassword(!ispassword)} src={`${Taro.$cdnUrl}/index/index_eye.webp`}></Image>
                </View>
            </View>
            <View className='add_title'>账号权限</View>
            <View className='employee_group_2'>
                <View className='employee_item'>
                    <View className='employee_item_label'>角色</View>
                    <View className='employee_item_right' onClick={() => { setShowRoleModel(true) }}>
                        <View className={`${formData.role ? 'option_item_active' : 'option_item_text'}`}>{formData.role ? formData.role : '请选择'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>权限</View>
                    <View className='employee_item_right' onClick={() => { setShowLimitModel(true) }}>
                        <View className={`${formData.authority ? 'option_item_active' : 'option_item_text'}`}>{formData.authority ? formData.authority : '请选择'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
            </View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn'>保存</View>
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
