/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-14 16:34:43
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import './index.scss'

import { getContractsInfo, getContractsInfoStatistics, stopContracts, getContractsInfoHallStatistics, updateContracts } from '@/util/api';

const Index = observer(({ store }) => {
  const route = useRouter();
  const {
    baseStore: { bottomSafeAreaHeight },
    businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
    userStore: { myPermissions }
  } = store

  const [detail, setDetail] = useState('');
  const [statistics, setStatistics] = useState({});
  const [basicStatistics, setBasicStatistics] = useState({});
  const [showAddress, setShowAddress] = useState(false);     //  是否显示修改面试地址的弹窗
  const [addressInt, setAddressInt] = useState('');          //  面试地址
  const [showDate, setShowDate] = useState(false);           //  是否显示修改面试时间的弹窗
  const [interviewDate, setInterviewDate] = useState('');    //  面试时间


  useDidShow(() => {
    getProjectDetail();
    getProjectStatistics();
    getContractsStatistics();
  })

  const getProjectDetail = async () => {
    const { contractsSerialCode } = route.params;  //numberRecruits, numberOnJob, leaveRate, supplierCount
    Taro.showLoading({ title: '加载中...' });
    const { code, data, msg } = await getContractsInfo({ contractsSerialCode });
    Taro.hideLoading();
    console.log("getProjectDetail_data", data);
    if (code === 200 && data) {
      // data.numberRecruits = numberRecruits;
      // data.numberOnJob = numberOnJob;
      // data.leaveRate = leaveRate;
      // data.supplierCount = supplierCount;
      if (data.interviewAddress) {
        setAddressInt(data.interviewAddress);
      }
      if (data.interviewDate) {
        setInterviewDate(data.interviewDate);
      }
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

  const getContractsStatistics = async () => {
    const { contractsSerialCode } = route.params;
    const { code, data, msg } = await getContractsInfoHallStatistics({ contractsSerialCode });
    console.log("getContractsStatistics", code, data);
    if (code === 200 && data) {
      setBasicStatistics(data);
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

  const goEditProject = () => {   // 编辑项目
    setEditProjectInfo(detail);
    Taro.navigateTo({ url: `/pages/newPackage/newProject/index` });
  }

  const setInterviewAddress = async () => {
    let params = {
      recruitSerialCode: detail.recruitSerialCode,
      serialCode: detail.serialCode,
      interviewAddress: addressInt
    }
    Taro.showLoading({ title: '保存中...' });
    const { code, data, msg } = await updateContracts(params);
    Taro.hideLoading();
    if (code === 200) {
      Taro.showToast({ title: '设置成功', icon: 'none', });
      setShowAddress(false);
      setTimeout(() => {
        getProjectDetail();
      }, 1000);
    } else {
      Taro.showToast({ title: msg, icon: 'none', });
    }
  }

  const setInterviewDateFunc = async () => {
    let params = {
      recruitSerialCode: detail.recruitSerialCode,
      serialCode: detail.serialCode,
      interviewDate
    }
    Taro.showLoading({ title: '保存中...' });
    const { code, data, msg } = await updateContracts(params);
    Taro.hideLoading();
    if (code === 200) {
      Taro.showToast({ title: '设置成功', icon: 'none', });
      setShowDate(false);
      setTimeout(() => {
        getProjectDetail();
      }, 1000);
    } else {
      Taro.showToast({ title: msg, icon: 'none', });
    }
  }

  return (
    <View className='container'>
      <Navbar fixed placeholder bgColor='transparent' title='项目详情'></Navbar>

      <View className='project_baseInfo'>
        <View className='project_name'>{detail.title}</View>
        <View className='project_addr'>{detail.conAreaName}·{detail.jobTypeName}·{detail.createDate}发布</View>
        <View className='project_count'>
          <View className='project_count_item'>
            <View >{basicStatistics.numberRecruits}</View>
            <View className='project_count_item_label'>总需求</View>
          </View>
          <View className='project_count_item'>
            <View >{basicStatistics.numberOnJob}</View>
            <View className='project_count_item_label'>在职人数</View>
          </View>
          <View className='project_count_item'>
            <View >{basicStatistics.leaveRate}%</View>
            <View className='project_count_item_label'>离职率</View>
          </View>
          <View className='project_count_item'>
            <View >{basicStatistics.supplierCount}</View>
            <View className='project_count_item_label'>供应商</View>
          </View>
        </View>
      </View>

      <View className='project_datas'>
        <View className='project_title'>
          <View>交付数据</View>
          <View className='project_more' onClick={(e) => navigateFunc(e, `/pages/projectPackage/roster/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)}>
            <View>查看名单</View>
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
        </View>
        <View className='interview_item'>
          <View className='interview_item_title'>驻场联系人</View>
          <View className='interview_item_content' onClick={() => {
            if (!myPermissions.includes('5')) {
              return Taro.showToast({ title: '您没有权限', icon: 'none' });
            }
            Taro.navigateTo({
              url: `/pages/newPackage/setOnsite/index?recruitSerialCode=${detail.recruitSerialCode}&serialCode=${detail.serialCode}&code=${detail.interviewContactInfo}`
            })
          }}>
            {
              !detail.interviewContactInfo &&
              <View className='interview_item_label'>设置驻场联系人</View> ||
              <View className='interview_item_text'>{detail.interviewContactName} {detail.interviewContactPhone}</View>
            }
            <Image className='interview_item_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
          </View>
        </View>

        <View className='interview_item'>
          <View className='interview_item_title'>面试地点</View>
          <View className='interview_item_content' onClick={() => {
            if (!myPermissions.includes('5')) {
              return Taro.showToast({ title: '您没有权限', icon: 'none' });
            }
            setShowAddress(true);
          }}>
            {
              !detail.interviewAddress &&
              <View className='interview_item_label'>设置面试地点</View> ||
              <View className='interview_item_text'>{detail.interviewAddress}</View>
            }
            <Image className='interview_item_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
          </View>
        </View>
        <View className='interview_item'>
          <View className='interview_item_title'>面试时间</View>
          <View className='interview_item_content' onClick={() => {
            if (!myPermissions.includes('5')) {
              return Taro.showToast({ title: '您没有权限', icon: 'none' });
            }
            setShowDate(true);
          }}>
            {
              !detail.interviewDate &&
              <View className='interview_item_label'>设置面试时间</View> ||
              <View className='interview_item_text'>{detail.interviewDate}</View>
            }
            <Image className='interview_item_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
          </View>
        </View>
      </View>

      <View className='interview_info'>
        <View className='project_title'>
          <View>招聘简章</View>
          {
            myPermissions.includes('5') &&
            <View className='project_more' onClick={() => {
              goEditProject()
            }}>
              <View>修改</View>
              <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
            </View> ||
            <View> </View>
          }
        </View>
        <View className='job_introduce'>{detail.introduction}</View>
      </View>
      <View style={`height:300rpx;`}></View>

      <View className='project_btns'>
        <View style={`height:20rpx;`}></View>
        <View className='btn_wrap'>
          <View className='btn_item' onClick={stopJob}>
            <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_8.webp`}></Image>
            <View>暂停面试</View>
          </View>
          {
            myPermissions.includes('5') &&
            <View className='btn_item' onClick={goEditProject}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon26.webp`}></Image>
              <View>编辑</View>
            </View>
          }
          <View className='add_worker' style={`width:${myPermissions.includes('5') ? '482rpx' : '562rpx'}`} onClick={(e) => navigateFunc(e, `/pages/newPackage/newProjectWorker/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)}>录入求职者</View>
        </View>
        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
      </View>


      <Block>
        <AtFloatLayout catchMove className='role_init_layout' isOpened={showAddress} onClose={() => { setShowAddress(false) }}>
          <View className='filter_wrapper'>
            <View className='filter_wrapper_bg'>
              <View className='filter_title'>
                <View>设置面试地点</View>
                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowAddress(false) }}></AtIcon>
              </View>
              <View className='input_wrapper'>
                <Textarea count={false}
                  className='float_input'
                  auto-height
                  confirmType='return'
                  value={addressInt}
                  onInput={(e) => setAddressInt(e.detail.value)}
                  adjustPosition={true} //键盘弹起时，是否自动上推页面 
                  show-confirm-bar
                  maxlength={500}
                  autoHeight
                  placeholder={`请输入面试地点`}>
                </Textarea>
              </View>
              <View className='post_btn' onClick={setInterviewAddress}>保存</View>
              <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
          </View>
        </AtFloatLayout>
      </Block>

      <Block>
        <AtFloatLayout catchMove className='role_init_layout' isOpened={showDate} onClose={() => { setShowDate(false) }}>
          <View className='filter_wrapper'>
            <View className='filter_wrapper_bg'>
              <View className='filter_title'>
                <View>设置面试时间</View>
                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowDate(false) }}></AtIcon>
              </View>
              <View className='input_wrapper'>
                <Textarea count={false}
                  className='float_input'
                  auto-height
                  confirmType='return'
                  value={interviewDate}
                  onInput={(e) => setInterviewDate(e.detail.value)}
                  adjustPosition={true} //键盘弹起时，是否自动上推页面 
                  show-confirm-bar
                  maxlength={500}
                  autoHeight
                  placeholder={`请输入面试时间`}>
                </Textarea>
              </View>
              <View className='post_btn' onClick={setInterviewDateFunc}>保存</View>
              <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
          </View>
        </AtFloatLayout>
      </Block>
    </View>
  )
})

export default inject('store')(Index)
