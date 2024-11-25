/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-24 13:53:39
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-25 16:28:01
 * @Description: 
 */

import React, { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { decryptData, encryptData } from '@/util/crypto'
import {
    loginPhone, loginEmployeePhone, getRoleAndPermissionByUserId
} from '@/util/api'
import './index.scss'

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { setToken, setIsLogin, setRole, setUserInfo, getRoleAndPermissionFunc, setMyPermissions }
    } = store

    const [step, setStep] = useState(1);
    const [checked, setChecked] = useState(false);

    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [ispassword, setIsPassword] = useState(true);


    const backFunc = useCallback(() => {
        console.log("backFunc", step);
        if (step === 2) {
            setStep(1);
        } else {
            Taro.navigateBack({
                delta: 1
            })
        }
    }, [step])

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
                Taro.hideLoading();
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
                    if (result.data.user.companyVerified) {
                        setTimeout(() => {
                            getUserRole();
                        }, 50);
                    } else {
                        Taro.navigateTo({ url: '/pages/auth/index' })
                    }
                } else {
                    Taro.showToast({ title: result.msg, icon: "none", duration: 2000 })
                }
            }
        } catch (error) {
            console.error('获取用户手机号失败:', error);
        }
    }

    const btnLogin = () => {
        if (!checked) {
            return Taro.showToast({ title: "请阅读并同意隐私协议", icon: "none", duration: 2000 })
        }
        if (!account || account.length < 11) {
            return Taro.showToast({ title: "请输入11位手机号", icon: "none", duration: 2000 })
        }
        if (!password) {
            return Taro.showToast({ title: "请输入密码", icon: "none", duration: 2000 })
        }
        let params = {
            phone: encryptData(account),
            password: encryptData(password), //password
        }
        Taro.showLoading({
            title: "请求中",
            mask: true
        })
        loginEmployeePhone(params).then((res) => {
            console.log("登录结果", res);
            const { code, data, msg } = res;
            Taro.hideLoading();
            if (code === 200) {
                Taro.showToast({ title: "登录成功", icon: "none", duration: 2000 })
                setToken(data.token);
                Taro.setStorageSync('token', data.token);
                Taro.setStorageSync('isLogin', 1);
                Taro.setStorageSync('role', data.user.userRole);
                Taro.setStorageSync('userInfo', data.user);
                setIsLogin(1);
                setUserInfo(data.user);
                setRole(data.user.userRole);
                getRoleAndPermissionFunc();
                if (data.user.companyVerified) {
                    setTimeout(() => {
                        getUserRole();
                    }, 50);
                } else {
                    Taro.navigateTo({ url: '/pages/auth/index' })
                }
            } else {
                Taro.showToast({ title: msg, icon: "none", duration: 2000 })
            }
        })
    }

    const getUserRole = async () => {
        setMyPermissions();
        Taro.switchTab({
            url: '/pages/index/index'
        })
    }

    const changeStep = () => {
        setStep(2);
    }

    useEffect(() => {
        console.log("step 发生了改变", step);
    }, [step])

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
                    {/* <Image onClick={() => backFunc()} src={`${Taro.$cdnBackIcon}`} ></Image> */}
                </View>
            </View>

            {
                step === 1 &&
                <>
                    <Image className='logo1' src={`${Taro.$cdnUrl}/index/index_icon55.webp`}></Image>

                    <View className='login_bottom'>
                        {
                            checked && <Button className='logn_btn' openType='getPhoneNumber' onGetPhoneNumber={handleGetPhoneNumber}>一键登录</Button> ||
                            <Button className='logn_btn' onClick={hintBtn}>一键登录</Button>
                        }
                        <Button className='employee_road' onClick={() => changeStep()}>员工通道</Button>
                        <View className='logn_policy'>
                            <Image onClick={() => setChecked(!checked)} src={`${Taro.$cdnUrl}/index/index_icon2${checked ? 7 : 8}.webp`}></Image>
                            <View onClick={() => setChecked(!checked)} >已阅读并同意</View>
                            <View className='webview_link' onClick={() => viewPrivacy()}>《公路云小程序隐私保护指引》</View>
                        </View>
                        <View style={`height:${bottomSafeAreaHeight * 2}px`}></View>
                    </View>
                </> ||
                step === 2 &&
                <>
                    <Image className='logo2' src={`${Taro.$cdnUrl}/index/index_icon56.webp`}></Image>
                    <View className='input_wrap'>
                        <Image className='input_icon' src={`${Taro.$cdnUrl}/index/index_icon45.webp`}></Image>
                        <Input
                            className='my_input'
                            type='number'
                            maxlength={11}
                            placeholder='请输入账号'
                            placeholderStyle='color: #777777;'
                            value={account}
                            onInput={(e) => setAccount(e.detail.value)}
                        ></Input>
                    </View>
                    <View className='input_wrap input_wrap_password'>
                        <Image className='input_icon' src={`${Taro.$cdnUrl}/index/index_icon46.webp`}></Image>
                        <Input
                            className='my_input'
                            placeholder='请输入密码'
                            placeholderStyle='color: #777777;'
                            value={password}
                            password={ispassword}
                            onInput={(e) => setPassword(e.detail.value)}
                        ></Input>
                        <Image onClick={() => setIsPassword(!ispassword)} className='input_clock_icon' src={`${Taro.$cdnUrl}/index/index_icon47.webp`}></Image>
                    </View>

                    <View className='logn_policy_2'>
                        <Image onClick={() => setChecked(!checked)} src={`${Taro.$cdnUrl}/index/index_icon2${checked ? 7 : 8}.webp`}></Image>
                        <View onClick={() => setChecked(!checked)} >已阅读并同意</View>
                        <View className='webview_link' onClick={() => viewPrivacy()}>《公路云小程序隐私保护指引》</View>
                    </View>

                    <Button onClick={() => btnLogin()} className={`account_login_btn ${account && password && checked ? 'account_login_btn_active' : ''}`}>登录</Button>
                </>
            }

        </View>
    )
})

export default inject('store')(Index)
