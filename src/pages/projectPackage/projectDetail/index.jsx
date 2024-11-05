/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-05 09:53:01
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import Navbar from '@/components/navbar';
import './index.scss'

import { getContractsInfo, getContractsInfoStatistics, stopContracts } from '@/util/api';

const Index = observer(({ store }) => {
  const route = useRouter();
  const {
    baseStore: { bottomSafeAreaHeight },
  } = store

  const [detail, setDetail] = useState('');
  const [statistics, setStatistics] = useState({});
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    getProjectDetail();
    getProjectStatistics();
  }, [])

  const getProjectDetail = async () => {
    const { contractsSerialCode, numberRecruits, numberOnJob, leaveRate, supplierCount } = route.params;
    Taro.showLoading({ title: '加载中...' });
    const { code, data, msg } = await getContractsInfo({ contractsSerialCode });
    Taro.hideLoading();
    console.log("getProjectDetail_data", data);
    if (code === 200 && data) {
      data.numberRecruits = numberRecruits;
      data.numberOnJob = numberOnJob;
      data.leaveRate = leaveRate;
      data.supplierCount = supplierCount;
      setDetail(data);
    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  const getProjectStatistics = async () => {
    const { contractsSerialCode } = route.params;
    const { code, data, msg } = await getContractsInfoStatistics({ contractsSerialCode });
    console.log("getProjectStatistics_data", code, data);
    if (code === 200 && data) {
      setStatistics(data);
    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  const navigateFunc = (e, url) => {
    e.stopPropagation();
    Taro.navigateTo({
      url
    })
  }

  const stopJob = async () => {
    const { contractsSerialCode } = route.params;
    Taro.showLoading({ title: '加载中...' });
    const { code, data, msg } = await stopContracts({ contractsSerialCode });
    Taro.hideLoading();
    console.log("stopJob_data", code, data);
    if (code === 200) {
      Taro.showToast({ title: '操作成功', icon: 'none' });
    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  return (
    <View className='container'>
      <Navbar fixed placeholder bgColor='transparent' title='项目详情'></Navbar>

      <View className='project_baseInfo'>
        <View className='project_name'>{detail.title}</View>
        <View className='project_addr'>{detail.areaName}·{detail.jobTypeName}·{detail.createDate}发布</View>
        <View className='project_count'>
          <View className='project_count_item'>
            <View >{detail.numberRecruits}</View>
            <View className='project_count_item_label'>总需求</View>
          </View>
          <View className='project_count_item'>
            <View >{detail.numberOnJob}</View>
            <View className='project_count_item_label'>在职人数</View>
          </View>
          <View className='project_count_item'>
            <View >{detail.leaveRate}</View>
            <View className='project_count_item_label'>离职率</View>
          </View>
          <View className='project_count_item'>
            <View >{detail.supplierCount}</View>
            <View className='project_count_item_label'>供应商</View>
          </View>
        </View>
      </View>

      <View className='project_datas'>
        <View className='project_title'>
          <View>交付数据</View>
          <View className='project_more' onClick={(e) => navigateFunc(e, '/pages/projectPackage/roster/index')}>
            <View>查看花名册</View>
            <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
          </View>
        </View>
        <View className='project_datas_content'>
          <View className='project_datas_item'>
            <View>{statistics.sinterviewCounts}</View>
            <View className='project_datas_item_label'>已约面</View>
          </View>
          <View className='project_datas_item'>
            <View>{statistics.alreadyArrivedCounts}</View>
            <View className='project_datas_item_label'>已到面</View>
          </View>
          <View className='project_datas_item'>
            <View>{statistics.interviewPassCounts}</View>
            <View className='project_datas_item_label'>面试通过</View>
          </View>
          <View className='project_datas_item'>
            <View>{statistics.deliveredCounts}</View>
            <View className='project_datas_item_label'>已入职</View>
          </View>
        </View>
      </View>

      <View className='interview_info'>
        <View className='project_title'>
          <View>面试信息</View>
          {
            (contactInfo || address || time) &&
            <View className='project_more'>
              <View>修改</View>
              <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
            </View>
          }
        </View>

        {
          contactInfo &&
          <View className='interview_item'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon22.webp`}></Image>
            <View className='interview_item_content'><Text>驻场联系人：</Text>王老师 17780662488</View>
          </View> ||
          <View className='interview_item_set'>
            <View className='interview_item_set_left'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon22.webp`}></Image>
              <View className='interview_item_content'>驻场联系人:</View>
            </View>
            <View className='interview_item_set_right'>
              <View>设置驻场联系人</View>
              <Image src={`${Taro.$cdnUrl}/index/index_icon57.webp`}></Image>
            </View>
          </View>
        }

        {
          address &&
          <View className='interview_item'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon23.webp`}></Image>
            <View className='interview_item_content'><Text>面试地点：</Text>成都市郫都区国宁西路88号（距犀浦地铁站250米）</View>
          </View> ||
          <View className='interview_item_set'>
            <View className='interview_item_set_left'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon23.webp`}></Image>
              <View className='interview_item_content'>面试地点：</View>
            </View>
            <View className='interview_item_set_right'>
              <View>设置面试地点</View>
              <Image src={`${Taro.$cdnUrl}/index/index_icon57.webp`}></Image>
            </View>
          </View>
        }

        {
          time &&
          <View className='interview_item'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon24.webp`}></Image>
            <View className='interview_item_content'><Text>面试时间：</Text>每周工作日早上10点-12点，下午2点-5点</View>
          </View> ||
          <View className='interview_item_set'>
            <View className='interview_item_set_left'>
              <Image src={`${Taro.$cdnUrl}/index/index_icon24.webp`}></Image>
              <View className='interview_item_content'>面试时间：</View>
            </View>
            <View className='interview_item_set_right'>
              <View>设置面试时间</View>
              <Image src={`${Taro.$cdnUrl}/index/index_icon57.webp`}></Image>
            </View>
          </View>
        }
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
          <View className='btn_item' onClick={stopJob}>
            <Image src={`${Taro.$cdnUrl}/index/index_icon25.webp`}></Image>
            <View>停招</View>
          </View>
          <View className='btn_item'>
            <Image src={`${Taro.$cdnUrl}/index/index_icon26.webp`}></Image>
            <View>编辑</View>
          </View>
          <View className='add_worker' onClick={(e) => navigateFunc(e, `/pages/newPackage/newProjectWorker/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)}>录入求职者</View>
        </View>
        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
      </View>
    </View>
  )
})

export default inject('store')(Index)
