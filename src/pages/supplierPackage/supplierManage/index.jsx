/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-24 14:32:59
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import './index.scss'

import { mySupplierList, getContractsByCompany } from '@/util/api';

const Index = observer(({ store }) => {
  const route = useRouter();
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
    businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
    userStore: { companyInfo, userInfo }
  } = store

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
  const [pageNo, setPageNo] = useState(1)
  const pageSize = 10;

  const [list, setList] = useState([]);

  useEffect(() => {
    console.log('供应商管理页面,companyInfo', userInfo, companyInfo);
    getList(1)
  }, [])

  const getList = async (_pageNo) => {
    let params = {
      pageNo: _pageNo,
      pageSize,
      // userSerialCode: userInfo.userSerialCode,
      companySerialCode: companyInfo.companySerialCode,
      supplierSerialCode: ''
    }
    setRequestState(1);
    Taro.showLoading({ title: '加载中', mask: true });
    const { code, data } = await mySupplierList(params);
    Taro.hideLoading();
    console.log("code, data", code, data);
    setIsRefresh(false);
    if (code === 200 && data?.responses?.length > 0) {
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
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 362rpx)`;
  }

  Taro.useShareAppMessage(res => {
    let title = '邀请您加入我的供应商';
    let imageUrl = `${Taro.$cdnUrl}/supplier/supplier_56.webp` // 图片 URL
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    let par = { companySerialCode: companyInfo.companySerialCode, role: 'SUPPLIER' }
    let path = `/pages/supplierProject/index`;
    const params = new URLSearchParams(par);
    path = `${path}?${params.toString()}`;
    return {
      title,
      imageUrl,
      path
    }
  })

  return (
    <View className='container'>
      <Navbar whiteIcon fixed placeholder bgColor='transparent' title='供应商管理' titleColor='#FFFFFF'></Navbar>

      <View className='page_title'>我的合作端口</View>
      <View className='my_port' onClick={() => {
        Taro.navigateTo({ url: '/pages/supplierPackage/myPort/index' })
      }}>
        <View className='my_port_left'>
          <Image className='my_port_left_logo' src={companyInfo.companyLogo}></Image>
          <View className='my_port_left_text'>{companyInfo.company}</View>
        </View>
        <Image className='my_port_right' src={`${Taro.$cdnUrl}/supplier/supplier_3.webp`}></Image>
      </View>
      <View className='supplier_title'>
        <View>我的供应商</View>
        <Button open-type='share' className='supplier_title_right'>
          <Image src={`${Taro.$cdnUrl}/supplier/supplier_6.webp`}></Image>
          <View>邀请供应商加入</View>
        </Button>
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
            return (
              <View className='supplier_list' key={index} onClick={()=>{
                Taro.navigateTo({ url: `/pages/supplierPackage/supplierDetail/index?supplierSerialCode=${item.supplierSerialCode}` })
              }}>
                <View className='supplier_list_name'>
                  <View>{item.name}</View>
                  {
                    item.companyVerified ? <View className='supplier_list_name_auth'>已认证</View> : ''
                  }
                </View>
                <View className='supplier_list_nums'>
                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.coopContracts}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>合作项目</View>
                  </View>

                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.deliveredCounts}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>已入职</View>
                  </View>

                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.resignCounts}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>已离职</View>
                  </View>

                  <View className='supplier_list_nums_item'>
                    <View className='supplier_list_nums_item_top'>
                      <View className='supplier_list_nums_item_top_l'>{item.settlementCounts}</View>
                      <View className='supplier_list_nums_item_top_r'>个</View>
                    </View>
                    <View className='supplier_list_nums_item_bottom'>已结费</View>
                  </View>
                </View>
              </View>
            )
          })
        }
        {
          list.length >= 5 &&
          <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
        }
        {
          list.length === 0 && requestState === 3 &&
          <Taro.NoData></Taro.NoData>
        }
      </ScrollView>
    </View>
  )
})

export default inject('store')(Index)
