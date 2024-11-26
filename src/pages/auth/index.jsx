/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-26 09:33:36
 * @Description: 
 */
import React, { useState, useEffect, useReducer } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import Navbar from '@/components/navbar';
import './index.scss'

const Index = observer(({ store }) => {
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { statusTitleHeight, contenTitleHeight },
        userStore: { refreshUserInfo, isLogin, setIsLogin, role, companyVerified, setCompanyVerified },
    } = store

    const [showBack, setShowBack] = useState(false);

    useEffect(() => {
        console.log("auth 页面 ---");
        let historyPages = Taro.getCurrentPages();   //历史页面 路由跳转数
        console.log("historyPageshistoryPages", historyPages);
        if (historyPages.length === 1) {
            setShowBack(false);
        } else {
            setShowBack(true);
            forceUpdate();
        }
        refreshUserInfo((res) => {
            if (res?.data?.companyVerified) {
                Taro.switchTab({
                    url: '/pages/index/index'
                })
            }
        })
    }, [])

    const backFunc = () => {
        Taro.navigateBack({
            delta: 1
        })
    }


    return (
        <View className='container'>
            {/* <Navbar back={showBack} placeholder bgColor='transparent' title=''></Navbar> */}

            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    {
                        showBack && <Image onClick={() => backFunc()} src={`${Taro.$cdnBackIcon}`} ></Image>
                    }
                </View>
            </View>
            <View className='img_wrapper'>
                <View className='go_auth' onClick={() => Taro.navigateTo({ url: '/pages/minePackage/companyAuth/index' })}>立即认证</View>
            </View>
            <Image className='bottom_logo' src={`${Taro.$cdnUrl}/newIndex/newIndex_21.webp`}></Image>
        </View>
    )
})

export default inject('store')(Index)
