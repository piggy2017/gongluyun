/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-20 10:45:04
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import './index.scss'

import { } from '@/util/api';

const Index = observer(({ store }) => {
  const route = useRouter();
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
    businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
    userStore: { companyInfo }
  } = store

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
  const [pageNo, setPageNo] = useState(1)
  const pageSize = 10;

  const [list, setList] = useState([
    { name: "成都西红人力", isAuth: true, num1: 3, num2: 79, num3: 0, num4: 7 },
    { name: "四川阿普企业管理咨询有限公司", isAuth: true, num1: 3, num2: 79, num3: 0, num4: 7 },
    { name: "成都兄弟人力", isAuth: true, num1: 3, num2: 79, num3: 0, num4: 7 },
  ]);

  const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
    console.log('滑动到了最底部');
    if (goonLoad) {
    }
  }, 500);

  const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
    console.log('下拉刷新');
    setIsRefresh(true);
  }, 200);

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 362rpx)`;
  }

  return (
    <View className='container'>
      <Navbar whiteIcon fixed placeholder bgColor='transparent' title='供应商管理' titleColor='#FFFFFF'></Navbar>

      <View className='page_title'>我的合作端口</View>
      <View className='my_port'>
        <View className='my_port_left'>
          <View className='my_port_left_logo'></View>
          <View className='my_port_left_text'>{companyInfo.company}</View>
        </View>
        <Image className='my_port_right' src={`${Taro.$cdnUrl}/supplier/supplier_3.webp`}></Image>
      </View>
      <View className='supplier_title'>
        <View>我的供应商</View>
        <View className='supplier_title_right'>
          <Image src={`${Taro.$cdnUrl}/supplier/supplier_6.webp`}></Image>
          <View>邀请供应商加入</View>
        </View>
      </View>

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
            return(
              <View className='supplier_list' key={index}>
                <View className='supplier_list_name'>
                  <View>{item.name}</View>
                  {
                    item.isAuth ? <View className='supplier_list_name_auth'>已认证</View> : ''
                  }
                </View>
                <View className='supplier_list_nums'>
                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.num1}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>合作项目</View>
                  </View>

                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.num2}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>已入职</View>
                  </View>

                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.num3}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>已离职</View>
                  </View>

                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.num4}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>已结费</View>
                  </View>
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
