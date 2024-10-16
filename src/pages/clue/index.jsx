/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-16 15:46:06
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import ClueItem from '@/components/items/clueItem'
import CustomDate from '@/components/customDate';
import SourcePicker from '@/components/sourcePcker';
import { cluePool, cluemyClients } from '@/util/api'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, role, companyVerified },
    businessStore: { poorJobId, myClientJobId }
  } = store
  const [type, setType] = useState('客户池');

  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(127);

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [pageNo, setPageNo] = useState(1)
  const pageSize = 10
  const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

  const [list, setList] = useState([
    { id: 1, userName: "客户0974", time: "今天", source: "小红书" },
    { id: 2, userName: "客户0974", time: "今天", source: "微信岗位链接报名-小李", signUpJob: "成都龙泉驿京西仓库分拣" },
    { id: 3, userName: "客户0974", time: "今天", source: "小红书" },
    { id: 4, userName: "客户0974", time: "今天", source: "微信岗位链接报名-小李", signUpJob: "成都龙泉驿京西仓库分拣" }
  ])

  const [showSourcePicker, setShowSourcePicker] = useState(false);              //  是否显示切换状态的弹窗
  const [showFilterDate, setShowFilterDate] = useState(false);                  //  客户池是否显示切换日期的弹窗
  const [clientshowFilterDate, setClientshowFilterDate] = useState(false);      //  我的客户是否显示切换日期的弹窗
  const [dateObj, setDateObj] = useState({
    dateRange: "TODAY",
    endDate: "",
    filterTime: "今日",
    startDate: ""
  });
  const [dateClientObj, setDateClientObj] = useState({
    dateRange: "TODAY",
    endDate: "",
    filterTime: "今日",
    startDate: ""
  })
  const [sourceObj, setSourceObj] = useState({    // 筛选来源
    source: "", name: '全部来源'
  })

  const [mylist, setmyList] = useState([
    { userName: "高小光", status: 1, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    { userName: "高小光", status: 2, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    { userName: "高小光", status: 3, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    { userName: "高小光", status: 4, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    { userName: "高小光", status: 5, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    { userName: "高小光", status: 6, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
  ])

  useEffect(() => {
    setTimeout(async () => {
      const _query = await selectorQueryDomInfo('.search_wrapper');
      if (_query?.height) {
        console.log("_query_query_query", _query.height);
        setSearchHeight(_query.height)
      }
    }, 0);
  }, [isLogin, companyVerified, type]);

  useEffect(() => {
    if (type === '客户池') {
      getClueList(1);
    }
  }, [sourceObj, dateObj, poorJobId]);

  useEffect(() => {
    if (type === '我的客户') {
      getClientList(1);
    }
  }, [dateClientObj, myClientJobId,])   // 还需添加筛选状态

  const setTypeFunc = (_type) => {
    if (type != _type) {
      setType(_type);
      setgoonLoad(true);
      setPageNo(1);
      setSearchValue('');
      if (_type === '客户池') {
        getClueList(1);
      } else {
        getClientList(1);
      }
    }
  }

  const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
    console.log('滑动到了最底部');
    if (goonLoad && type === '客户池') {
      getClueList(pageNo + 1);
    } else if (goonLoad && type === '我的客户') {
      getClientList(pageNo + 1);
    }
  }, 500);

  const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
    console.log('下拉刷新');
    setIsRefresh(true);
    if (type === '客户池') {
      getClueList(1);
    } else {
      getClientList(1);
    }
  }, 200);

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight + searchHeight}px)`;
  }

  const getBottom = () => {
    return `${tabbarHeight + 30}px`;
  }

  const getStatus = (status) => {
    switch (status) {
      case 1:
        return '已约面';
      case 2:
        return '已到面';
      case 3:
        return '面试通过';
      case 4:
        return '面试失败';
      case 5:
        return '已入职';
      case 6:
        return '已离职';
    }
  }

  const getColor = (status) => {
    switch (status) {
      case 1:
        return '#999999;';
      case 2:
        return '#F00000';
      case 3:
        return '#FF6B17';
      case 4:
        return '#04B400';
      case 5:
        return '#666666';
      case 6:
        return '#FF6B00';
    }
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

  const getClueList = async (_pageNo) => {   // 获取客户池列表
    setRequestState(1);
    Taro.showLoading({ title: '加载中...' });
    let params = {
      pageNo: _pageNo,
      pageSize,
      searchInfo: searchValue,
      recruitSerialCode: poorJobId ? poorJobId.recruitSerialCode : '',
      source: sourceObj.source,
      dateRange: dateObj.dateRange,
      startDate: dateObj.startDate,
      endDate: dateObj.endDate
    }
    const { code, data } = await cluePool(params);
    console.log("getClueList", code, data);
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

  const getClientList = async (_pageNo) => {  // 获取我的客户列表
    setRequestState(1);
    Taro.showLoading({ title: '加载中...' });
    let params = {
      pageNo: _pageNo,
      pageSize,
      searchInfo: searchValue,
      recruitSerialCode: myClientJobId ? myClientJobId.recruitSerialCode : '',
      // source: sourceObj.source,
      seekState: "",
      dateRange: dateClientObj.dateRange,
      startDate: dateClientObj.startDate,
      endDate: dateClientObj.endDate,
    }
    const { code, data } = await cluemyClients(params);
    console.log("getClientList", code, data);
    Taro.hideLoading();
    setIsRefresh(false);
    if (code === 200 && data.responses?.length > 0) {
      setmyList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
      setgoonLoad(true);
      setPageNo(data.pageNo);
      setRequestState(2);
    } else {
      setgoonLoad(false);
      setRequestState(3);
      if (_pageNo === 1) {
        setmyList([]);
      }
    }
  }

  const customDateSelect = (e) => {      // 选择日期的回调
    console.log("自定义选择日期组件 customDateSelect", e);
    setDateObj(e);
  }

  const customClientDateSelect = (e) => {
    console.log("我的客户 自定义选择日期组件", e);
    setDateClientObj(e);
  }

  const sourcePickerSelect = (e) => {    // 选择来源的回调
    console.log("source", e);
    setSourceObj(e);
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View onClick={() => { setTypeFunc('客户池') }} className={`type_item ${type === '客户池' ? 'type_item_active' : ''}`}>客户池</View>
          <View onClick={() => { setTypeFunc('我的客户') }} className={`type_item ${type === '我的客户' ? 'type_item_active' : ''}`}>我的客户</View>
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
              setgoonLoad(true);
              if (type === '客户池') {
                getClueList(1);
              }
            }}
            value={searchValue}></Input>
        </View>
        <View className='filter_wrapper'>
          {
            type === '客户池' &&
            <>
              <View className='filter_wrap_item' onClick={() => setShowSourcePicker(true)}>
                <View>{sourceObj.name}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
              <View className='filter_wrap_item' onClick={(e) => navigateFunc(e, 1, '/pages/talentsPackage/filterJob/index?type=1&title=选择岗位')}>
                <View>{poorJobId.title}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
              <View className='filter_wrap_item' onClick={() => setShowFilterDate(true)}>
                <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate + '-' + dateObj.endDate}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
            </> ||
            type === '我的客户' &&
            <>
              <View className='filter_wrap_item' onClick={(e) => navigateFunc(e, 1, '/pages/talentsPackage/filterJob/index?type=2&title=选择岗位')}>
                <View>{myClientJobId.title}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
              <View className='filter_wrap_item'>
                <View>全部状态</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
              <View className='filter_wrap_item' onClick={() => setClientshowFilterDate(true)}>
                <View>{dateClientObj.filterTime ? dateClientObj.filterTime : dateClientObj.startDate + '-' + dateClientObj.endDate}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
            </>
          }


        </View>
        {
          (type === '客户池' && isLogin && role != 'SEEK') &&
          <View className='search_total'>客户池共 <Text>172</Text> 名求职者等待领取并跟进</View>
        }
      </View>

      {
        (!isLogin || (role === 'SEEK' && !companyVerified)) &&
        <View className='no_login'>
          <Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image>
          <View className='no_login_tip'>{!isLogin ? '登录后体验多项专属功能' : '认证后立即体验项目管理功能'}</View>
          <View className='login_btn' onClick={() => loginOrAuth()}>{!isLogin ? '立即登录' : '立即认证'}</View>
        </View> ||
        (isLogin && role != 'SEEK') &&
        <ScrollView
          scrollY

          className='scrollWrapper'
          style={{ height: getHeight(), background: type === '客户池' ? 'transparent' : '#ffffff' }}
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
            type === '客户池' &&
            <>
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
                list.length === 0 && requestState === 3 &&
                <View className='no_data'>
                  <View><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
                  <View>暂无相关数据~</View>
                </View>
              }
            </> ||
            type === '我的客户' &&
            <>
              {
                mylist.length > 0 && mylist.map((item, index) => {
                  return (
                    <View className='roster_item' key={index} onClick={(e) => navigateFunc(e, 1, `/pages/talentsPackage/clientDetail/index?id=${item.id}`)}>
                      <View className='roster_item_title'>
                        <View className='item_title_index'>{index + 1}</View>
                        <View className='item_title_left'>
                          <View className='item_title_name'>{item.userName}</View>
                          <View>{item.detail}</View>
                        </View>
                        <View style={{ color: getColor(item.status) }} className='item_title_right'>{getStatus(item.status)}</View>
                      </View>

                      <View className='roster_item_phone'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                        <View>{item.phone}</View>
                      </View>
                      <View className='roster_item_source'><Text>来源：</Text>{item.source}</View>
                      <View className='roster_item_source'><Text>报名岗位：</Text>{item.jobName}</View>
                      <View className='roster_item_hr'></View>
                      <View className='roster_item_time'>面试时间：{item.interviewTime}</View>
                    </View>
                  )
                })
              }

              {
                mylist.length >= 4 &&
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
                mylist.length === 0 && requestState === 3 &&
                <View className='no_data'>
                  <View><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
                  <View>暂无相关数据~</View>
                </View>
              }
            </>
          }
        </ScrollView>
      }

      <Image onClick={(e) => navigateFunc(e, 1, '/pages/newPackage/newWorker/index')}
        style={{ bottom: getBottom() }} className='add_clue_btn' src={`${Taro.$cdnUrl}/index/add_clue.webp`}></Image>

      {/* 客户池筛选日期组件 */}
      <Block>
        <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
      </Block>

      {/* 客户池筛选线索来源 */}
      <Block>
        <SourcePicker showPicker={showSourcePicker} onClose={() => { setShowSourcePicker(false) }} onChange={sourcePickerSelect}></SourcePicker>
      </Block>

      {/* 我的客户筛选日期组件 */}
      <Block>
        <CustomDate showPicker={clientshowFilterDate} onClose={() => { setClientshowFilterDate(false) }} onChange={customClientDateSelect}></CustomDate>
      </Block>

      <TabBar actCurrent={2} />
    </View>
  )
})

export default inject('store')(Index)
