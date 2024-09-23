/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-19 14:25:22
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import Navbar from '@/components/navbar';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, authentication }
  } = store

  return (
    <View className='container'>
      <Navbar fixed placeholder bgColor='transparent' title='项目详情'></Navbar>

      <View className='project_baseInfo'>
        <View className='project_name'>龙泉驿区招物流分拣全职月结</View>
        <View className='project_addr'>龙泉驿·普工.5月6日发布</View>
        <View className='project_count'>
          <View className='project_count_item'>
            <View >311</View>
            <View className='project_count_item_label'>总需求</View>
          </View>
          <View className='project_count_item'>
            <View >311</View>
            <View className='project_count_item_label'>在职人数</View>
          </View>
          <View className='project_count_item'>
            <View >311</View>
            <View className='project_count_item_label'>离职率</View>
          </View>
          <View className='project_count_item'>
            <View >311</View>
            <View className='project_count_item_label'>供应商</View>
          </View>
        </View>
      </View>

      <View className='project_datas'>
        <View className='project_title'>
          <View>交付数据</View>
          <View className='project_more'>
            <View>查看花名册</View>
            <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
          </View>
        </View>
        <View className='project_datas_content'>
          <View className='project_datas_item'>
            <View>311</View>
            <View className='project_datas_item_label'>已约面</View>
          </View>
          <View className='project_datas_item'>
            <View>311</View>
            <View className='project_datas_item_label'>已到面</View>
          </View>
          <View className='project_datas_item'>
            <View>311</View>
            <View className='project_datas_item_label'>面试通过</View>
          </View>
          <View className='project_datas_item'>
            <View>311</View>
            <View className='project_datas_item_label'>已入职</View>
          </View>
        </View>
      </View>

      <View className='interview_info'>
        <View className='project_title'>
          <View>面试信息</View>
          <View className='project_more'>
            <View>修改</View>
            <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
          </View>
        </View>

        <View className='interview_item'>
          <Image src={`${Taro.$cdnUrl}/index/index_icon22.webp`}></Image>
          <View className='interview_item_content'><Text>驻场联系人：</Text>王老师 17780662488</View>
        </View>
        <View className='interview_item'>
          <Image src={`${Taro.$cdnUrl}/index/index_icon23.webp`}></Image>
          <View className='interview_item_content'><Text>面试地点：</Text>成都市郫都区国宁西路88号（距犀浦地铁站250米）</View>
        </View>
        <View className='interview_item'>
          <Image src={`${Taro.$cdnUrl}/index/index_icon24.webp`}></Image>
          <View className='interview_item_content'><Text>面试时间：</Text>每周工作日早上10点-12点，下午2点-5点</View>
        </View>
      </View>

      <View className='interview_info'>
        <View className='project_title'>
          <View>招聘简章</View>
          <View className='project_more'>
            <View>修改</View>
            <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
          </View>
        </View>

        <View className='job_introduce'>公司生产面包点心等，主要工作是包装、流水线操作等简单易上手的工作。
          上班时间：
          早班6-15
          中班：8：30-17：30
          晚班：10：00-19：00
          薪资待遇5-6K，面试根据能力定薪，入职购买社保，一年后买公积金等。</View>
      </View>

      <View className='project_btns'>
        <View style={`height:20rpx;`}></View>
        <View className='btn_wrap'>
          <View className='btn_item'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon25.webp`}></Image>
            <View>停招</View>
          </View>
          <View className='btn_item'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon26.webp`}></Image>
            <View>编辑</View>
          </View>
          <View className='add_worker'>录入求职者</View>
        </View>
        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
      </View>
    </View>
  )
})

export default inject('store')(Index)
