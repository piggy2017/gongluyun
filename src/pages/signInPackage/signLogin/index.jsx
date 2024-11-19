/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-11-08 16:57:55
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-08 17:02:14
 * @Description: 
 */


import React, { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { decryptData, encryptData } from '@/util/crypto'
import Navbar from '@/components/navbar';
import {
    loginPhone, loginEmployeePhone, getRoleAndPermissionByUserId
} from '@/util/api'
import './index.scss'

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { setToken, setIsLogin, setRole, setUserInfo, getRoleAndPermissionFunc }
    } = store
    const [checked, setChecked] = useState(false);


    const backFunc = useCallback(() => {
        Taro.navigateBack({
            delta: 1
        })
    }, [])

    const hintBtn = () => {
        if (!checked) {
            return Taro.showToast({ title: "请阅读并同意隐私协议", icon: "none", duration: 2000 })
        }
    }

    const handleGetPhoneNumber = async (e) => {
        console.log("eeee", e);
        try {
            const info = await Taro.login();
            console.log(1, info);
            const { code, errMsg } = e.detail;
            if (errMsg === 'getPhoneNumber:ok') {
                Taro.showLoading({
                    title: "请求中",
                    mask: true
                })
                let params = {
                    loginCode: info.code,
                    phoneCode: code,
                    loginPlatform: Taro.getSystemInfoSync().platform === 'android' ? 1 : 2
                }
                console.log("一键登录,提交的参数", params)
                const result = await loginPhone(params);
                console.log("手机号码登录结果", result);
                if (result.code === 200) {
                    Taro.showToast({ title: "登录成功", icon: "none", duration: 2000 })
                    setToken(result.data.token);
                    Taro.setStorageSync('token', result.data.token);
                    Taro.setStorageSync('isLogin', 1);
                    Taro.setStorageSync('role', result.data.user.userRole);
                    Taro.setStorageSync('userInfo', result.data.user);
                    setIsLogin(1);
                    setUserInfo(result.data.user);
                    setRole(result.data.user.userRole);
                    getRoleAndPermissionFunc();
                    // setTimeout(() => {
                    //     getUserRole();
                    // }, 50);
                    setTimeout(() => {
                        Taro.navigateBack({
                            delta: 1
                        })
                    }, 1500);
                }
                Taro.hideLoading();
            }
        } catch (error) {
            console.error('获取用户手机号失败:', error);
        }
    }

    const getUserRole = async () => {
        const result = await getRoleAndPermissionByUserId();
        console.log("获取角色和权限", result);
        // return;
        Taro.navigateBack({
            delta: 1
        })
    }

    const viewPrivacy = () => {
        console.log("viewPrivacyviewPrivacy")
        // 打开隐私协议页面
        wx.openPrivacyContract({
            success: () => {   // 打开成功
                console.log('打开隐私协议页面成功')
            },
            fail: () => {   // 打开失败
                console.log('打开隐私协议页面失败')
            },
            complete: () => { }
        })
    }

    return (
        <View className='container'>
            {/* <Navbar fixed placeholder bgColor='transparent' title='' customBack={() => backFunc()}></Navbar> */}
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <Image onClick={() => backFunc()} src={`${Taro.$cdnBackIcon}`} ></Image>
                </View>
            </View>

            <Image className='logo1' src={`${Taro.$cdnUrl}/index/index_icon55.webp`}></Image>

            <View className='login_bottom'>
                {
                    checked && <Button className='logn_btn' openType='getPhoneNumber' onGetPhoneNumber={handleGetPhoneNumber}>一键登录</Button> ||
                    <Button className='logn_btn' onClick={hintBtn}>一键登录</Button>
                }
                <View className='logn_policy'>
                    <Image onClick={() => setChecked(!checked)} src={`${Taro.$cdnUrl}/index/index_icon2${checked ? 7 : 8}.webp`}></Image>
                    <View onClick={() => setChecked(!checked)} >已阅读并同意</View>
                    <View className='webview_link' onClick={() => viewPrivacy()}>《公路云小程序隐私保护指引》</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight * 2}px`}></View>
            </View>

        </View>
    )
})

export default inject('store')(Index)
