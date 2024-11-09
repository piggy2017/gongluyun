/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-11-08 16:57:55
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-09 17:22:41
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';

import './index.scss'

const Index = observer(({ store }) => {
    const router = useRouter();
    useEffect(() => {
        const { title, interviewDate } = router.params;
        console.log('router.params', router.params);
    }, [])

    return (
        <View className='container'>
            <Image className='success_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_6.webp`}></Image>
            <View className='title'>已签到</View>
            <View className='subtitle'>你已成功签到，请继续面试流程</View>
            <View className='interview_info'>
                <View className='interview_info_item'>
                    <View className='interview_info_item_label'>报名岗位</View>
                    <View>{router.params.title}</View>
                </View>
                <View className='interview_info_item'>
                    <View className='interview_info_item_label'>面试日期</View>
                    <View>{router.params.interviewDate}</View>
                </View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
