/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-18 15:58:23
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

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='关于我们'></Navbar>

            <View className='content'>
                <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_10.webp`}></Image>
                <View className='version'>版本号: v{version}</View>
            </View>

            <View className='section_group'>
                <View className='section_item' onClick={() => contactServer()}>
                    <View className='section_item_left'>
                        <Image src={`${Taro.$cdnUrl}/mine/mine_icon4.webp`}></Image>
                        <Text>企业微信</Text>
                    </View>
                    <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
                </View>
                <View className='section_item'>
                    <View className='section_item_left'>
                        <Image src={`${Taro.$cdnUrl}/mine/mine_icon5.webp`}></Image>
                        <Text onClick={() => Taro.makePhoneCall({ phoneNumber: '028-85222840' })}>公司电话： 028-85222840</Text>
                    </View>
                    {/* <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image> */}
                </View>
                <View className='section_item' >
                    <View className='section_item_left'>
                        <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_9.webp`}></Image>
                        <Text>企业邮箱：contact@apujiyu.com</Text>
                    </View>
                    {/* <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image> */}
                </View>
            </View>

            {/* <View className='contact_server' onClick={() => contactServer()}>
                <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_11.webp`}></Image>
                <View>微信客服</View>
            </View> */}
        </View>
    )
})

export default inject('store')(Index)
