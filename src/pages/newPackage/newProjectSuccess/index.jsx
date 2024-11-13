/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-13 09:53:41
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro,{useRouter} from '@tarojs/taro';
import { View, Image, Text, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import Navbar from '@/components/navbar';
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store
    const router = useRouter();

    useEffect(()=>{
        const { serialCode } = router.params;
        console.log("serialCode", serialCode);
    },[])

    const goLink = (type) => {
        Taro.redirectTo({
            url: type === 1 ? `/pages/projectPackage/projectDetail/index?contractsSerialCode=${router.params.serialCode}` : '/pages/newPackage/newProject/index'
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title=''></Navbar>
            <View className='success_info'>
                <Image src={`${Taro.$cdnUrl}/index/index_icon51.webp`}></Image>
                <View>项目发布成功</View>
            </View>

            <View className='btns'>
                <View className='btn btn_blue' onClick={() => goLink(1)}>查看订单详情</View>
                <View className='btn btn_back' onClick={() => goLink(2)}>再发一个</View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
