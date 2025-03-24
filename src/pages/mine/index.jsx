/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-24 13:47:18
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { AtModal } from 'taro-ui';
import "taro-ui/dist/style/components/modal.scss";
import { View, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import './index.scss'

import { loginOut } from '@/util/api'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
    userStore: { isLogin, setIsLogin, role, setRole, setToken, userInfo, setUserInfo, companyInfo, companyVerified, setCompanyVerified, refreshUserInfo, getRoleAndPermissionFunc, setMyPermissions, myPermissions },
  } = store

  const [loginoutSure, setLoginoutSure] = useState(false);

  useEffect(() => {
    refreshUserInfo();
    console.log("userInfo", userInfo);
    console.log("companyVerified_companyInfo", companyVerified, companyInfo);
  }, [])

  usePullDownRefresh(() => {
    Taro.showLoading({
      title: '加载中',
      mask: true
    })
    refreshUserInfo();
    getRoleAndPermissionFunc();
    setMyPermissions();
    setTimeout(() => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
    }, 1500);
  })

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

  const loginoutFn = async () => {
    let res = await loginOut()
    if (res.code === 200 || res.code === 7003) {
      Taro.showToast({
        title: '退出成功',
        icon: 'none',
        duration: 2000
      })
      setToken('')
      setIsLogin(0)
      setRole('SEEK');
      setUserInfo('');
      setCompanyVerified(false);
      setLoginoutSure(false);
      Taro.setStorageSync('token', '');
      Taro.setStorageSync('isLogin', 0);
      Taro.setStorageSync('role', 'SEEK');
      Taro.setStorageSync('userInfo', '');
      Taro.setStorageSync('companyInfo', '');
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }

  const aboutFunc = () => {
    if (isLogin === 0) {
      Taro.navigateTo({
        url: '/pages/login/index'
      })
      return
    } else {
      Taro.navigateTo({ url: '/pages/minePackage/aboutUs/index' })
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
        <View className='user_info' onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
          {/* <View className='user_info_avatar'></View> */}
          <Image className='user_info_avatar' src={`${Taro.$baseCdnUrl}/personal/personal_defaultAvatar.png`}></Image>
          <View className='user_info_right'>
            <View className='user_info_name'>
              <Text>未登录</Text>
            </View>
            <View className='user_info_compony'>点击登录后使用工路云</View>
          </View>
        </View> ||
        <View className='user_info'>
          {
            role === 'SEEK' &&
            <View className='seek_avatar' onClick={() => {
              Taro.navigateTo({
                url: '/pages/workerPackage/editProfile/index'
              })
            }}>
              <Image className='seek_avatar_img' src={userInfo.avatar}></Image>
              <Image className='seek_avatar_edit' src={`${Taro.$cdnUrl}/supplier/supplier_45.webp`}></Image>
            </View> ||
            <Image className='user_info_avatar' src={userInfo.avatar}></Image>
          }
          <View className='user_info_right'>
            <View className='user_info_name'>
              <Text>{userInfo.nickName}</Text>
              {
                (role != 'SEEK' && role != 'SUPPLIER') &&
                <Text className='user_info_role'>{getRole(userInfo.userRole)}</Text>
              }
            </View>
            {
              role != 'SEEK' &&
              <View className='user_info_compony'>{companyInfo.company}</View>
            }
          </View>
          <Image className='user_info_changeRole' src={`${Taro.$cdnUrl}/supplier/supplier_18.webp`} onClick={() => {
            Taro.navigateTo({
              url: '/pages/minePackage/changeRole/index'
            })
          }}></Image>
        </View>
      }

      {
        role === 'SUPPLIER' && !companyVerified &&
        <View className='open_gongluyun' onClick={() => {
          Taro.navigateTo({
            url: '/pages/minePackage/companyAuth/index'
          })
        }}>
          <View className='open_gongluyun_title'>开通工路云</View>
          <View className='open_gongluyun_desc'>70+人资企业的选择</View>
          <View className='open_gongluyun_desc'>劳务供应链利器，从获客到交付全方位提效！</View>
          <View className='open_gongluyun_btn'>立即开通</View>
        </View>
      }

      <View className='section_group'>
        {
          (role === 'ADMIN') &&
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
        {
          (role === 'ADMIN' || role === 'CUSTOMER' || role === 'ON_SITE') &&
          <View className='section_item' onClick={() => navigateVerifiedFunc('/pages/minePackage/sourcePool/index')}>
            <View className='section_item_left'>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_47.webp`}></Image>
              <Text>资源池</Text>
            </View>
            <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
          </View>
        }
      </View>

      <View className='section_group'>
        {
          role === 'SEEK' &&
          <View className='section_item' onClick={() => navigateFunc(1, '/pages/workerPackage/signupHistory/index')}>
            <View className='section_item_left'>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_46.webp`}></Image>
              <Text>报名记录</Text>
            </View>
            <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
          </View>
        }
        <View className='section_item' onClick={aboutFunc}>
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
        {
          isLogin === 1 &&
          <View className='section_item' onClick={() => {
            if (isLogin) {
              setLoginoutSure(true);
            }
          }}>
            <View className='section_item_left'>
              <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_9.webp`}></Image>
              <Text>退出登录</Text>
            </View>
            <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
          </View>
        }
      </View>

      <View className='mine_desc_wrapper' style={`bottom:${tabbarHeight + 30}px;`}>
        <View className='mine_desc'>技术支持：成都阿朴机遇科技有限公司</View>
        {/* <View className='mine_desc'>助力企业数字化转型</View> */}
      </View>


      <TabBar actCurrent={(role === 'SUPPLIER' || role === 'SEEK' || role === 'CHANNEL') ? 1 : 3} />

      <AtModal
        isOpened={loginoutSure}
        className='loginout_box'
        catchMove
        onClose={() => setLoginoutSure(false)}

      >
        <View className='stop_wechat'>
          <View className='warn_title'>退出登录</View>
          <View className='warn_cont'>确定要退出登录吗</View>
          <View className='sure_btn' >
            <View className='cancel_btn' onClick={() => setLoginoutSure(false)}>取消</View>
            <View onClick={() => loginoutFn()}>确定</View>
          </View>
        </View>
      </AtModal>
    </View>
  )
})

export default inject('store')(Index)
