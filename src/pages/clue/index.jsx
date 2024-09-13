/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 10:53:33
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import ClueItem from '@/components/items/clueItem'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, authentication }
  } = store
  const [type, setType] = useState('客户池');

  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(127);

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);

  const [list, setList] = useState([
    { id: 1, userName: "客户0974", time: "今天", source: "小红书" },
    { id: 2, userName: "客户0974", time: "今天", source: "微信岗位链接报名-小李", signUpJob: "成都龙泉驿京西仓库分拣" },
    { id: 3, userName: "客户0974", time: "今天", source: "小红书" },
    { id: 4, userName: "客户0974", time: "今天", source: "微信岗位链接报名-小李", signUpJob: "成都龙泉驿京西仓库分拣" }
  ])

  const [sourceList, setSourceList] = useState(['全部来源', '抖音直播', '小红书', 'BOSS直聘', '微信私域', '58同城', 'BOSS直聘', '微信私域', '58同城']);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

  useEffect(() => {
    setTimeout(async () => {
      const _query = await selectorQueryDomInfo('.search_wrapper');
      if (_query?.height) {
        console.log("_query_query_query", _query.height);
        setSearchHeight(_query.height)
      }
    }, 0);
  }, [isLogin, authentication])

  const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
    console.log('滑动到了最底部');
  }, 500);

  const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
    console.log('下拉刷新');
  }, 200);

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight + searchHeight}px)`;
  }

  const getBottom = () => {
    return `${tabbarHeight + 30}px`;
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View onClick={() => { setType('客户池') }} className={`type_item ${type === '客户池' ? 'type_item_active' : ''}`}>客户池</View>
          <View onClick={() => { setType('我的客户') }} className={`type_item ${type === '我的客户' ? 'type_item_active' : ''}`}>我的客户</View>
        </View>
      </View>

      <View className='search_wrapper'>
        <View style={`height: 12rpx;`}></View>
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
        <View className='filter_wrapper'>
          <View className='filter_wrap_item' onClick={() => setShowSourceModel(true)}>
            <View>{sourceList[sourceIndex]}</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
          <View className='filter_wrap_item'>
            <View>全部岗位</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
          <View className='filter_wrap_item'>
            <View>今日</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
        </View>

      </View>

      {
        (!isLogin || !authentication) &&
        <View className='no_login'>
          <Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image>
          <View className='no_login_tip'>认证后立即体验项目管理功能</View>
          <View className='login_btn' onClick={() => { Taro.navigateTo({ url: '/pages/login/index' }) }}>立即登录</View>
        </View> ||
        (isLogin && authentication) &&
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
            (isLogin === 1 && authentication === 1 && list.length>0) &&
            <View className='search_total'>客户池共 <Text>172</Text> 名求职者等待领取并跟进</View>
          }
          {
            list.length > 0 && list.map((item, index) => {
              return <ClueItem index={index} item={item}></ClueItem>
            })
          }

          {
            list.length >= 4 &&
            <View className='loading_text'>
              {
                goonLoad ?
                  <>
                    <AtIcon value='loading-3' size='16' color='#8E8E93'></AtIcon>
                    加载中
                  </> :
                  "数据已经到底了"
              }
            </View>
          }
          {
            list.length === 0 &&
            <View className='no_data'>
              <View><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
              <View>暂无相关数据~</View>
            </View>
          }
        </ScrollView>
      }

      <Image style={{ bottom: getBottom() }} className='add_clue_btn' src={`${Taro.$cdnUrl}/index/add_clue.webp`}></Image>

      {/* 线索来源 */}
      <AtFloatLayout catchMove className='source_init_layout' isOpened={showSourceModel} onClose={() => setShowSourceModel(false)}>
        <View className='filter_wrapper'>
          <View className='filter_wrapper_bg'>
            <View className='filter_title'>
              <View>按性别筛选</View>
              <AtIcon value='close' size='14' color='#222222' onClick={() => setShowSourceModel(false)}></AtIcon>
            </View>
            <View className='filter_wrapper_content'>
              {
                sourceList.map((item, index) => {
                  return (
                    <View
                      key={index}
                      className={`filter_wrapper_item ${index === sourceIndex ? 'filter_wrapper_item_active' : ''}`}
                      onClick={() => setSourceIndex(index)}
                    >{item}</View>
                  )
                })
              }
            </View>
            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
          </View>
        </View>
      </AtFloatLayout>

      <TabBar actCurrent={2} />
    </View>
  )
})

export default inject('store')(Index)
