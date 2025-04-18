/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-18 16:21:52
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import Navbar from '@/components/navbar';
import './index.scss'

const Index = observer(({ store }) => {
    const {
        userStore: { isLogin },
    } = store
    const [version, setVersion] = useState('2.1.0');

    useEffect(() => {
        const accountInfo = wx.getAccountInfoSync();

        const miniProgramVersion = accountInfo.miniProgram.version; // 当前小程序的版本号
        const miniProgramEnv = accountInfo.miniProgram.envVersion; // 当前小程序的运行环境

        if (miniProgramVersion) {
            setVersion(miniProgramVersion);
        }

        console.log('当前版本号:', miniProgramVersion);
        console.log('当前环境:', miniProgramEnv);
    }, [])

    const contactServer = () => {
        wx.openCustomerServiceChat({
            extInfo: { url: 'https://work.weixin.qq.com/kfid/kfca38b8093d6d6ddfd' },
            corpId: 'ww958ac0ea597ea128',
            success(res) {
                console.log("openCustomerServiceChat res", res);
            },
            fail(err) {
                console.log("openCustomerServiceChat err", err);
            }
        })
    }

    const goAbout = () => {
        Taro.navigateTo({ url: '/pages/minePackage/aboutUs/index' })
    }

    return (
        <View className='container'>
            <Navbar fixed  bgColor='transparent' title=''></Navbar>
            <Image mode='widthFix' className='company_intro' src={`${Taro.$cdnUrl}/supplier/supplier_93.webp`} ></Image>
        </View>
    )
})

export default inject('store')(Index)
