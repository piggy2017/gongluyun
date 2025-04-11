/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:50:07
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-11 13:44:05
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { AtModal, AtFloatLayout, AtIcon } from 'taro-ui';
import "taro-ui/dist/style/components/modal.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/icon.scss";
import { View, Text, Image, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import './index.scss'

import { loginOut, switchRoles } from '@/util/api'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, setIsLogin, role, setRole, userRoles, setUserRoles, setToken, userInfo, setUserInfo, companyInfo, companyVerified, setCompanyVerified, refreshUserInfo, getRoleAndPermissionFunc, setMyPermissions, myPermissions },
  } = store

  const [loginoutSure, setLoginoutSure] = useState(false);
  const [showRoleModel, setShowRoleModel] = useState(false);
  const [currentRoles, setCurrentRoles] = useState([]);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    let _list = userRoles.map((item, index) => {
      item.isSelected = false;
      if (item.roleName === role) {
        item.isSelected = true;
      }
      return item;
    })
    setCurrentRoles(_list);
  }, [userRoles, role])

  useEffect(() => {
    console.log("userInfo", userInfo);
    console.log("companyVerified_companyInfo", companyVerified, companyInfo);
  }, [])

  useDidShow(() => {
    if (isLogin) refreshUserInfo();
  })

  usePullDownRefresh(() => {
    Taro.showLoading({
      title: '加载中',
      mask: true
    })
    if (isLogin) {
      refreshUserInfo();
      getRoleAndPermissionFunc();
      setMyPermissions();
    }

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
    } else if (type === 'CHANNEL') {
      return '渠道'
    }
  }

  const navigateFunc = (type, url) => {
    if (type) {   // 需要校验用户是否登录
      if (isLogin === 0) {
        // Taro.navigateTo({
        //   url: '/pages/login/index'
        // })
        setIsOpened(true);
        return
      }
    }
    Taro.navigateTo({
      url
    })
  }
  const onClose = (e) => {
    if (e === 'success') {
      // forceUpdate()
    }
    setIsOpened(false)
  }

  const navigateVerifiedFunc = (url) => {
    if (isLogin === 0) {
      // Taro.navigateTo({
      //   url: '/pages/login/index'
      // })
      setIsOpened(true);
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
      setRole('');
      setUserInfo('');
      setCompanyVerified(false);
      setLoginoutSure(false);
      Taro.setStorageSync('token', '');
      Taro.setStorageSync('isLogin', 0);
      Taro.setStorageSync('role', '');
      Taro.setStorageSync('userInfo', '');
      Taro.setStorageSync('companyInfo', '');
      Taro.redirectTo({ url: '/pages/launch/index' })
    }
  }

  const aboutFunc = () => {
    if (isLogin === 0) {
      // Taro.navigateTo({
      //   url: '/pages/login/index'
      // })
      setIsOpened(true);
      return
    } else {
      Taro.navigateTo({ url: '/pages/minePackage/aboutUs/index' })
    }
  }

  const chooseRoleFunc = async (obj, index) => {
    console.log("当前点击:", obj, index);
    if (obj.roleName === role) {
      return;
    }
    setCurrentRoles(currentRoles.map((item, i) => {
      item.isSelected = i === index ? true : false;
      return item;
    }))

    Taro.showLoading({ title: '切换中...', mask: true });
    const { code, data, msg } = await switchRoles({ userRole: obj.roleName });
    Taro.hideLoading();
    console.log("切换角色:", code, data, msg);
    if (code === 200) {
      setRole(data);
      Taro.setStorageSync('role', data);
      Taro.switchTab({
        url: data === 'CHANNEL' ? '/pages/channelIndex/index' : '/pages/index/index'
      })
    } else {
      Taro.showToast({ title: msg, icon: 'none' })
    }
    setShowRoleModel(false);
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
        <View className='user_info' onClick={() => {
          setIsOpened(true);
          // Taro.navigateTo({ url: '/pages/login/index' })
        }}>
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

        {
          userRoles.length >= 2 && isLogin === 1 && role != 'SEEK' && role != 'SUPPLIER' &&
          <View className='section_item' onClick={() => setShowRoleModel(true)}>
            <View className='section_item_left'>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_79.webp`}></Image>
              <Text>切换角色</Text>
            </View>
            <View className='section_item_right'>
              <View>{getRole(role)}</View>
              <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
            </View>
          </View>
        }
      </View>

      <View className='section_group'>
        {
          role === 'SEEK' &&
          <>
            <View className='section_item' onClick={() => navigateFunc(1, '/pages/workerPackage/editProfile/index')}>
              <View className='section_item_left'>
                <Image src={`${Taro.$cdnUrl}/supplier/supplier_87.webp`}></Image>
                <Text>修改简历</Text>
              </View>
              <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
            </View>
            <View className='section_item' onClick={() => navigateFunc(1, '/pages/workerPackage/signupHistory/index')}>
              <View className='section_item_left'>
                <Image src={`${Taro.$cdnUrl}/supplier/supplier_46.webp`}></Image>
                <Text>报名记录</Text>
              </View>
              <Image src={`https://apu-mini.oss-cn-hangzhou.aliyuncs.com/personal/right_arow.webp`} className='right_arow'></Image>
            </View>
          </>
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
        {/* <View className='mine_desc'>助力企业数字化转型</View> role === 'SUPPLIER' ||  */}
      </View>

      <TabBar actCurrent={(role === 'SEEK' || role === 'CHANNEL') ? 2 : role === 'SUPPLIER' ? 1 : 4} />
      <Taro.SubscribeMsg></Taro.SubscribeMsg>

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

      <Block>
        <AtFloatLayout catchMove className='mine_role_init_layout' isOpened={showRoleModel} onClose={() => { setShowRoleModel(false) }}>
          <View className='filter_wrapper'>
            <View className='filter_wrapper_bg'>
              <View className='filter_title'>
                <View>选择角色</View>
                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowRoleModel(false) }}></AtIcon>
              </View>
              <View className='filter_wrapper_content'>
                {
                  currentRoles.map((item, index) => {
                    return (
                      <View
                        key={index}
                        className={`filter_wrapper_item ${item.isSelected ? 'filter_wrapper_item_active' : ''}`}
                        onClick={() => chooseRoleFunc(item, index)}
                      >{item.name}</View>
                    )
                  })
                }
              </View>
              <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
          </View>
        </AtFloatLayout>
      </Block>

      <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} />
    </View>
  )
})

export default inject('store')(Index)
