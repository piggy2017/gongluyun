/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-19 14:12:20
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import Navbar from '@/components/navbar';
import './index.scss'

const Index = observer(({ store }) => {
    const {
    } = store

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='签到码'></Navbar>
            <View className='code_content'>
                <Image src={`${Taro.$cdnUrl}/index/index_icon40.webp`}></Image>
                <View>求职者扫一扫上面二维码</View>
                <View>把已约面更新为已到面</View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
