/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-19 17:23:54
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
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/button.scss";
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'


const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
    userStore: { isLogin, role }
  } = store
  const [i, seti] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeText, setTimeText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateText, setDateText] = useState("");
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [ageText, setAgeText] = useState("");

  const [showSexPicker, setShowSexPicker] = useState(false);
  const [sexText, setSexText] = useState("");

  const [showFilterDate, setShowFilterDate] = useState(false);
  const [customFilterData, setCustomFilterData] = useState('');
  const [filterTime, setFilterTime] = useState('');

  const filterList = [                 // 时间筛选列表
    { text: "今日", code: "TODAY" },
    { text: "昨日", code: "YESTERDAY" },
    { text: "本周", code: "THIS_WEEK" },
    { text: "上周", code: "LAST_WEEK" },
    { text: "本月", code: "THIS_MONTH" },
    { text: "上月", code: "LAST_MONTH" },
  ];


  const [searchValue, setSearchValue] = useState('');
  const [drainageData, setDrainageData] = useState('昨日');
  const [transformData, setTransformData] = useState('昨日');
  const [showAddType, setShowAddType] = useState(false);


  const clickFunc = (type) => {
    if (type === "add") {
      counterStore();
    } else if (type === "addparams") {
      counterParams(25);
    } else {
      decrement();
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

  const onCustomDateChange = (e) => {
    console.log("onCustomDateChange", e);
    setFilterTime('');
    setCustomFilterData(e.detail.value);
  }

  const clickFilterDate = (obj, index) => {
    setFilterTime(obj.text);
    setCustomFilterData('');
  }

  const getHeight = () => {              // 获取scrollview的高度  statusTitleHeight, contenTitleHeight
    // return `calc(100vh - ${system.navBarHeight + system.navBarExtendHeight + tabHeight + topDis + 15}px)`;
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px)`;
  }


  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          {
            isLogin === 0 ?
              <View>未登录</View> :
              <View>已登录</View>
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
          <View className='search_con' style={`width:${role === 'service' ? '608rpx' : '508rpx'}`}>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            <Input className='search_input'
              style={`width:${role === 'service' ? '500rpx' : '400rpx'}`}
              placeholder='输入关键词搜索项目、求职者'
              confirmType='search'
              placeholderStyle='color: #777777;'
              onInput={(e) => { setSearchValue(e.detail.value) }}
              onConfirm={(e) => {
              }}
              value={searchValue}></Input>
          </View>

          <View className='message_notice'>
            <View className='message_notice_dot'></View>
          </View>
          {
            (role === 'admin' || role === 'onSite') &&
            <View className='add_user_icon' onClick={() => { setShowAddType(!showAddType) }}>
              {
                showAddType &&
                <View className='add_types_wrapper'>
                  <View className='add_types_item'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon11.webp`}></Image>
                    <View>新增求职者线索</View>
                  </View>
                  <View className='add_types_item'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon10.webp`}></Image>
                    <View>新增招聘项目</View>
                  </View>
                  <View className='add_types_item'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon9.webp`}></Image>
                    <View>新增员工账号</View>
                  </View>
                </View>
              }
            </View>
          }
        </View>

        {
          role === "admin" &&
          <View className='btn_wrapper'>
            <View className='btn_wrap_item'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon4.webp`}></Image>
              <View>人才库</View>
            </View>
            <View className='btn_wrap_item'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon5.webp`}></Image>
              <View>员工数据</View>
            </View>
          </View>
        }

        {
          (role === "admin" || role === "service") &&
          <View className='enter_wrapper'>
            <View className='enter_wrap_item'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon6.webp`}></Image>
              <View>录入求职线索</View>
            </View>
            <View className='enter_wrap_item' style={`margin-left:230rpx;`}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon7.webp`}></Image>
              <View>反馈名单</View>
            </View>
          </View>
        }

        {
          role === 'onSite' &&
          <View className='enter_wrapper'>
            <View className='enter_wrap_item'>
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
          role === "admin" &&
          <View className='today_data_wrapper'>
            <View className='today_data_title'>今日数据</View>
            <View className='today_data_content'>
              <View className='today_data_item'>
                <View className='today_data_number'>333</View>
                <View className='today_data_laber'>在招岗位</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>333</View>
                <View className='today_data_laber'>新增入职</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>333</View>
                <View className='today_data_laber'>今日离职</View>
              </View>
              <View className='today_data_item'>
                <View className='today_data_number'>333</View>
                <View className='today_data_laber'>新增线索</View>
              </View>
            </View>
          </View>
        }

        {
          role === "service" &&
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
          role === 'onSite' &&
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
          (role === "admin" || role === "service") &&
          <View className='clue_sea_wrapper'>
            <View className='clue_sea_left'>
              <View className='clue_sea_title'>线索公海</View>
              <View className='clue_sea_today'>今日已领 <Text>1</Text> 名</View>
              <View className='clue_sea_total'>线索池共 <Text>32</Text> 名求职者等待领取并跟进</View>
            </View>
            <View className='clue_sea_right'>前往领取</View>
          </View>
        }

        {
          (role === "admin" || role === "service") &&
          <View className='drainage_data_wrapper'>
            <View className='drainage_data_title'>
              <View className='drainage_data_title_left'>引流数据</View>
              <View className='drainage_data_title_right'>
                <View onClick={() => { setDrainageData('昨日') }} className={`title_right_item ${drainageData === '昨日' ? 'title_right_item_active' : ''}`}>昨日</View>
                <View onClick={() => { setDrainageData('本周') }} className={`title_right_item ${drainageData === '本周' ? 'title_right_item_active' : ''}`}>本周</View>
                <View onClick={() => { setDrainageData('本月') }} className={`title_right_item ${drainageData === '本月' ? 'title_right_item_active' : ''}`}>本月</View>
              </View>
            </View>
            <View className='drainage_data_content'>
              <View className='drainage_data_content_left'>
                <View className='drainage_data_content_left_data'>74.2%</View>
                <View className='drainage_data_content_left_laber'>约面率</View>
              </View>
              <Image className='drainage_data_content_img' src={`${Taro.$cdnUrl}/index/index_icon8.webp`}></Image>
              <View className='drainage_data_content_right'>
                <View className='drainage_right_item'>新增报名 <Text>52</Text> 人</View>
                <View className='drainage_right_item'>跟进联系 <Text>52</Text> 人</View>
                <View className='drainage_right_item'>约定面试 <Text>52</Text> 人</View>
              </View>
            </View>
          </View>
        }

        {
          role === "admin" &&
          <View className='drainage_data_wrapper'>
            <View className='drainage_data_title'>
              <View className='drainage_data_title_left'>转化数据</View>
              <View className='drainage_data_title_right'>
                <View onClick={() => { setTransformData('昨日') }} className={`title_right_item ${transformData === '昨日' ? 'title_right_item_active' : ''}`}>昨日</View>
                <View onClick={() => { setTransformData('本周') }} className={`title_right_item ${transformData === '本周' ? 'title_right_item_active' : ''}`}>本周</View>
                <View onClick={() => { setTransformData('本月') }} className={`title_right_item ${transformData === '本月' ? 'title_right_item_active' : ''}`}>本月</View>
              </View>
            </View>
            <View className='drainage_data_content'>
              <View className='drainage_data_content_left'>
                <View className='drainage_data_content_left_data'>74.2%</View>
                <View className='drainage_data_content_left_laber'>约面率</View>
              </View>
              <Image className='drainage_data_content_img' src={`${Taro.$cdnUrl}/index/index_icon8.webp`}></Image>
              <View className='drainage_data_content_right'>
                <View className='drainage_right_item'>新增报名 <Text>52</Text> 人</View>
                <View className='drainage_right_item'>跟进联系 <Text>52</Text> 人</View>
                <View className='drainage_right_item'>约定面试 <Text>52</Text> 人</View>
              </View>
            </View>
          </View>
        }


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

      <AtFloatLayout catchMove className='data_init_layout' isOpened={showFilterDate} onClose={() => setShowFilterDate(false)}>
        <View className='filter_wrapper'>
          <View className='filter_wrapper_bg'>
            <View className='filter_title'>
              <View>按时间筛选</View>
              <AtIcon value='close' size='14' color='#222222'></AtIcon>
            </View>
            <View className='filter_wrapper_content'>
              {
                filterList.map((item, index) => {
                  return (
                    <View
                      key={index}
                      className={`filter_wrapper_item ${filterTime === item.text ? 'filter_wrapper_item_active' : ''}`}
                      onClick={() => clickFilterDate(item, index)}
                    >{item.text}</View>
                  )
                })
              }
            </View>
            <View className={`custom_filter_date ${customFilterData ? 'custom_filter_date_active' : ''}`}>
              <Picker mode='date' onChange={onCustomDateChange}>
                <View className='picker'>
                  指定日期{customFilterData ? ':' + customFilterData : ''}
                </View>
              </Picker>
            </View>
          </View>
        </View>
      </AtFloatLayout>

      <TabBar actCurrent={0} />

    </View>
  )
})

export default inject('store')(Index)
