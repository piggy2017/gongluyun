/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-02 16:08:25
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import './index.scss'

const Index = observer(({ store }) => {
    const {
        userStore: { isLogin, setRole, token, role, companyVerified, refreshUserInfo },
    } = store

    useEffect(() => {
        console.log("启动页 认证状态 role:", role);
        setTimeout(() => {
            // Taro.setStorageSync('role', 'CHANNEL');
            // setRole('CHANNEL');
            // Taro.switchTab({
            //     url: '/pages/channelIndex/index'
            // })
            // return;

            console.log(1)
            if (!isLogin || !token) {  // 未登录
                console.log(2)
                Taro.redirectTo({ url: '/pages/login/index' });
                return
            }

            if (role === 'ADMIN' || role === 'CUSTOMER' || role === 'ON_SITE') {    // 管理员
                Taro.switchTab({
                    url: '/pages/index/index'
                })
                return;
            }

            if (role === 'CHANNEL') {    // 渠道
                Taro.switchTab({
                    url: '/pages/channelIndex/index'
                })
                return;
            }

            if (role === 'SUPPLIER') {
                console.log(3)
                Taro.switchTab({
                    url: '/pages/supplierProject/index'
                })
                return;
            }

            else if (role === 'SEEK') {    // 求职者
                console.log(4)
                Taro.switchTab({
                    url: '/pages/workerIndex/index'
                });
                return
            }
            else {
                console.log('已经登陆但是还没有角色,前往选择角色');
                Taro.redirectTo({ url: '/pages/loginPackage/chooseRole/index' });
                return
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
