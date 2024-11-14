/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-14 10:43:47
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'

import TabBar from '@/components/tabBar';
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'

import CustomDate from '@/components/customDate';
import SourcePicker from '@/components/sourcePcker';
import StatusPicker from '@/components/statusPicker';
import { cluePool, cluemyClients, clueReceive } from '@/util/api'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, role, companyVerified },
    businessStore: { poorJobId, myClientJobId, setMyClientParams }
  } = store
  const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
  const [type, setType] = useState('客户池');

  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(127);

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [pageNo, setPageNo] = useState(1);
  const pageSize = 10
  const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
  const [totalCount, setTotalCount] = useState(0);

  const [list, setList] = useState([]);   // 客户池列表

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
  const [filterState, setFilterState] = useState({    // 筛选状态
    state: "", name: '全部状态'
  })

  const [mylist, setmyList] = useState([])

  const [showPickerStatus, setShowPickerStatus] = useState(false);
  const [myClientCount, setMyClientCount] = useState(0);

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
    console.log("list发生了改变", list);
  }, [list])

  useDidShow(() => {
    if (type === '我的客户') {
      const _clueSearchValue = Taro.getStorageSync('clueSearchValue');
      if (_clueSearchValue) {
        setSearchValue(_clueSearchValue);
      }
      getClientList(1);
    }
  })

  useDidHide(() => {
    Taro.removeStorageSync('clueSearchValue');
  })

  useEffect(() => {
    if (type === '客户池') {
      getClueList(1);
    }
  }, [sourceObj, dateObj, poorJobId]);

  useEffect(() => {
    if (type === '我的客户') {
      getClientList(1);
    }
  }, [dateClientObj, myClientJobId, filterState])   // 还需添加筛选状态

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
    }else{
      Taro.navigateTo({
        url
      })
    }
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
      setTotalCount(data.totalCount);
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
      seekState: filterState.state,
      dateRange: dateClientObj.dateRange,
      startDate: dateClientObj.startDate,
      endDate: dateClientObj.endDate,
    }
    setMyClientParams({ ...params });
    const { code, data } = await cluemyClients(params);
    console.log("getClientList", code, data);
    Taro.hideLoading();
    setIsRefresh(false);
    if (code === 200 && data.responses?.length > 0) {
      setmyList(_pageNo === 1 ? data.responses : [...mylist, ...data.responses]);
      setgoonLoad(true);
      setPageNo(data.pageNo);
      setRequestState(2);
      setMyClientCount(data.totalCount);
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

  const getPickerStatusFunc = (e) => {   // 筛选状态的回调
    console.log("getPickerStatusFunc", e);
    setFilterState(e);
  }

  const getClient = async (obj, idx) => {   // 领取客户
    console.log("getClient obj, idx", obj, idx);

    Taro.showLoading({ title: '领取中...' });
    const { code, data, msg } = await clueReceive({ uuid: obj.uuid });
    console.log("getClient", code, data);
    if (code === 200) {
      Taro.showToast({ title: '领取成功', icon: 'none', duration: 2000 });
      setList(list => {
        let _list = list.map((item, i) => {
          if (i === idx) {
            item.isGet = true;
          }
          return item
        })
        return _list
      })
      setTotalCount(totalCount - 1);
      forceUpdate();
    } else {
      Taro.showToast({ title: msg, icon: 'none', duration: 2000 });
    }
    Taro.hideLoading();
  }

  const callFunc = (e, obj) => {
    e.stopPropagation();
    Taro.makePhoneCall({
      phoneNumber: obj.phone
    })
  }

  const goClientDetail = (obj, index) => {
    Taro.navigateTo({
      url: `/pages/talentsPackage/clientDetail/index?uid=${obj.uuid}&myClientCount=${myClientCount}&index=${index * 1 + 1}`
    })
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
                <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
            </> ||
            type === '我的客户' &&
            <>
              <View className='filter_wrap_item' onClick={(e) => navigateFunc(e, 1, '/pages/talentsPackage/filterJob/index?type=2&title=选择岗位')}>
                <View>{myClientJobId.title}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
              <View className='filter_wrap_item' onClick={() => setShowPickerStatus(true)}>
                <View>{filterState.name}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
              <View className='filter_wrap_item' onClick={() => setClientshowFilterDate(true)}>
                <View>{dateClientObj.filterTime ? dateClientObj.filterTime : dateClientObj.startDate.replace(/-/g, '.') + '-' + dateClientObj.endDate.replace(/-/g, '.')}</View>
                <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
              </View>
            </>
          }

        </View>
        {
          (type === '客户池' && isLogin && role != 'SEEK') &&
          <View className='search_total'>客户池共 <Text>{totalCount}</Text> 名求职者等待领取并跟进</View>
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
                  // return <ClueItem index={index} item={item} onGetClient={(obj, idx) => getClient(obj, idx)}></ClueItem>
                  return (
                    <View key={index} className='clue_item'>
                      <View className='clue_item_wrap'>
                        <View className='clue_item_wrap_left'>
                          <View className='clue_item_title'>
                            <View className='clue_item_title_left'>
                              <View className='clue_item_title_sort'>{index + 1}</View>
                              <View className='clue_item_title_name'>{item.name}{item.source}</View>
                            </View>
                          </View>
                          {
                            (item.age || (item.sex === 0 || item.sex === 1)) &&
                            <View className='clue_item_info'>{item.age ? item.age + '岁' : ''}{((item.sex === 0 || item.sex === 1) && item.age) ? '·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}</View>
                          }
                          {
                            item.recruitTitle ? <View className='clue_item_info'>{item.recruitTitle}</View> : ''
                          }
                          <View className='clue_item_info'>{item.createDate}录入</View>
                        </View>
                        {
                          item.isGet &&
                          <View className='clue_item_wrap_right_done'>已领取</View> ||
                          <View className='clue_item_wrap_right' onClick={() => getClient(item, index)}>立即领取</View>
                        }
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
            </> ||
            type === '我的客户' &&
            <>
              {
                mylist.length > 0 && mylist.map((item, index) => {
                  return (
                    <View className='roster_item' key={index} onClick={() => goClientDetail(item, index)}>
                      <View className='roster_item_left'>
                        <View className='roster_item_title'>
                          <View className='item_title_index'>{index + 1}</View>
                          <View className='item_title_left'>
                            <View className='item_title_name'>{item.name}</View>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                            <View className='item_title_phone' onClick={(e) => callFunc(e, item)}>{item.phone}</View>
                          </View>
                        </View>
                        <View className='roster_item_infos'>{item.age ? item.age + '岁.' : ''}{item.sex === 0 ? '男' : '女'}{item.idCardNo ? item.idCardNo + '.' : ''}</View>

                        {
                          item.recruitTitle &&
                          <View className='roster_item_jobName'>{item.recruitTitle}</View>
                        }
                        <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                      </View>

                      <View className='roster_item_right' style={{ color: getColor(item.seekState) }}>{getStatus(item.seekState)}</View>
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

      <Image onClick={(e) => navigateFunc(e, 1, '/pages/newPackage/newWorker/index?entryChannel=SOURCE')}
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

      {/* 筛选状态 showPickerStatus, setShowPickerStatus */}
      <Block>
        <StatusPicker showPicker={showPickerStatus} onClose={() => { setShowPickerStatus(false) }} onChange={getPickerStatusFunc}></StatusPicker>
      </Block>

      <TabBar actCurrent={2} />
    </View>
  )
})

export default inject('store')(Index)
