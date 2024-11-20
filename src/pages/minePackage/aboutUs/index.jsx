/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-20 16:01:05
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
    const [version, setVersion] = useState('1.0.0');

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

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='关于我们'></Navbar>

            <View className='content'>
                <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_10.webp`}></Image>
                <View className='version'>版本号: v{version}</View>
            </View>

            <View className='contact_server' onClick={() => contactServer()}>
                <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_11.webp`}></Image>
                <View>微信客服</View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
