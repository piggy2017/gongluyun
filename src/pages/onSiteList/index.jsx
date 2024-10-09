/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-08 16:02:12
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
  const [type, setType] = useState('我的客户');

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

  return (
    <View className='container'>
      <TabBar actCurrent={2} />
      <View>主场名单</View>
    </View>
  )
})

export default inject('store')(Index)
