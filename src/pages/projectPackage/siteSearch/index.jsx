/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-08 15:27:47
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-22 09:55:56
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'

import { contractsgetRoster, contractsSign, updateInterviewer } from '@/util/api'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight },
    businessStore: { setMyClientParams },
  } = store

  const [searchValue, setSearchValue] = useState('');

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
  const [totalCount, setTotalCount] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const pageSize = 10

  const [list, setList] = useState([]);


  const [currentCliskstatus, setCurrentCliskstatus] = useState('');                 // 选中的列表

  useDidShow(() => {
    if (searchValue && list.length > 0) {
      getList(1);
    }
  })

  const getList = async (_pageNo) => {    // 获取名单列表
    setRequestState(1);
    Taro.showLoading({ title: '加载中...' });
    let params = {
      pageNo: _pageNo,
      pageSize,
      seekState: null,
      searchInfo: searchValue,
      recruitSerialCode: '',
      agentSerialCode: '',
      source: '',
      dateRange: '',
      startDate: '',
      endDate: ''
    }
    console.log("params", params);
    setMyClientParams({ ...params });
    const { code, data } = await contractsgetRoster(params);
    console.log("获取名单列表", code, data);
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
      setTotalCount(data.totalCount);
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
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 82rpx)`;
  }

  const callUser = (e, obj) => {
    e.stopPropagation();
    Taro.makePhoneCall({
      phoneNumber: obj.phone
    })
  }

  const showOptionFunc = (e, obj, index) => {
    e.stopPropagation();
    setCurrentCliskstatus(obj.seekState);
    setList(list => {
      let _list = list.map((item, i) => {
        item.showOptions = i === index ? !item.showOptions : false
        return item
      })
      return _list
    })
  }

  const signUpFunc = async (e, obj, index) => {   // 签到
    e.stopPropagation();
    const { uuid } = obj;
    Taro.showLoading({ title: '签到中...' });
    const { code, data, msg } = await contractsSign({ uuid });
    Taro.hideLoading();
    if (code === 200) {
      Taro.showToast({ title: '签约成功', icon: 'none', duration: 2000 });
      setTimeout(() => {
        getList(1);
      }, 1500);
    } else {
      Taro.showToast({ title: msg, icon: 'none', duration: 2000 });
    }
  }

  const chooseItemFunc = (obj, index) => {
    Taro.navigateTo({
      url: `/pages/talentsPackage/clientDetail/index?uid=${obj.uuid}&myClientCount=${totalCount}&index=${index * 1 + 1}&type=1`
    })
  }

  const changeItemState = (e, obj, index, state) => {    // 单个修改状态
    e.stopPropagation();
    setCurrentCliskstatus(state);
    Taro.showLoading({ title: '提交中...' });
    updateInterviewer({ uuid: obj.uuid, seekState: state }).then(res => {
      Taro.hideLoading();
      if (res.code === 200) {
        Taro.showToast({ title: '更新成功', icon: 'none' })
        getList(1);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none' })
      }
    })
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View className='navbar_back'>
            <Image src={`${Taro.$cdnBackIcon}`} onClick={() => {
              Taro.navigateBack({ delta: 1 })
            }}></Image>

          </View>
          <View className='search_content'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            <Input className='search_input'
              focus={true}
              placeholder='搜索姓名、手机号、身份证号'
              confirmType='search'
              placeholderStyle='color: #777777;'
              onInput={(e) => { setSearchValue(e.detail.value) }}
              onConfirm={(e) => {
                getList(1);
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
              <View onClick={() => chooseItemFunc(item, index)} className='roster_item' key={index} style={`padding:30rpx 40rpx 30rpx 68rpx;`}>
                <View className='roster_item_wrap'>
                  <View className='roster_item_wrap_left'>
                    <View className='roster_item_title'>
                      <View className='item_title_index'>{index + 1}</View>
                      <View className='item_title_left'>
                        <View className='item_title_name'>{item.name}</View>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                        <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                      </View>
                    </View>
                    <View className='roster_item_detail'>
                      <View className='roster_item_detail_content'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}{((item.sex === 0 || item.sex === 1) && item.idCardNo) ? '·' : ''}{item.idCardNo ? item.idCardNo : ''}</View>
                    </View>
                    <View className='roster_item_job'>{item.recruitTitle}</View>
                    <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                  </View>
                  <View className='roster_item_wrap_right'>
                    {
                      item.seekState === 'SCHEDULED_INTERVIEW' &&
                      <View className='roster_item_detail_status1' onClick={(e) => signUpFunc(e, item, index)}>签到</View> ||
                      <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }} onClick={(e) => showOptionFunc(e, item, index)}>
                        <View>{getStatus(item.seekState, 1)}</View>
                        <AtIcon value='chevron-down' size='14' color={getColor(item.seekState)}></AtIcon>
                      </View>
                    }
                  </View>

                  {
                    item.showOptions &&
                    <View className='item_status_options'>
                      <View className='item_status_options_wrap'>
                        <View className='item_status_option_item' onClick={(e) => changeItemState(e, item, index, 'SCHEDULED_INTERVIEW')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon50.webp`}></Image>
                            <View style={{ color: '#08B5FF' }}>已约面</View>
                          </View>
                          {
                            currentCliskstatus === 'SCHEDULED_INTERVIEW' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={(e) => changeItemState(e, item, index, 'ARRIVE_INTERVIEW')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                            <View style={{ color: '#1678FF' }}>已签到</View>
                          </View>
                          {
                            currentCliskstatus === 'ARRIVE_INTERVIEW' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={(e) => changeItemState(e, item, index, 'INTERVIEW_PASSED')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                            <View style={{ color: '#FF6B17' }}>面试通过</View>
                          </View>
                          {
                            currentCliskstatus === 'INTERVIEW_PASSED' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={(e) => changeItemState(e, item, index, 'INTERVIEW_FAILED')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                            <View style={{ color: '#F00000' }}>面试失败</View>
                          </View>
                          {
                            currentCliskstatus === 'INTERVIEW_FAILED' &&
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
        {
          list.length >= 6 &&
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
    </View>
  )
})

export default inject('store')(Index)
