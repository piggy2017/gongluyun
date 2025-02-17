/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-17 17:10:32
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

import {  } from '@/util/api';

const Index = observer(({ store }) => {
  const route = useRouter();
  const {
    baseStore: { bottomSafeAreaHeight },
    businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
    userStore: { myPermissions }
  } = store

  return (
    <View className='container'>
      <Navbar whiteIcon fixed placeholder bgColor='transparent' title='供应商管理' titleColor='#FFFFFF'></Navbar>

    </View>
  )
})

export default inject('store')(Index)
