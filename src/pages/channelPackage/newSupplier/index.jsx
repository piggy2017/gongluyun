/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-20 15:30:26
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { throttle } from '@/util/utils'

import Navbar from '@/components/navbar';

import { supplierAdd } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { role, userInfo: { userSerialCode } },
    } = store
    const [formData, setFormData] = useState({});

    const saveWorker = throttle(async () => {
        if (!formData.name) {
            return Taro.showToast({ title: '请输入供应商名称', icon: 'none' });
        }
        if (!formData.phone || formData.phone.length !== 11) {
            return Taro.showToast({ title: '请输入11位手机号', icon: 'none' });
        }
        if (!formData.channelCode) {
            return Taro.showToast({ title: '请输入渠道码', icon: 'none' });
        }

        Taro.showLoading({ title: '创建中...' });
        const { code, data, msg } = await supplierAdd({ ...formData });
        Taro.hideLoading();
        if(code === 200) {
            Taro.showToast({ title: '创建成功', icon: 'none' });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 })
            }, 1000)
        }else{
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }, 200)

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='创建供应商'></Navbar>

            <View className='project_group'>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>名称</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输供应商名称(必填)'
                            placeholderStyle='color: #777777;'
                            value={formData.name}
                            onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border '>
                    <View className='project_item_label project_item_label_required'>手机号</View>
                    <View className='project_item_right'>
                        <Input
                            type='number'
                            maxlength='11'
                            className='new_input new_input_phone'
                            placeholder='请输入供应商手机号(必填)'
                            placeholderStyle='color: #777777;'
                            value={formData.phone}
                            onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>渠道码</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input new_input_phone'
                            placeholder='请输入渠道码(必填)'
                            placeholderStyle='color: #777777;'
                            value={formData.channelCode}
                            onInput={(e) => setFormData({ ...formData, channelCode: e.detail.value })}
                        ></Input>
                    </View>
                </View>
            </View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View onClick={saveWorker} className={`post_btn ${(formData.name && formData.phone && formData.channelCode) ? 'post_btn_active' : ''}`}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
