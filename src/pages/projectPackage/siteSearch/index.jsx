/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-08 15:27:47
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-10 14:20:43
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, authentication }
  } = store

  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(175);
  const [bottomHeight, setBottomHeight] = useState(90);

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);

  const [list, setList] = useState([
    { id: 1, userName: "高小光", status: 1, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 2, userName: "高小光", status: 2, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 3, userName: "高小光", status: 3, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 4, userName: "高小光", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 5, userName: "高小光5", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 6, userName: "高小光6", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 7, userName: "高小光7", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
  ])

  const [currentCliskstatus, setCurrentCliskstatus] = useState('');                 // 选中的列表

  const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
    console.log('滑动到了最底部');
  }, 500);

  const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
    console.log('下拉刷新');
  }, 200);

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight }px - 82rpx)`;
  }

  const getStatus = (status) => {
    switch (status) {
      case 2:
        return '已签到';
      case 3:
        return '面试通过';
      case 4:
        return '面试失败';
    }
  }

  const getColor = (status) => {
    switch (status) {
      case 2:
        return '#1678FF';
      case 3:
        return '#FF7C32';
      case 4:
        return '#F00000';
    }
  }

  const showOptionFunc = (e, obj, index) => {
    e.stopPropagation();
    setList(list => {
      let _list = list.map((item, i) => {
        item.showOptions = i === index ? !item.showOptions : false
        return item
      })
      return _list
    })
  }

  const callUser = (e, obj) => {
    e.stopPropagation();
    Taro.makePhoneCall({
      phoneNumber: obj.phone
    })
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View className='search_content'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            <Input className='search_input'
              placeholder='搜索姓名、手机号、身份证号'
              confirmType='search'
              placeholderStyle='color: #777777;'
              onInput={(e) => { setSearchValue(e.detail.value) }}
              onConfirm={(e) => {
              }}
              value={searchValue}></Input>
          </View>
        </View>
      </View>

      <View className='search_title'>搜索结果</View>


      <ScrollView
        scrollY
        className='scrollWrapper'
        style={{ height: getHeight() }}
        scrollWithAnimation
        showScrollbar={false}
        enablePassive
        refresherEnabled
        refresherTriggered={isRefresh}
        onScrollToLower={handleScrollToLower}
        onRefresherRefresh={handleScrollToUpper}
        lowerThreshold={300}
      >
        {
          list.length > 0 && list.map((item, index) => {
            return (
              <View className='roster_item' key={index} style={`padding:30rpx 40rpx 30rpx 68rpx;`}>
                <View className='roster_item_wrap'>
                  <View className='roster_item_wrap_left'>
                    <View className='roster_item_title'>
                      <View className='item_title_index'>{index + 1}</View>
                      <View className='item_title_left'>
                        <View className='item_title_name'>{item.userName}</View>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                        <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                      </View>
                    </View>
                    <View className='roster_item_detail'>
                      <View className='roster_item_detail_content'>{item.detail}</View>
                    </View>
                    <View className='roster_item_job'>{item.jobName}</View>
                    <View className='roster_item_time'>面试时间：{item.interviewTime}</View>
                  </View>
                  <View className='roster_item_wrap_right'>
                    {
                      item.status === 1 &&
                      <View className='roster_item_detail_status1'>签到</View> ||
                      <View className='roster_item_detail_status' style={{ color: getColor(item.status) }} onClick={(e) => showOptionFunc(e, item, index)}>
                        <View>{getStatus(item.status)}</View>
                        <AtIcon value='chevron-down' size='14' color={getColor(item.status)}></AtIcon>
                      </View>
                    }
                  </View>

                  {
                    item.showOptions &&
                    <View className='item_status_options'>
                      <View className='item_status_options_wrap'>
                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已约面')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon50.webp`}></Image>
                            <View style={{ color: '#08B5FF' }}>已约面</View>
                          </View>
                          {
                            currentCliskstatus === '已约面' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已签到')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                            <View style={{ color: '#1678FF' }}>已签到</View>
                          </View>
                          {
                            currentCliskstatus === '已签到' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试通过')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                            <View style={{ color: '#FF6B17' }}>面试通过</View>
                          </View>
                          {
                            currentCliskstatus === '面试通过' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试失败')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                            <View style={{ color: '#F00000' }}>面试失败</View>
                          </View>
                          {
                            currentCliskstatus === '面试失败' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>
                      </View>
                    </View>
                  }
                </View>
              </View>
            )
          })
        }
      </ScrollView>
    </View>
  )
})

export default inject('store')(Index)
