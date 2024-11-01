/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-01 16:38:47
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Input, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss';

import { contractsList } from '@/util/api';

const Index = observer(({ store }) => {
  const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
    userStore: { role, isLogin, companyVerified }
  } = store
  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(34);

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [pageNo, setPageNo] = useState(1)
  const pageSize = 10
  const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

  const [list, setList] = useState([])

  const [type, setType] = useState('PROCESSING');

  useDidShow(()=>{
    getList(1);
  })

  useEffect(() => {
    setTimeout(async () => {
      const _query = await selectorQueryDomInfo('.search_wrap');
      console.log("_query_query_query", _query);
      if (_query?.height) {
        setSearchHeight(_query.height)
      }
    }, 0);
  }, [])

  useEffect(() => {
    getList(1);
  }, [type]);

  const getList = async (_pageNo) => {
    setRequestState(1);
    Taro.showLoading({ title: '加载中...' });
    let params = {
      pageNo: _pageNo,
      pageSize,
      searchInfo: searchValue,
      status: type
    }
    const { code, data } = await contractsList(params);
    console.log("getList", code, data);
    Taro.hideLoading();
    setIsRefresh(false);
    if (code === 200 && data.responses?.length > 0) {
      setList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
      setgoonLoad(true);
      setPageNo(data.pageNo);
      setRequestState(2);
    } else {
      setgoonLoad(false);
      setRequestState(3);
      if (_pageNo === 1) {
        setList([]);
      }
    }
  }

  const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
    console.log('滑动到了最底部');
    if (goonLoad) {
      getList(pageNo + 1);
    }
  }, 500);

  const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
    console.log('下拉刷新');
    setIsRefresh(true);
    getList(1);
  }, 200);

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight + searchHeight}px)`;
  }

  const navigateFunc = (e, type, url) => {
    if (type) {   // 需要校验用户是否登录
      if (isLogin === 0) {
        Taro.navigateTo({
          url: '/pages/login/index'
        })
        return
      }
    }
    e.stopPropagation();
    Taro.navigateTo({
      url
    })
  }

  const loginOrAuth = () => {
    if (isLogin === 0) {
      Taro.navigateTo({
        url: '/pages/login/index'
      })
    } else {
      Taro.navigateTo({
        url: '/pages/minePackage/companyAuth/index'
      })
    }
  }

  const setTypeFunc = (_type) => {
    if (_type != type) {
      setgoonLoad(true);
      setType(_type);
      setSearchValue('');
    }
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View onClick={() => setTypeFunc('PROCESSING')} className={`header_item ${type === 'PROCESSING' ? 'header_item_active' : ''}`}>进行中</View>
          <View onClick={() => setTypeFunc('COMPLETED')} className={`header_item ${type === 'COMPLETED' ? 'header_item_active' : ''}`}>已结束</View>
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
              getList(1);
              setgoonLoad(true);
            }}
            value={searchValue}></Input>
        </View>
        <Image className='add_icon' src={`${Taro.$cdnUrl}/index/index_icon3.webp`} onClick={(e) => navigateFunc(e, 1, '/pages/newPackage/newProject/index')}></Image>
      </View>
      {
        (!isLogin || (role === 'SEEK' && !companyVerified)) &&
        <View className='no_login'>
          <Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image>
          <View className='no_login_tip'>{!isLogin ? '登录后体验多项专属功能' : '认证后立即体验项目管理功能'}</View>
          <View className='login_btn' onClick={() => loginOrAuth()}>{!isLogin ? '立即登录' : '立即认证'}</View>
        </View> ||
        isLogin && role != 'SEEK' &&
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
                <View className='project_item' key={index} onClick={(e) => navigateFunc(e, 1, `/pages/projectPackage/projectDetail/index?contractsSerialCode=${item.serialCode}&numberRecruits=${item.numberRecruits}&numberOnJob=${item.numberOnJob}&leaveRate=${item.leaveRate}&supplierCount=${item.supplierCount}`)}>
                  <View className='project_item_title'>
                    <View className='project_item_title_left'>
                      <View className='project_item_title_left_name'>{item.title}</View>
                    </View>
                    {
                      type === 'PROCESSING' &&
                      <View className='project_item_title_right' onClick={(e) => navigateFunc(e, 1, '/pages/projectPackage/signinCode/index')}>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon40.webp`}></Image>
                        <View>签到码</View>
                      </View> ||
                      <View className='project_item_title_right_end'>已结束</View>
                    }
                  </View>

                  <View className='data_wrapper' style={`margin-top:${item.compony ? '10rpx' : '18rpx'}`}>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.numberRecruits}</View>
                      <View className='data_item_label'>总需求</View>
                    </View>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.numberOnJob}</View>
                      <View className='data_item_label'>在职人数</View>
                    </View>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.leaveRate}%</View>
                      <View className='data_item_label'>离职率</View>
                    </View>
                    <View className='data_item'>
                      <View className='data_item_value'>{item.supplierCount}</View>
                      <View className='data_item_label'>供应商</View>
                    </View>
                  </View>

                  <View className='project_item_bottom'>
                    <View className='project_item_bottom_item' onClick={(e) => navigateFunc(e, 1, `/pages/projectPackage/roster/index?recruitSerialCode=${item.recruitSerialCode}&title=${item.title}`)}>花名册</View>
                    <View className='project_item_bottom_item' onClick={(e) => navigateFunc(e, 1, '/pages/newPackage/newWorker/index')}>录入求职者</View>
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
            list.length === 0 && requestState === 3 &&
            <View className='no_data'>
              <View><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
              <View>暂无相关数据~</View>
            </View>
          }
        </ScrollView>
      }

      <TabBar actCurrent={1} />
    </View>
  )
})

export default inject('store')(Index)
