/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-24 15:01:40
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import './index.scss'

const Index = observer(({ store }) => {
    const {
        userStore: { isLogin, setIsLogin, token, role, companyVerified, refreshUserInfo },
    } = store

    useEffect(() => {
        console.log("启动页 当前登录状态 isLogin:", isLogin, companyVerified);
        console.log("启动页 当前 token:", token);
        console.log("启动页 认证状态 companyVerified:", companyVerified);
        setTimeout(() => {
            if (role === 'SUPPLIER') {
                Taro.switchTab({
                    url: '/pages/supplierProject/index'
                })
                return
            }

            if (!isLogin || !token) {  // 未登录
                Taro.redirectTo({ url: '/pages/login/index' })
            }
            if (isLogin && !companyVerified) {    // 已登录但没有实名认证
                // Taro.redirectTo({ url: '/pages/auth/index' })
                refreshUserInfo((res) => {
                    console.log("auth页面res", res);
                    if (res?.data?.companyVerified) {
                        Taro.switchTab({
                            url: '/pages/index/index'
                        })
                    } else {
                        Taro.redirectTo({ url: '/pages/auth/index' })
                    }
                })
            } else if (isLogin && companyVerified) {
                Taro.switchTab({
                    url: '/pages/index/index'
                })
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
