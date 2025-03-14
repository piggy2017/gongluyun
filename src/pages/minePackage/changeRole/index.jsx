/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-24 13:53:39
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-12 11:34:43
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { } from '@/util/api'
import './index.scss'

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight },
        userStore: { supplierCompanyInfo, getSupplierCompanyInfo, refreshUserInfo, setRole, userInfo, role, companyInfo, companyVerified, setCompanyVerified, }
    } = store

    useEffect(() => {
        getSupplierCompanyInfo();
    }, [])

    const chooseRole = (type) => {
        if (type === 1) {         // 求职者
            // 判断用户是否需要填写信息
            Taro.showLoading({ title: '加载中...' });
            refreshUserInfo((res) => {
                console.log("auth页面res", res);
                Taro.hideLoading();
                setRole('SEEK');
                Taro.setStorageSync('role', 'SEEK');
                if (res?.data?.userInfo) {
                    const { sex, age, jobTypes } = res.data.userInfo;
                    if (sex != 2 && age && jobTypes?.length > 0) {
                        Taro.switchTab({
                            url: '/pages/workerIndex/index'
                        });
                    } else {
                        Taro.navigateTo({ url: '/pages/loginPackage/writeInfo/index' })
                    }
                } else {
                    Taro.navigateTo({ url: '/pages/loginPackage/writeInfo/index' })
                }
            })
        } else if (type === 2) {  // 企业
            Taro.showLoading({ title: '加载中...' })
            refreshUserInfo((res) => {
                console.log("auth页面res", res);
                Taro.hideLoading();
                if (res?.data?.companyVerified) {
                    Taro.setStorageSync('role', res.data.userInfo.userRole);
                    setRole(res.data.userInfo.userRole);
                    Taro.switchTab({
                        url: '/pages/index/index'
                    })
                } else {
                    Taro.showToast({
                        title: '请先认证企业信息',
                        icon: 'none'
                    })
                    setTimeout(() => {
                        Taro.navigateTo({ url: '/pages/auth/index' })
                    }, 1500);
                }
            })
        } else if (type === 3) {  // 供应商
            setRole('SUPPLIER');
            Taro.setStorageSync('role', 'SUPPLIER')
            Taro.switchTab({
                url: '/pages/supplierProject/index'
            })
        }
    }

    return (
        <View className='container'>
            <View style={`height:${statusTitleHeight + contenTitleHeight}px`}></View>
            <View className='header_t'>
                <View>切换身份</View>
                <View className='header_t_label'>让服务实时匹配您的需求</View>
            </View>

            <View className='choose_wrapper'>
                {
                    role === 'SEEK' &&
                    <>
                        <View className='choose_item' onClick={() => chooseRole(2)}>
                            <View className='choose_item_left'>
                                <Image src={`${Taro.$cdnUrl}/supplier/supplier_24.webp`}></Image>
                                <View>我是企业</View>
                            </View>
                            <Image className='choose_item_right' src={`${Taro.$cdnUrl}/supplier/supplier_20.webp`}></Image>
                        </View>
                        {
                            supplierCompanyInfo?.serialCode &&
                            <View className='choose_item' onClick={() => chooseRole(3)}>
                                <View className='choose_item_left'>
                                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_25.webp`}></Image>
                                    <View>我是供应商</View>
                                </View>
                                <Image className='choose_item_right' src={`${Taro.$cdnUrl}/supplier/supplier_20.webp`}></Image>
                            </View>
                        }
                    </> ||
                    role === 'SUPPLIER' &&
                    <>
                        <View className='choose_item' onClick={() => chooseRole(1)}>
                            <View className='choose_item_left'>
                                <Image src={`${Taro.$cdnUrl}/supplier/supplier_23.webp`}></Image>
                                <View>我是求职者</View>
                            </View>
                            <Image className='choose_item_right' src={`${Taro.$cdnUrl}/supplier/supplier_20.webp`}></Image>
                        </View>
                        <View className='choose_item' onClick={() => chooseRole(2)}>
                            <View className='choose_item_left'>
                                <Image src={`${Taro.$cdnUrl}/supplier/supplier_24.webp`}></Image>
                                <View>我是企业</View>
                            </View>
                            <Image className='choose_item_right' src={`${Taro.$cdnUrl}/supplier/supplier_20.webp`}></Image>
                        </View>
                    </> ||
                    <>
                        <View className='choose_item' onClick={() => chooseRole(1)}>
                            <View className='choose_item_left'>
                                <Image src={`${Taro.$cdnUrl}/supplier/supplier_23.webp`}></Image>
                                <View>我是求职者</View>
                            </View>
                            <Image className='choose_item_right' src={`${Taro.$cdnUrl}/supplier/supplier_20.webp`}></Image>
                        </View>
                        {
                            supplierCompanyInfo?.serialCode &&
                            <View className='choose_item' onClick={() => chooseRole(3)}>
                                <View className='choose_item_left'>
                                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_25.webp`}></Image>
                                    <View>我是供应商</View>
                                </View>
                                <Image className='choose_item_right' src={`${Taro.$cdnUrl}/supplier/supplier_20.webp`}></Image>
                            </View>
                        }
                    </>
                }
            </View>
        </View>
    )
})

export default inject('store')(Index)
