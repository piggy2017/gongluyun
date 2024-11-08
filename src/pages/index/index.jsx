/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-08 11:06:09
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Input, Picker, Image, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import TimePicker from '@/components/timePicker'
import DatePicker from '@/components/datePicker'
import AgePicker from '@/components/agePicker';
import SexPicker from '@/components/sexPicker';
import CustomDate from '@/components/customDate';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/button.scss";
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'

import {
  workbenchtodayData, workbenchcluePool, workbenchdrainageData, workbenchconvertData, userCenter, todo
} from '@/util/api'


const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
    userStore: { isLogin, role, userInfo, refreshUserInfo, getRoleAndPermissionFunc }
  } = store
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeText, setTimeText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateText, setDateText] = useState("");
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [ageText, setAgeText] = useState("");

  const [showSexPicker, setShowSexPicker] = useState(false);
  const [sexText, setSexText] = useState("");

  const [showFilterDate, setShowFilterDate] = useState(false);

  const filterList = [                 // 时间筛选列表
    { text: "今日", code: "TODAY" },
    { text: "昨日", code: "YESTERDAY" },
    { text: "本周", code: "THIS_WEEK" },
    { text: "上周", code: "LAST_WEEK" },
    { text: "本月", code: "THIS_MONTH" },
    { text: "上月", code: "LAST_MONTH" },
  ];

  const [drainageDate, setDrainageDate] = useState('YESTERDAY');
  const [drainageInfo, setDrainageInfo] = useState('');      // 迎流数据
  const [transformDate, setTransformDate] = useState('YESTERDAY');
  const [convertInfo, setConvertInfo] = useState('');        // 转化数据
  const [showAddType, setShowAddType] = useState(false);

  const [todayData, setTodayData] = useState('');        //  今日数据
  const [poorData, setPoorData] = useState('');          //  线索公海

  const [todoData, setTodoData] = useState('');          //  待办

  useEffect(() => {
    console.log("首页 监听 是否登录isLogin:", isLogin);
    console.log("首页 监听 当前角色role:", role);
    console.log("首页 监听 当前用户信息userInfo:", userInfo);
    getRoleAndPermissionFunc();
  }, [isLogin, role, userInfo]);

  useEffect(() => {
    if (isLogin) {
      refreshUserInfo();
    }
  }, [isLogin])

  useEffect(() => {
    if (isLogin && (role === 'ADMIN' || role === 'SEEK')) {
      getTodayData();
      getPoorData();
    }
    if (role === 'CUSTOMER' || role === 'ON_SITE') {   // 客服、驻场待办
      todo({ companySerialCode: '' }).then(res => {
        console.log("首页 监听 待办res:", res);
        if (res?.code === 200) {
          setTodoData(res?.data);
        }
      })
    }
  }, [isLogin, role]);

  useEffect(() => {
    if (isLogin && (role === 'ADMIN' || role === 'SEEK')) {
      getdrainageData();
    }
  }, [drainageDate])

  useEffect(() => {
    if (isLogin && (role === 'ADMIN' || role === 'SEEK')) {
      getconvertData();
    }
  }, [transformDate])

  const getTodayData = async () => {   // 获取今日数据
    const { code, data } = await workbenchtodayData({ companySerialCode: '', dateRange: '' });
    console.log("获取今日数据", data);
    if (code === 200) {
      setTodayData(data);
    }
  }

  const getPoorData = async () => {    // 线索公海
    const { code, data } = await workbenchcluePool({ companySerialCode: '', dateRange: '' });
    console.log("获取今日线索公海", data);
    if (code === 200) {
      setPoorData(data);
    }
  }

  const getdrainageData = async () => {    // 获取引流数据
    const { code, data } = await workbenchdrainageData({ companySerialCode: '', dateRange: drainageDate });
    console.log("获取引流数据", data);
    if (code === 200) {
      setDrainageInfo(data);
    }
  }
  const getconvertData = async () => {    // 获取转化数据
    const { code, data } = await workbenchconvertData({ companySerialCode: '', dateRange: transformDate });
    console.log("获取转化数据", data);
    if (code === 200) {
      setConvertInfo(data);
    }
  }

  const timePickerSelect = (e) => {
    console.log("pickerSelect", e.data);
    console.log("pickerSelect", e.data.join(':'));
    setTimeText(e.data.join(':'));
  }

  const datePickerSelect = (e) => {
    console.log("seleceDate", e);
    setDateText(e);
  }

  const agePickerSelect = (e) => {
    console.log("agePickerSelect", e);
    setAgeText(e[0] + " - " + e[1]);
  }

  const sexPickerSelect = (e) => {
    console.log("sexPickerSelect", e);
    setSexText(e === "" ? "不限性别" : (e === 0 ? "男" : "女"));
  }

  const getHeight = () => {              // 获取scrollview的高度  statusTitleHeight, contenTitleHeight
    // return `calc(100vh - ${system.navBarHeight + system.navBarExtendHeight + tabHeight + topDis + 15}px)`;
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px)`;
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

  const customDateSelect = (e) => {
    console.log("自定义选择日期组件 customDateSelect", e);
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

      <ScrollView
        scrollY
        className='scrollWrapper'
        style={{ height: getHeight(), marginTop: `${statusTitleHeight + contenTitleHeight}px` }}
        scrollWithAnimation
        showScrollbar={false}
        enablePassive
      >

        <View className='search_wrapper'>
          <View className='search_con' onClick={() => navigateFunc(1, '/pages/talentsPackage/search/index')} style={`width:${role === 'CUSTOMER' ? '608rpx' : '508rpx'}`}>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            <View className='search_input' style={`width:${role === 'CUSTOMER' ? '500rpx' : '400rpx'}`}>输入关键词搜索项目、求职者</View>
          </View>

          <View className='message_notice'>
            <View className='message_notice_dot'></View>
          </View>
          {
            (role === 'ADMIN' || role === 'ON_SITE' || role === 'SEEK') &&
            <View className='add_user_icon' onClick={() => { setShowAddType(!showAddType) }}>
              {
                showAddType &&
                <View className='add_types_wrapper'>
                  <View className='add_types_item' onClick={() => navigateFunc(1, '/pages/newPackage/newWorker/index?entryChannel=SOURCE')}>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon11.webp`}></Image>
                    <View>新增求职者线索</View>
                  </View>
                  <View className='add_types_item' onClick={() => navigateFunc(1, '/pages/newPackage/newProject/index')}>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon10.webp`}></Image>
                    <View>新增招聘项目</View>
                  </View>
                  <View className='add_types_item' onClick={() => navigateFunc(1, '/pages/newPackage/newEmployee/index')}>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon9.webp`}></Image>
                    <View>新增员工账号</View>
                  </View>
                </View>
              }
            </View>
          }
        </View>

        {
          (role === "ADMIN" || role === 'SEEK') &&
          <View className='btn_wrapper'>
            <View className='btn_wrap_item' onClick={() => navigateFunc(1, '/pages/talentsPackage/talents/index')}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon4.webp`}></Image>
              <View>人才库</View>
            </View>
            <View className='btn_wrap_item' onClick={() => navigateFunc(1, '/pages/minePackage/employeeManage/index')}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon5.webp`}></Image>
              <View>员工数据</View>
            </View>
          </View>
        }

        {
          (role === "ADMIN" || role === "CUSTOMER" || role === 'SEEK') &&
          <View className='enter_wrapper'>
            <View className='enter_wrap_item' onClick={() => navigateFunc(1, '/pages/newPackage/newWorker/index?entryChannel=SOURCE')}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon6.webp`}></Image>
              <View>录入求职线索</View>
            </View>
            <View className='enter_wrap_item' style={`margin-left:230rpx;`} onClick={() => navigateFunc(1, '/pages/projectPackage/listFeedback/index')}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon7.webp`}></Image>
              <View>反馈名单</View>
            </View>
          </View>
        }

        {
          role === 'ON_SITE' &&
          <View className='enter_wrapper'>
            <View className='enter_wrap_item' onClick={() => navigateFunc(1, '/pages/projectPackage/signinCode/index')}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon40.webp`}></Image>
              <View>签到码</View>
            </View>
            <View className='enter_wrap_item'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon7.webp`}></Image>
              <View>导出名单</View>
            </View>
          </View>
        }

        {
          (role === "ADMIN" || role === 'SEEK') &&
          <View className='today_data_wrapper'>
            <View className='today_data_title'>今日数据</View>
            <View className='today_data_content'>
              <View className='today_data_item'>
                <View className='today_data_number'>{todayData ? todayData.newRecruit : '467'}</View>
                <View className='today_data_laber'>在招岗位</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>{todayData ? todayData.newEntry : '562'}</View>
                <View className='today_data_laber'>新增入职</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>{todayData ? todayData.newExit : '234'}</View>
                <View className='today_data_laber'>今日离职</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>{todayData ? todayData.newClue : '417'}</View>
                <View className='today_data_laber'>新增线索</View>
              </View>
            </View>
          </View>
        }

        {
          role === "CUSTOMER" &&
          <View className='today_data_wrapper'>
            <View className='today_data_title'>客服待办</View>
            <View className='today_data_content'>
              <View className='today_data_item'>
                <View className='today_data_number'>333</View>
                <View className='today_data_laber'>待处理</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>333</View>
                <View className='today_data_laber'>待约面</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>333</View>
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
                  <View className='today_data_number'>333</View>
                  <View className='today_data_laber'>待处理</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>333</View>
                  <View className='today_data_laber'>待约面</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>333</View>
                  <View className='today_data_laber'>待回访</View>
                </View>
              </View>
            </View>

            <View className='today_data_wrapper'>
              <View className='today_data_title'>今日数据</View>
              <View className='today_data_content'>
                <View className='today_data_item'>
                  <View className='today_data_number'>333</View>
                  <View className='today_data_laber'>已约面</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>333</View>
                  <View className='today_data_laber'>已到面</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>333</View>
                  <View className='today_data_laber'>面试通过</View>
                </View>
                <View className='today_data_item'>
                  <View className='today_data_number'>333</View>
                  <View className='today_data_laber'>已入职</View>
                </View>
              </View>
            </View>
          </>
        }

        {
          (role === "ADMIN" || role === "CUSTOMER" || role === 'SEEK') &&
          <View className='clue_sea_wrapper'>
            <View className='clue_sea_left'>
              <View className='clue_sea_title'>线索公海</View>
              <View className='clue_sea_today'>今日已领 <Text>{poorData ? poorData.todayReceived : 1}</Text> 名</View>
              <View className='clue_sea_total'>线索池共 <Text>{poorData ? poorData.totalSeeker : 32}</Text> 名求职者等待领取并跟进</View>
            </View>
            <View className='clue_sea_right' onClick={() => {
              Taro.switchTab({
                url: '/pages/clue/index'
              })
            }}>前往领取</View>
          </View>
        }

        {
          (role === "ADMIN" || role === "CUSTOMER" || role === 'SEEK') &&
          <View className='drainage_data_wrapper'>
            <View className='drainage_data_title'>
              <View className='drainage_data_title_left'>引流数据</View>
              <View className='drainage_data_title_right'>
                <View onClick={() => { setDrainageDate('YESTERDAY') }} className={`title_right_item ${drainageDate === 'YESTERDAY' ? 'title_right_item_active' : ''}`}>昨日</View>
                <View onClick={() => { setDrainageDate('THIS_WEEK') }} className={`title_right_item ${drainageDate === 'THIS_WEEK' ? 'title_right_item_active' : ''}`}>本周</View>
                <View onClick={() => { setDrainageDate('THIS_MONTH') }} className={`title_right_item ${drainageDate === 'THIS_MONTH' ? 'title_right_item_active' : ''}`}>本月</View>
              </View>
            </View>
            <View className='drainage_data_content'>
              <View className='drainage_data_content_left'>
                <View className='drainage_data_content_left_data'>{drainageInfo ? drainageInfo.interviewRate : '0'}</View>
                <View className='drainage_data_content_left_laber'>约面率</View>
              </View>
              <Image className='drainage_data_content_img' src={`${Taro.$cdnUrl}/index/index_icon8.webp`}></Image>
              <View className='drainage_data_content_right'>
                <View className='drainage_right_item'>新增报名 <Text>{drainageInfo ? drainageInfo.newSignup : '0'}</Text> 人</View>
                <View className='drainage_right_item'>跟进联系 <Text>{drainageInfo ? drainageInfo.followupContact : '0'}</Text> 人</View>
                <View className='drainage_right_item'>约定面试 <Text>{drainageInfo ? drainageInfo.newInterview : '0'}</Text> 人</View>
              </View>
            </View>
          </View>
        }

        {
          (role === "ADMIN" || role === 'SEEK') &&
          <View className='drainage_data_wrapper'>
            <View className='drainage_data_title'>
              <View className='drainage_data_title_left'>转化数据</View>
              <View className='drainage_data_title_right'>
                <View onClick={() => { setTransformDate('YESTERDAY') }} className={`title_right_item ${transformDate === 'YESTERDAY' ? 'title_right_item_active' : ''}`}>昨日</View>
                <View onClick={() => { setTransformDate('THIS_WEEK') }} className={`title_right_item ${transformDate === 'THIS_WEEK' ? 'title_right_item_active' : ''}`}>本周</View>
                <View onClick={() => { setTransformDate('THIS_MONTH') }} className={`title_right_item ${transformDate === 'THIS_MONTH' ? 'title_right_item_active' : ''}`}>本月</View>
              </View>
            </View>
            <View className='drainage_data_content'>
              <View className='drainage_data_content_left'>
                <View className='drainage_data_content_left_data'>{convertInfo ? convertInfo.arrivalRate : '0'}</View>
                <View className='drainage_data_content_left_laber'>到面率</View>
              </View>
              <Image className='drainage_data_content_img' src={`${Taro.$cdnUrl}/index/index_icon8.webp`}></Image>
              <View className='drainage_data_content_right'>
                <View className='drainage_right_item'>实际到面 <Text>{convertInfo ? convertInfo.actualArrival : '0'}</Text> 人</View>
                <View className='drainage_right_item'>面试通过 <Text>{convertInfo ? convertInfo.interviewPass : '0'}</Text> 人</View>
                <View className='drainage_right_item'>最终入职 <Text>{convertInfo ? convertInfo.finalEntry : '0'}</Text> 人</View>
              </View>
            </View>
          </View>
        }

        <View className='component_hr'>---下面是公共组件---</View>
        <View onClick={() => { setShowTimePicker(true) }}>时间选择器:{timeText}</View>
        <View onClick={() => { setShowDatePicker(true) }}>日期选择器:{dateText}</View>
        <View onClick={() => { setShowAgePicker(true) }}>年龄范围选择:{ageText}</View>
        <View onClick={() => { setShowSexPicker(true) }}>选择性别:{sexText}</View>
        <View onClick={() => { setShowFilterDate(true) }}>日期筛选:</View>

      </ScrollView>

      <TimePicker showPicker={showTimePicker} onClose={() => { setShowTimePicker(false) }} onChange={timePickerSelect} />

      <DatePicker type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>

      <AgePicker showPicker={showAgePicker} onClose={() => { setShowAgePicker(false) }} onChange={agePickerSelect}></AgePicker>

      <SexPicker showPicker={showSexPicker} onClose={() => { setShowSexPicker(false) }} onChange={sexPickerSelect}></SexPicker>

      <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>


      <TabBar actCurrent={0} />

    </View>
  )
})

export default inject('store')(Index)
