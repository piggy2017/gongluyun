/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-08 17:35:28
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Image, Button, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import './index.scss'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, companyVerified }
  } = store

  const navigateFunc = (type, url) => {
    if (type) {   // 需要校验用户是否登录
      if (isLogin === 0) {
        Taro.navigateTo({
          url: '/pages/login/index'
        })
        return
      }
    }
    Taro.navigateTo({
      url
    })
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
        </View>
      </View>

      <View className='user_info'>
        <View className='user_info_avatar'></View>
        <View className='user_info_right'>
          <View className='user_info_name'>
            <Text>{isLogin ? '已认证' : '未登录'}</Text>
            {isLogin ? <Text className='user_info_role'>管理员</Text> : ''}
          </View>
          <View className='user_info_compony'>{isLogin ? '成都xxxx科技有限公司' : '点击登录后使用招小帮'}</View>
        </View>
      </View>

      <View className='section_group'>
        <View className='section_item' onClick={() => navigateFunc(1, '/pages/minePackage/employeeManage/index')}>
          <View className='section_item_left'>
            <Image src={`${Taro.$cdnUrl}/mine/mine_icon1.webp`}></Image>
            <Text>员工管理</Text>
          </View>
          <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
        </View>
        <View className='section_item' onClick={() => navigateFunc(1, '/pages/minePackage/componyManage/index')}>
          <View className='section_item_left'>
            <Image src={`${Taro.$cdnUrl}/mine/mine_icon2.webp`}></Image>
            <Text>企业设置</Text>
          </View>
          <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
        </View>
        <View className='section_item'>
          <View className='section_item_left'>
            <Image src={`${Taro.$cdnUrl}/mine/mine_icon3.webp`}></Image>
            <Text>我的套餐</Text>
          </View>
          <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
        </View>
      </View>

      <View className='section_group'>
        <View className='section_item'>
          <View className='section_item_left'>
            <Image src={`${Taro.$cdnUrl}/mine/mine_icon4.webp`}></Image>
            <Text>关于我们</Text>
          </View>
          <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
        </View>
        <View className='section_item' onClick={() => navigateFunc(1, '/pages/minePackage/feedback/index')}>
          <View className='section_item_left'>
            <Image src={`${Taro.$cdnUrl}/mine/mine_icon5.webp`}></Image>
            <Text>意见反馈</Text>
          </View>
          <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
        </View>
        <View className='section_item'>
          <View className='section_item_left'>
            <Image src={`${Taro.$cdnUrl}/mine/mine_icon6.webp`}></Image>
            <Text>注销账号</Text>
          </View>
          <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
        </View>
      </View>
      <TabBar actCurrent={3} />
    </View>
  )
})

export default inject('store')(Index)
