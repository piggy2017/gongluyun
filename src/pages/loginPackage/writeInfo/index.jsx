/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-24 13:53:39
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-10 15:46:25
 * @Description: 
 */

import React, { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { decryptData, encryptData } from '@/util/crypto'
import {
    updateUserInfo
} from '@/util/api'
import './index.scss'

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight },
        userStore: { userInfo, setRole, filterJobTypes, setFilterJobTypes }
    } = store

    const [sex, setSex] = useState(2);
    const [age, setAge] = useState('');

    useEffect(() => {
        setSex(userInfo.sex);
        setAge(userInfo.age === 0 ? '' : userInfo.age);
        setFilterJobTypes(userInfo.jobTypes ? userInfo.jobTypes : [])
    }, [userInfo])


    useEffect(() => {
        console.log("filterJobTypes", filterJobTypes);
    }, [filterJobTypes])

    const deleteJobTypes = (index) => {
        setFilterJobTypes(filterJobTypes.filter((item, i) => i !== index))
    }

    const postWrite = async () => {
        if (sex === 2) {
            return Taro.showToast({ title: '请选择性别', icon: 'none' });
        }
        else if (age === '') {
            return Taro.showToast({ title: '请输入年龄', icon: 'none' });
        }
        else if (filterJobTypes.length === 0) {
            return Taro.showToast({ title: '请选择意向职位', icon: 'none' });
        }
        const params = {
            sex,
            age,
            jobTypeIds: filterJobTypes.map(item => item.id)
        }
        Taro.showLoading({ title: '加载中...', mask: true });
        const { code, data, msg } = await updateUserInfo(params);
        Taro.hideLoading();
        console.log("   updateUserInfo", code, data, msg);
        if (code === 200) {
            Taro.showToast({ title: '完善成功', icon: 'none' });
            setRole('SEEK');
            setTimeout(() => {   // 跳转到求职者首页
                Taro.switchTab({
                    url: '/pages/workerIndex/index'
                });
            }, 1500)
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    return (
        <View className='container'>
            <View style={`height:${statusTitleHeight + contenTitleHeight}px`}></View>
            <View className='header_desc'>
                <View>完善您的信息！</View>
                <View className='header_desc_label'>可获得更多精准高薪的工作机会哦～</View>
            </View>

            <View className='write_item'>
                <View className='write_item_label'>性别</View>
                <View className='choose_sex_content'>
                    <View className={`choose_sex_item ${sex === 0 ? 'choose_sex_item_active' : ''}`} onClick={() => { setSex(0) }}>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_2${sex === 0 ? 8 : 7}.webp`}></Image>
                        <View>男</View>
                    </View>
                    <View className={`choose_sex_item ${sex === 1 ? 'choose_sex_item_active' : ''}`} onClick={() => { setSex(1) }}>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_2${sex === 1 ? 2 : 6}.webp`}></Image>
                        <View>女</View>
                    </View>
                </View>
            </View>

            <View className='choose_age'>
                <View className='choose_age_label'>年龄</View>
                <View className='choose_age_wrap'>
                    <Input
                        type='number'
                        maxlength='2'
                        className='age_input'
                        placeholder='请输入您的年龄'
                        placeholderStyle='color: #999999;'
                        value={age}
                        onInput={(e) => setAge(e.detail.value)}
                    ></Input>
                </View>
            </View>

            <View className='choose_jobTypes'>
                <View className='choose_jobTypes_label'>
                    <View className='choose_jobTypes_label_left'> 意向岗位<Text>(最多5个)</Text></View>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_19.webp`} onClick={() => {
                        Taro.navigateTo({
                            url: "/pages/selectorPackage/jobChoose/index"
                        })
                    }}></Image>
                </View>
                {
                    filterJobTypes.length > 0 &&
                    <View className='choose_jobTypes_content'>
                        {
                            filterJobTypes.map((item, index) => {
                                return (
                                    <View className='choose_jobTypes_item' key={index}>
                                        <View>{item.name}</View>
                                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_21.webp`} onClick={() => deleteJobTypes(index)}></Image>
                                    </View>
                                )
                            })
                        }
                    </View> ||
                    <View className='choose_jobTypes_desc'>添加你的意向岗位吧</View>

                }
            </View>

            <View className={`post_btn ${(sex != 2 && age && filterJobTypes.length > 0) ? 'post_btn_active' : ''}`} onClick={postWrite}>去求职</View>



        </View>
    )
})

export default inject('store')(Index)
