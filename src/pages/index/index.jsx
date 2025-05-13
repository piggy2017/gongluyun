/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-13 13:36:03
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { View, Text, Input, Picker, Image, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import './index.scss'

import {
  workbenchtodayData, workbenchcluePool, todo, onSiteTodayData, customerTodo, dashDrainageData, feedBackInfoSta
} from '@/util/api'


const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
    userStore: { isLogin, role, userInfo, companyInfo, companyVerified, refreshUserInfo, getRoleAndPermissionFunc, setMyPermissions, myPermissions },
    businessStore: { setSourceList }
  } = store

  const [drainageDate, setDrainageDate] = useState('TODAY');
  // const [drainageDate, setDrainageDate] = useState('YESTERDAY');
  const [transformDate, setTransformDate] = useState('YESTERDAY');
  const [showAddType, setShowAddType] = useState(false);

  const [todayData, setTodayData] = useState('');        //  今日数据
  const [poorData, setPoorData] = useState('');          //  线索公海

  const [todoData, setTodoData] = useState('');          //  驻场待办
  const [siteTodayData, setSiteTodayData] = useState('');          //  驻场今日数据
  const [customerTodoData, setCustomerTodoData] = useState('');          //  客户待办
  const [streamData, setStreamData] = useState('');

  const [feedbackInfo, setFeedbackInfo] = useState({       //  【未接待】展示接待成员反馈统计
    feedbackCount: 0,
    noFeedBackMemberCount: 0
  });

  useEffect(() => {
    console.log("首页 监听 是否登录isLogin:companyVerified", companyVerified, isLogin);
    console.log("首页 监听 当前角色role:", role);
    console.log("首页 监听 当前用户信息userInfo:", userInfo);
    if (isLogin) {
      getRoleAndPermissionFunc();
    }

  }, [isLogin, role, userInfo]);

  Taro.useShareAppMessage(res => {
    console.log("求职者分享 userInfo.userSerialCode", userInfo, userInfo?.userSerialCode);
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    let url = `/pages/workerIndex/index?recruitSerialCode=''&inviteRole=SEEK&source=WECHAT_MINI_SHARE&agentSerialCode=${userInfo?.userSerialCode ? userInfo.userSerialCode : ''}`;
    return {
      title: '这儿有很多优质岗位,快来看看吧',
      imageUrl: `${Taro.$baseCdnUrl}/entrust/share_back.jpeg`, // 图片 URL
      path: url
    }
  })

  usePullDownRefresh(() => {
    console.log("下拉刷新");
    if (isLogin) {
      Taro.showLoading({
        title: '加载中',
        mask: true
      })
      getRoleAndPermissionFunc();
      if (role === 'ADMIN' || role === 'SEEK') {
        getTodayData();
        getPoorData();
        getDashDrainageData();
        // getconvertData();
      }
      if (role === 'CUSTOMER') {   // 客服
        getCustomerTodo();
        getPoorData();
        getDashDrainageData();
      }
      if (role === 'ON_SITE') {  // 驻场
        getOnSiteToDo();
        getOnSiteData();
      }
    }
    setTimeout(() => {
      Taro.hideLoading();
      // 数据加载完成后停止下拉刷新
      Taro.stopPullDownRefresh();
    }, 1500);
    // Taro.stopPullDownRefresh();
  })

  useDidShow(() => {
    if (isLogin) {
      refreshUserInfo();
      // getUserRole();
      setMyPermissions();
      setSourceList();
    }
    if (isLogin && (role === 'ADMIN' || role === 'SEEK')) {
      getTodayData();
      getPoorData();
      getDashDrainageData();
      // getconvertData();
    }
    if (role === 'CUSTOMER') {   // 客服
      getCustomerTodo();
      getPoorData();
      getDashDrainageData();
    }
    if (role === 'ON_SITE') {    // 驻场
      getOnSiteToDo();
      getOnSiteData();
    }
  })

  useEffect(() => {
    if (isLogin) {
      refreshUserInfo();
      // getUserRole();
      setMyPermissions();
      setSourceList();

      getfeedbackData();
    }
  }, [isLogin])

  // useEffect(() => {
  //   if (isLogin && (role === 'ADMIN' || role === 'SEEK')) {
  //     getTodayData();
  //     getPoorData();
  //     getDashDrainageData();
  //     // getconvertData();
  //   }
  //   if (role === 'CUSTOMER') {   // 客服
  //     getCustomerTodo();
  //     getPoorData();
  //     getDashDrainageData();
  //   }
  //   if (role === 'ON_SITE') {    // 驻场
  //     getOnSiteToDo();
  //     getOnSiteData();
  //   }
  // }, [isLogin, role]);

  useEffect(() => {
    if (isLogin && (role === 'ADMIN' || role === 'SEEK' || role === 'CUSTOMER')) {
      getDashDrainageData();
    }
  }, [drainageDate])

  useEffect(() => {
    if (isLogin && (role === 'ADMIN' || role === 'SEEK')) {
      // getconvertData();
    }
  }, [transformDate])

  const getfeedbackData = async () => {
    const { code, data } = await feedBackInfoSta({});
    console.log("获取反馈数据-getfeedbackData:", code, data);
    if (code === 200) {
      setFeedbackInfo(data);
    }
  }


  const getDashDrainageData = async () => {      // 获取引流与转化数据
    const { code, data, msg } = await dashDrainageData({ companySerialCode: companyInfo.companySerialCode, dateRange: drainageDate });
    console.log("获取引流与转化数据", data);
    if (code === 200 && data) {
      setStreamData(data);
    } else {
      Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
    }
  }

  const getCustomerTodo = async () => {    // 获取客服待办
    const { code, data } = await customerTodo({ type: 'EMPLOYING_UNIT', companySerialCode: companyInfo.companySerialCode, dateRange: 'TODAY' });
    console.log("getCustomerTodo-获取客服待办", data);
    if (code === 200) {
      setCustomerTodoData(data);
    }
  }

  const getOnSiteData = async () => {  // 获取驻场今日数据
    const { code, data } = await onSiteTodayData({ type: 'EMPLOYING_UNIT', companySerialCode: companyInfo.companySerialCode, dateRange: 'TODAY' });
    console.log("getOnSiteData-获取驻场今日数据", data);
    if (code === 200) {
      setSiteTodayData(data);
    }
  }

  const getOnSiteToDo = async () => {    // 获取驻场待办
    const { code, data } = await todo({ type: 'EMPLOYING_UNIT', companySerialCode: companyInfo.companySerialCode, dateRange: 'TODAY' });
    console.log("getOnSiteToDo-获取驻场待办", data);
    if (code === 200) {
      setTodoData(data);
    }
  }

  const getTodayData = async () => {   // 获取今日数据
    const { code, data } = await workbenchtodayData({ companySerialCode: companyInfo.companySerialCode, dateRange: 'TODAY' });
    console.log("获取今日数据", data);
    if (code === 200) {
      setTodayData(data);
    }
  }

  const getPoorData = async () => {    // 线索公海
    const { code, data } = await workbenchcluePool({ companySerialCode: companyInfo.companySerialCode, dateRange: 'TODAY' });
    console.log("获取今日线索公海", data);
    if (code === 200) {
      setPoorData(data);
    }
  }

  const getHeight = () => {              // 获取scrollview的高度  statusTitleHeight, contenTitleHeight
    // return `calc(100vh - ${system.navBarHeight + system.navBarExtendHeight + tabHeight + topDis + 15}px)`;
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px)`;
  }

  const navigateFunc = (type, url, data) => {
    if (type) {   // 需要校验用户是否登录
      if (isLogin === 0) {
        Taro.navigateTo({
          url: '/pages/login/index'
        })
        return
      }
    }
    if (data) {
      Taro.switchTab({
        url
      })
    } else {
      Taro.navigateTo({
        url
      })
    }
  }

  const navigateVerifiedFunc = (url) => {
    console.log("navigateVerifiedFunc_companyVerified", companyVerified);
    if (isLogin === 0) {
      Taro.navigateTo({
        url: '/pages/login/index'
      })
      return
    }

    if (!companyVerified) {
      Taro.showToast({
        title: '请先完成企业认证',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/minePackage/companyAuth/index'
        })
      }, 1500);
    } else {
      Taro.navigateTo({
        url
      })
    }
  }
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

  const feedBackList = () => {
    if (isLogin === 0) {
      Taro.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    Taro.navigateTo({
      url: `/pages/newPackage/newInterviewWorker/index`
    })
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          {
            (!isLogin || role === 'SEEK') &&
            <View className='default_logo'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon60.webp`}></Image>
            </View> ||
            <View className='user_infos'>
              <Image src={userInfo?.avatar}></Image>
              <View>{userInfo.nickName ? userInfo.nickName : ''}</View>
              <View className='role_tag'>{getRole(userInfo.userRole)}</View>
            </View>
          }
        </View>
      </View>

      <View
        // scrollY
        className='scrollWrapper'
        style={{ height: getHeight(), marginTop: `${statusTitleHeight + contenTitleHeight}px` }}
      // scrollWithAnimation
      // showScrollbar={false}
      // enablePassive
      >

        <View className='search_wrapper'>
          <View className='search_con' onClick={() => navigateVerifiedFunc('/pages/talentsPackage/search/index')} style={`width:${role === 'CUSTOMER' ? '608rpx' : '608rpx'}`}>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            <View className='search_input' style={`width:${role === 'CUSTOMER' ? '500rpx' : '400rpx'}`}>输入关键词搜索项目、求职者</View>
          </View>

          {/* <View className='message_notice'>
            <View className='message_notice_dot'></View>
          </View> */}
          {
            (role === 'ADMIN' || role === "CUSTOMER" || role === 'ON_SITE' || role === 'CHANNEL') &&
            <View className='add_user_icon' onClick={() => {
              if (!isLogin) {
                Taro.navigateTo({
                  url: '/pages/login/index'
                })
                return
              }
              setShowAddType(!showAddType);
            }}>
              {
                showAddType &&
                <View className='add_types_wrapper'>
                  {
                    myPermissions.includes('6') &&
                    <View className='add_types_item' onClick={() => navigateVerifiedFunc(`${role === 'ON_SITE' ? '/pages/newPackage/newWorker/index?entryChannel=SOURCE&onSite=1' : '/pages/newPackage/newWorker/index?entryChannel=SOURCE'}`)}>
                      <Image src={`${Taro.$cdnUrl}/index/index_icon11.webp`}></Image>
                      <View>新增求职者线索</View>
                    </View>
                  }
                  {
                    myPermissions.includes('9') &&
                    <View className='add_types_item' onClick={() => navigateVerifiedFunc('/pages/newPackage/newProject/index')}>
                      <Image src={`${Taro.$cdnUrl}/index/index_icon10.webp`}></Image>
                      <View>新增招聘项目</View>
                    </View>
                  }
                  {
                    role === 'ADMIN' &&
                    <View className='add_types_item' onClick={() => navigateVerifiedFunc('/pages/newPackage/newEmployee/index')}>
                      <Image src={`${Taro.$cdnUrl}/index/index_icon9.webp`}></Image>
                      <View>新增员工账号</View>
                    </View>
                  }
                </View>
              }
            </View>
          }
        </View>

        <View className='entry_wrapper'>
          {
            myPermissions.includes('4') &&
            <View className='entry_item' onClick={() => navigateVerifiedFunc('/pages/talentsPackage/talents/index')}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_1.webp`}></Image>
              <View>人才库</View>
            </View>
          }
          {
            myPermissions.includes('5') &&
            <View className='entry_item' onClick={() => navigateVerifiedFunc('/pages/minePackage/dataReport/index')}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_2.webp`}></Image>
              <View>员工数据</View>
            </View>
          }
          {
            myPermissions.includes('18') &&
            <View className='entry_item' onClick={() => navigateVerifiedFunc('/pages/supplierPackage/supplierManage/index')}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_3.webp`}></Image>
              <View>供应商</View>
            </View>
          }
          {
            myPermissions.includes('6') &&
            <View className='entry_item' onClick={() => navigateVerifiedFunc('/pages/newPackage/newWorker/index?entryChannel=SOURCE')}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_4.webp`}></Image>
              <View>求职登记</View>
            </View>
          }
          {
            myPermissions.includes('7') &&
            <View className='entry_item' onClick={feedBackList}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_5.webp`}></Image>
              <View>面试录入</View>
            </View>
          }
          {
            myPermissions.includes('8') &&
            <View className='entry_item' onClick={() => navigateFunc(1, '/pages/newPackage/onSiteProject/index?type=2')}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_6.webp`}></Image>
              <View>签到码</View>
            </View>
          }
          {
            myPermissions.includes('20') && role === 'ON_SITE' &&
            <View className='entry_item' onClick={() => navigateFunc(1, '/pages/channelOnsiteList/index', 2)}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_7.webp`}></Image>
              <View>导出名单</View>
            </View>
          }
          {
            myPermissions.includes('9') &&
            <View className='entry_item' onClick={() => navigateVerifiedFunc('/pages/newPackage/newProject/index')}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_index_8.webp`}></Image>
              <View>新增招聘</View>
            </View>
          }
        </View>

        {
          // (role === "ADMIN" || role === "CUSTOMER") &&
          // <View className='btn_wrapper'>
          //   {
          //     role === "ADMIN" &&
          //     <View className='btn_wrap_item' onClick={() => navigateVerifiedFunc('/pages/talentsPackage/talents/index')}>
          //       <Image src={`${Taro.$cdnUrl}/index/index_icon4.webp`}></Image>
          //       <View>人才库</View>
          //     </View>
          //   }

          //   <View className='btn_wrap_item' onClick={() => navigateVerifiedFunc('/pages/minePackage/dataReport/index')}>
          //     <Image src={`${Taro.$cdnUrl}/index/index_icon5.webp`}></Image>
          //     <View>员工数据</View>
          //   </View>
          //   {
          //     role === "ADMIN" &&
          //     <View className='btn_wrap_item' onClick={() => navigateVerifiedFunc('/pages/supplierPackage/supplierManage/index')}>
          //       <Image src={`${Taro.$cdnUrl}/supplier/supplier_1.webp`}></Image>
          //       <View>供应商</View>
          //     </View>
          //   }
          // </View>
        }

        {
          // (role === "ADMIN" || role === "CUSTOMER") &&
          // <View className='enter_wrapper'>
          //   <View className='enter_wrap_item' onClick={() => navigateVerifiedFunc('/pages/newPackage/newWorker/index?entryChannel=SOURCE')}>
          //     <Image src={`${Taro.$cdnUrl}/index/index_icon6.webp`}></Image>
          //     <View>录入求职线索</View>
          //   </View>
          //   <View className='enter_wrap_item' style={`margin-left:190rpx;`} onClick={feedBackList}>
          //     <Image src={`${Taro.$cdnUrl}/index/index_icon7.webp`}></Image>
          //     <View>录入面试信息</View>
          //   </View>
          // </View>
        }

        {
          // role === 'ON_SITE' &&  // /pages/talentsPackage/filterJob/index?type=6&title=选择岗位  
          // <View className='enter_wrapper'>
          //   <View className='enter_wrap_item' onClick={() => navigateFunc(1, '/pages/newPackage/onSiteProject/index?type=2')}>
          //     <Image src={`${Taro.$cdnUrl}/index/index_icon40.webp`}></Image>
          //     <View>签到码</View>
          //   </View>
          //   <View className='enter_wrap_item' onClick={() => navigateFunc(1, '/pages/onSiteList/index', 2)}>
          //     <Image src={`${Taro.$cdnUrl}/index/index_icon7.webp`}></Image>
          //     <View>导出名单</View>
          //   </View>
          // </View>
        }

        {
          role === "ADMIN" &&
          <>
            <View className='today_data_wrapper'>
              <View className='today_data_title'>数据统计</View>
              <View className='today_data_content'>
                <View className='today_data_item' onClick={() => {
                  Taro.setStorageSync("acticeProject", true);
                  Taro.switchTab({
                    url: '/pages/projectManage/index'
                  })
                }}>
                  <View className='today_data_number'>{todayData ? todayData.newRecruit : '0'}</View>
                  <View className='today_data_laber'>在招岗位</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>{todayData ? todayData.newEntry : '0'}</View>
                  <View className='today_data_laber'>今日入职</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>{todayData ? todayData.newExit : '0'}</View>
                  <View className='today_data_laber'>今日离职</View>
                </View>
                <View className='today_data_item' onClick={() => {
                  Taro.setStorageSync("poor", true);
                  Taro.switchTab({
                    url: '/pages/clue/index'
                  })
                }}>
                  <View className='today_data_number'>{todayData ? todayData.newClue : '0'}</View>
                  <View className='today_data_laber'>今日线索</View>
                </View>
              </View>
            </View>
            <View className='today_data_wrapper'>
              <View className='today_data_title'>求职者反馈</View>
              <View className='today_data_feedback' onClick={() => {
                Taro.navigateTo({
                  url: '/pages/talentsPackage/interceptionFeedback/index'
                })
              }}>
                <View className='today_data_feedback_item'>
                  <View>{feedbackInfo.noFeedBackMemberCount}</View>
                  <View className='feedback_item_label'>员工总数</View>
                </View>
                <View className='today_data_feedback_item'>
                  <View>{feedbackInfo.feedbackCount}</View>
                  <View className='feedback_item_label'>接待未反馈</View>
                </View>
              </View>
            </View>
          </>
        }

        {
          role === "CUSTOMER" &&
          <View className='today_data_wrapper'>
            <View className='today_data_title'>客服待办</View>
            <View className='today_data_content'>
              <View className='today_data_item' onClick={() => {
                Taro.setStorageSync("poor", true);
                Taro.switchTab({
                  url: '/pages/clue/index'
                })
              }}>
                <View className='today_data_number'>{customerTodoData.todoHandle ? customerTodoData.todoHandle : 0}</View>
                <View className='today_data_laber'>待领取</View>
              </View>
              <View className='today_data_item' onClick={() => {
                Taro.setStorageSync("myClient", true);
                Taro.switchTab({
                  url: '/pages/clue/index'
                })
              }}>
                <View className='today_data_number'>{customerTodoData.todoInterview ? customerTodoData.todoInterview : 0}</View>
                <View className='today_data_laber'>待约面</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>{customerTodoData.todoStable ? customerTodoData.todoStable : 0}</View>
                <View className='today_data_laber'>待回访</View>
              </View>
            </View>
          </View>
        }
        {
          role === 'ON_SITE' &&
          <>
            <View className='today_data_wrapper'>
              <View className='today_data_title'>驻场待办</View>
              <View className='today_data_content' style={`padding: 0 58rpx`}>
                <View className='today_data_item'>
                  <View className='today_data_number'>{todoData.todoChecked ? todoData.todoChecked : 0}</View>
                  <View className='today_data_laber'>待签到</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>{todoData.interviewFollowUp ? todoData.interviewFollowUp : 0}</View>
                  <View className='today_data_laber'>面试跟进</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>{todoData.onboardingFollowUp ? todoData.onboardingFollowUp : 0}</View>
                  <View className='today_data_laber'>入职跟进</View>
                </View>
              </View>
            </View>

            <View className='today_data_wrapper'>
              <View className='today_data_title'>今日数据</View>
              <View className='today_data_content'>
                <View className='today_data_item'>
                  <View className='today_data_number'>{siteTodayData.sinterviewCounts ? siteTodayData.sinterviewCounts : 0}</View>
                  <View className='today_data_laber'>已约面</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>{siteTodayData.alreadyArrivedCounts ? siteTodayData.alreadyArrivedCounts : 0}</View>
                  <View className='today_data_laber'>已到面</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>{siteTodayData.interviewPassCounts ? siteTodayData.interviewPassCounts : 0}</View>
                  <View className='today_data_laber'>面试通过</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>{siteTodayData.deliveredCounts ? siteTodayData.deliveredCounts : 0}</View>
                  <View className='today_data_laber'>已入职</View>
                </View>
              </View>
            </View>
          </>
        }

        {
          role === "ADMIN" &&
          <View className='clue_sea_wrapper'>
            <View className='clue_sea_left'>
              <View className='clue_sea_title'>线索公海</View>
              <View className='clue_sea_today'>今日已领 <Text>{poorData ? poorData.todayReceived : 0}</Text> 名</View>
              <View className='clue_sea_total'>线索池共 <Text>{poorData ? poorData.totalSeeker : 0}</Text> 名求职者等待领取并跟进</View>
            </View>
            <View className='clue_sea_right' onClick={() => {
              Taro.setStorageSync("poor", true);
              Taro.switchTab({
                url: '/pages/clue/index'
              })
            }}>前往领取</View>
          </View>
        }

        {
          (role === "ADMIN" || role === "CUSTOMER") &&
          <View className='stream_wrapper'>
            <View className='stream_title'>
              <View>引流与转化</View>
              <View className='stream_title_right'>
                <View onClick={() => { setDrainageDate('TODAY') }} className={`title_right_item ${drainageDate === 'TODAY' ? 'title_right_item_active' : ''}`}>今日</View>
                <View onClick={() => { setDrainageDate('YESTERDAY') }} className={`title_right_item ${drainageDate === 'YESTERDAY' ? 'title_right_item_active' : ''}`}>昨日</View>
                <View onClick={() => { setDrainageDate('THIS_WEEK') }} className={`title_right_item ${drainageDate === 'THIS_WEEK' ? 'title_right_item_active' : ''}`}>本周</View>
                <View onClick={() => { setDrainageDate('THIS_MONTH') }} className={`title_right_item ${drainageDate === 'THIS_MONTH' ? 'title_right_item_active' : ''}`}>本月</View>
                <View onClick={() => { setDrainageDate('') }} className={`title_right_item ${drainageDate === '' ? 'title_right_item_active' : ''}`}>全部</View>
              </View>
            </View>

            <View className='stream_content'>
              <View className='stream_content_item'>
                <View>{streamData.interviewRate}%</View>
                <View className='stream_content_item_label'>约面率</View>
              </View>
              <View className='stream_content_item'>
                <View>{streamData.arrivalRate}%</View>
                <View className='stream_content_item_label'>到面率</View>
              </View>
              <View className='stream_content_item'>
                <View>{streamData.employedRate}%</View>
                <View className='stream_content_item_label'>入职率</View>
              </View>
            </View>

            <View className='stream_num_wapper'>
              <View className='stream_num_item'>新增报名 <Text>{streamData.newSignup}</Text> 人</View>
              <View className='stream_num_item'>跟进联系 <Text>{streamData.followupContact}</Text> 人</View>
              <View className='stream_num_item'>约定面试 <Text>{streamData.newInterview}</Text> 人</View>
              <View className='stream_num_item'>实际到面 <Text>{streamData.actualArrival}</Text> 人</View>
              <View className='stream_num_item'>面试通过 <Text>{streamData.interviewPass}</Text> 人</View>
              <View className='stream_num_item'>最终入职 <Text>{streamData.finalEntry}</Text> 人</View>
            </View>
          </View>
        }
        <View style={`height:50rpx;`}></View>
      </View>

      <Taro.SubscribeMsg></Taro.SubscribeMsg>

      <TabBar actCurrent={0} />
    </View>
  )
})

export default inject('store')(Index)
