/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-15 15:51:28
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
    userStore: { isLogin, role, userInfo, companyInfo, companyVerified }
  } = store

  useEffect(() => {
    console.log("userInfo", userInfo);
    console.log("companyVerified_companyInfo", companyVerified, companyInfo);
  }, [])

  const getRole = (type) => {
    if (type === 'ADMIN') {
      return '管理员'
    } else if (type === 'CUSTOMER') {
      return '客服'
    } else if (type === 'ON_SITE') {
      return '驻厂'
    } else if (type === 'SUPPLIER') {
      return '供应商'
    }
  }

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

  const navigateVerifiedFunc = (url) => {
    if (isLogin === 0) {
      Taro.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    if (!companyVerified) {
      Taro.showToast({ title: '请先完成企业认证', icon: 'none', duration: 2000 })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/minePackage/companyAuth/index'
        })
      }, 1500);
    } else {
      Taro.navigateTo({ url })
    }
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
        </View>
      </View>


      {
        !isLogin &&
        <View className='user_info'>
          <View className='user_info_avatar'></View>
          <View className='user_info_right'>
            <View className='user_info_name'>
              <Text>未登录</Text>
            </View>
            <View className='user_info_compony'>点击登录后使用工路云</View>
          </View>
        </View> ||
        <View className='user_info'>
          <Image className='user_info_avatar' src={userInfo.avatar}></Image>
          <View className='user_info_right'>
            <View className='user_info_name'>
              <Text>{userInfo.nickName}</Text>
              <Text className='user_info_role'>{getRole(userInfo.userRole)}</Text>
            </View>
            <View className='user_info_compony'>{companyInfo.company}</View>
          </View>
        </View>
      }

      <View className='section_group'>
        {
          (role === 'ADMIN' || role === 'SEEK') &&
          <>
            <View className='section_item' onClick={() => navigateVerifiedFunc('/pages/minePackage/employeeManage/index')}>
              <View className='section_item_left'>
                <Image src={`${Taro.$cdnUrl}/mine/mine_icon1.webp`}></Image>
                <Text>员工管理</Text>
              </View>
              <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
            </View>
            <View className='section_item' onClick={() => navigateVerifiedFunc('/pages/minePackage/componyManage/index')}>
              <View className='section_item_left'>
                <Image src={`${Taro.$cdnUrl}/mine/mine_icon2.webp`}></Image>
                <Text>企业设置</Text>
              </View>
              <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
            </View>
          </>
        }

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
