/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-19 16:48:37
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import './index.scss'

import { } from '@/util/api';

const Index = observer(({ store }) => {
  const route = useRouter();
  const {
    baseStore: { bottomSafeAreaHeight },
    businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
    userStore: { companyInfo }
  } = store

  return (
    <View className='container'>
      <Navbar whiteIcon fixed placeholder bgColor='transparent' title='供应商管理' titleColor='#FFFFFF'></Navbar>

      <View className='page_title'>我的合作端口</View>
      <View className='my_port'>
        <View className='my_port_left'>
          <View className='my_port_left_logo'></View>
          <View className='my_port_left_text'>{companyInfo.company}</View>
        </View>
        <Image className='my_port_right' src={`${Taro.$cdnUrl}/supplier/supplier_3.webp`}></Image>
      </View>
      <View className='supplier_title'>
        <View>我的供应商</View>
        <View className='supplier_title_right'>
          <Image src={`${Taro.$cdnUrl}/supplier/supplier_6.webp`}></Image>
          <View>邀请供应商加入</View>
        </View>
      </View>
    </View>
  )
})

export default inject('store')(Index)
