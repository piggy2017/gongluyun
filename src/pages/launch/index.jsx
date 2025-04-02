/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-31 10:58:52
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import './index.scss'

const Index = observer(({ store }) => {
    const {
        userStore: { isLogin, setRole, token,getSubTemplates, role, companyVerified, refreshUserInfo },
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
                Taro.redirectTo({ url: '/pages/login/index' })
                return
            }

            getSubTemplates();

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
                refreshUserInfo((res) => {
                    console.log("auth页面res", res);
                    if (res?.data?.userInfo) {
                        const { sex, age, jobTypes } = res.data.userInfo;
                        if (sex != 2 && age && jobTypes?.length > 0) {
                            Taro.switchTab({
                                url: '/pages/workerIndex/index'
                            });
                        } else {
                            Taro.redirectTo({ url: '/pages/loginPackage/chooseRole/index' });
                        }
                    } else {
                        Taro.navigateTo({ url: '/pages/loginPackage/chooseRole/index' });
                    }
                })
                return
            }


            if (isLogin && !companyVerified) {    // 已登录但没有实名认证
                // Taro.redirectTo({ url: '/pages/auth/index' })
                console.log(5)
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
                console.log(6)
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
