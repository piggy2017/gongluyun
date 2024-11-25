/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-25 16:06:55
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import './index.scss'

const Index = observer(({ store }) => {
    const {
        userStore: { isLogin, setIsLogin, role, companyVerified, setCompanyVerified },
    } = store

    useEffect(() => {
        console.log("启动页 isLogin companyVerified", isLogin, companyVerified);
        setTimeout(() => {
            if (!isLogin) {  // 未登录
                Taro.redirectTo({ url: '/pages/login/index' })
            }
            if (isLogin && !companyVerified) {    // 已登录但没有实名认证
                Taro.redirectTo({ url: '/pages/auth/index' })
            }
        }, 200);
    }, [])


    return (
        <View className='container'>
            <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_18.webp`}></Image>
        </View>
    )
})

export default inject('store')(Index)
