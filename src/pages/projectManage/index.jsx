/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-08 17:44:04
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
    userStore: { isLogin, authentication }
  } = store
  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(34);

  const [typeList, setTypeList] = useState(['全部状态', '进行中', '已结束']);
  const [typeIndex, setTypeIndex] = useState(0);
  const [showChangeType, setShowChangeType] = useState(false);              //  是否显示切换状态的弹窗

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [list, setList] = useState([
    { id: 1, type: 1, name: "龙泉驿区招物流分拣全职月结", status: "招聘中", port: 311, interview: 79, pass: 13, signUp: 5, },
    { id: 2, type: 2, name: "龙泉驿区招物流分拣全职月结", status: "招聘中", port: 311, interview: 79, pass: 13, signUp: 5, compony: '成都翔科食品有限公司' },
    { id: 3, type: 1, name: "龙泉驿区招物流分拣全职月结", status: "招聘中", port: 311, interview: 79, pass: 13, signUp: 5, },
    { id: 4, type: 1, name: "龙泉驿区招物流分拣全职月结", status: "招聘中", port: 311, interview: 79, pass: 13, signUp: 5, },
  ])

  const [type, setType] = useState('进行中');

  useEffect(() => {
    setTimeout(async () => {
      const _query = await selectorQueryDomInfo('.search_wrap');
      console.log("_query_query_query", _query);
      if (_query?.height) {
        setSearchHeight(_query.height)
      }
    }, 0);
  }, [])

  const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
    console.log('滑动到了最底部');
  }, 500);

  const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
    console.log('下拉刷新');
  }, 200);

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight + searchHeight}px)`;
  }

  const navigateFunc = (e, url) => {
    // if (type) {   // 需要校验用户是否登录
    //   if (isLogin === 0) {
    //     Taro.navigateTo({
    //       url: '/pages/login/index'
    //     })
    //     return
    //   }
    // }
    e.stopPropagation();
    Taro.navigateTo({
      url
    })
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View onClick={() => setType('进行中')} className={`header_item ${type === '进行中' ? 'header_item_active' : ''}`}>进行中</View>
          <View onClick={() => setType('已结束')} className={`header_item ${type === '已结束' ? 'header_item_active' : ''}`}>已结束</View>
        </View>
      </View>
      <View className='search_wrap'>
        <View className='search_con'>
          <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
          <Input className='search_input'
            placeholder='搜索关键字搜索订单'
            confirmType='search'
            placeholderStyle='color: #777777;'
            onInput={(e) => { setSearchValue(e.detail.value) }}
            onConfirm={(e) => {
            }}
            value={searchValue}></Input>
        </View>
        <Image className='add_icon' src={`${Taro.$cdnUrl}/index/index_icon3.webp`} onClick={(e) => navigateFunc(e, '/pages/newPackage/newProject/index')}></Image>
        {/* <View className='search_type_wrap' onClick={() => setShowChangeType(true)}>
          <View>{typeList[typeIndex]}</View>
          <AtIcon value='chevron-down' size='14' color='#222222'></AtIcon>
        </View> */}
      </View>
      {
        (!isLogin || !authentication) &&
        <View className='no_login'>
          <Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image>
          <View className='no_login_tip'>认证后立即体验项目管理功能</View>
          <View className='login_btn' onClick={() => { Taro.navigateTo({ url: '/pages/login/index' }) }}>立即登录</View>
        </View> ||
        isLogin && authentication &&
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
                <View className='project_item' key={index} onClick={(e) => navigateFunc(e, '/pages/projectPackage/projectDetail/index')}>
                  <View className='project_item_title'>
                    <View className='project_item_title_left'>
                      {/* {
                        item.type === 2 &&
                        <View className='project_item_title_left_icon'>接单</View>
                      } */}
                      <View className='project_item_title_left_name'>{item.name}</View>
                    </View>
                    {
                      type === '进行中' &&
                      <View className='project_item_title_right' onClick={(e) => navigateFunc(e, '/pages/projectPackage/signinCode/index')}>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon40.webp`}></Image>
                        <View>签到码</View>
                      </View> ||
                      <View className='project_item_title_right_end'>已结束</View>
                    }

                  </View>
                  {
                    // item.type === 2 &&
                    // <View className='compony_wrap'>
                    //   <View className='compony_icon'>发单方</View>
                    //   <View>{item.compony}</View>
                    // </View>
                  }

                  <View className='data_wrapper' style={`margin-top:${item.compony ? '10rpx' : '18rpx'}`}>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.port}</View>
                      <View className='data_item_label'>总需求</View>
                    </View>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.interview}</View>
                      <View className='data_item_label'>在职人数</View>
                    </View>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.pass}</View>
                      <View className='data_item_label'>离职率</View>
                    </View>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.signUp}</View>
                      <View className='data_item_label'>供应商</View>
                    </View>
                  </View>

                  <View className='project_item_bottom'>
                    <View className='project_item_bottom_item' onClick={(e) => navigateFunc(e, '/pages/projectPackage/roster/index')}>花名册</View>
                    <View className='project_item_bottom_item' onClick={(e) => navigateFunc(e, '/pages/newPackage/newWorker/index')}>录入求职者</View>
                  </View>

                </View>
              )
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

      <AtFloatLayout catchMove className='sex_init_layout' isOpened={showChangeType} onClose={() => setShowChangeType(false)}>
        <View className='filter_wrapper'>
          <View className='filter_wrapper_bg'>
            <View className='filter_title'>
              <View>按性别筛选</View>
              <AtIcon value='close' size='14' color='#222222' onClick={() => setShowChangeType(false)}></AtIcon>
            </View>
            <View className='filter_wrapper_content'>
              {
                typeList.map((item, index) => {
                  return (
                    <View
                      key={index}
                      className={`filter_wrapper_item ${index === typeIndex ? 'filter_wrapper_item_active' : ''}`}
                      onClick={() => setTypeIndex(index)}
                    >{item}</View>
                  )
                })
              }
            </View>
          </View>
        </View>
      </AtFloatLayout>

      <TabBar actCurrent={1} />
    </View>
  )
})

export default inject('store')(Index)
