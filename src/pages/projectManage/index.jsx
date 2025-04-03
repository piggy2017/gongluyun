/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-03 13:34:26
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import TabBar from '@/components/tabBar';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";

import WorkerJobType from '@/components/workerJobType';
import './index.scss';

import { contractsList } from '@/util/api';

const Index = observer(({ store }) => {
  const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
    userStore: { role, isLogin, companyVerified, myPermissions },
    businessStore: { jobFilterAddress, setJobFilterAddress },
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

  const [jobTypes, setJobTypes] = useState([]);          // 岗位类型
  const [chooseJob, setChooseJob] = useState(false);     // 选择岗位类型的弹窗

  useDidShow(() => {
    const _projectSearchValue = Taro.getStorageSync('projectSearchValue');
    if (_projectSearchValue) {
      setSearchValue(_projectSearchValue);
    }
    const _acticeProject = Taro.getStorageSync('acticeProject');
    if (_acticeProject) {
      setType('PROCESSING');
    }
    getList(1);
  })

  useEffect(() => {
    return () => {
      setJobFilterAddress({
        init: false,
        adcode: '',
        city: '',
        district: '',
        province: '',
      })
    }
  }, []);

  useDidHide(() => {
    console.log("didHide");
    Taro.removeStorageSync('projectSearchValue');
    Taro.removeStorageSync('acticeProject');
  })

  useEffect(() => {
    setTimeout(async () => {
      const _query = await selectorQueryDomInfo('.search_wrapper');
      console.log("_query_query_query", _query);
      if (_query?.height) {
        setSearchHeight(_query.height)
      }
    }, 0);
  }, [])

  useEffect(() => {
    getList(1);
  }, [type, jobTypes, jobFilterAddress]);

  const getList = async (_pageNo) => {
    setRequestState(1);
    Taro.showLoading({ title: '加载中...' });
    let params = {
      pageNo: _pageNo,
      pageSize,
      searchInfo: searchValue,
      status: type,
      areaCode: jobFilterAddress.adcode,
      jobTypeIds: jobTypes.map(item => item.id),
    }
    const { code, data } = await contractsList(params);
    console.log("getList", code, data);
    Taro.hideLoading();
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

  const loginOrAuth = debounce(() => {
    if (isLogin === 0) {
      Taro.navigateTo({
        url: '/pages/login/index'
      })
    } else {
      Taro.navigateTo({
        url: '/pages/minePackage/companyAuth/index'
      })
    }
  }, 200)

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
          <View onClick={() => setTypeFunc('COMPLETED')} className={`header_item ${type === 'COMPLETED' ? 'header_item_active' : ''}`}>暂停面试</View>
        </View>
      </View>
      <View className='search_wrapper'>
        <View className='search_wrap'>
          <View className='search_con' style={`width:${myPermissions.includes('4') ? '508rpx' : '608rpx'}`} onClick={() => {
            if (!isLogin || !companyVerified) {
              loginOrAuth();
              return
            }
          }}>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            <Input className='search_input'
              placeholder='搜索关键字搜索订单'
              confirmType='search'
              disabled={(!isLogin || (role === 'SEEK' && !companyVerified)) ? true : false}
              placeholderStyle='color: #777777;'
              onInput={(e) => { setSearchValue(e.detail.value) }}
              onConfirm={(e) => {
                if (!isLogin || !companyVerified) {
                  loginOrAuth();
                  return
                }
                getList(1);
                setgoonLoad(true);
              }}
              value={searchValue}></Input>
          </View>
          {
            myPermissions.includes('8') &&
            <Image src={`${Taro.$cdnUrl}/index/index_icon40.webp`} className='sign_code_all' onClick={
              (e) => navigateFunc(e, 1, `/pages/newPackage/onSiteProject/index?type=2`)}
            // /pages/newPackage/onSiteProject/index?type=1
            // /pages/projectPackage/signinCode/index?isAll=1
            ></Image>
          }

          {
            myPermissions.includes('9') &&
            <Image className='add_icon' src={`${Taro.$cdnUrl}/index/index_icon3.webp`} onClick={(e) => navigateFunc(e, 1, '/pages/newPackage/newProject/index')}></Image>
          }
        </View>
        <View className='filter_wrapper'>
          <View className='filter_item' onClick={() => {
            setChooseJob(true);
          }}>
            <View>{jobTypes.length === 0 ? "岗位类型" : jobTypes.length === 1 ? jobTypes[0].name : jobTypes[0].name + '等' + jobTypes.length + "个工种"}</View>
            <Image src={`${Taro.$cdnUrl}/supplier/supplier_33.webp`}></Image>
          </View>

          <View className='filter_item' onClick={() => {
            Taro.navigateTo({
              url: `/pages/selectorPackage/areaChoose/index`
            })
          }}>
            <View>{jobFilterAddress.district ? jobFilterAddress.city + "·" + jobFilterAddress.district : '工作地区'}</View>
            <Image src={`${Taro.$cdnUrl}/supplier/supplier_33.webp`}></Image>
          </View>
        </View>
      </View>

      {
        (!isLogin || !companyVerified) &&
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
                <View className='project_item' key={index} onClick={(e) => navigateFunc(e, 1, `/pages/projectPackage/projectDetail/index?contractsSerialCode=${item.serialCode}`)}>
                  <View className='project_item_title'>
                    <View className='project_item_title_left'>
                      <View className='project_item_title_left_name'>{item.title}</View>
                    </View>
                    {
                      role != 'CUSTOMER' &&
                      <>
                        {
                          type === 'PROCESSING' && myPermissions.includes('8') &&
                          <View className='project_item_title_right' onClick={(e) => navigateFunc(e, 1, `/pages/projectPackage/signinCode/index?recruitSerialCode=${item.recruitSerialCode}&title=${item.title}`)}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon40.webp`}></Image>
                            <View>签到码</View>
                          </View> ||
                          type != 'PROCESSING' &&
                          <View className='project_item_title_right_end'>已暂停</View>
                        }
                      </>
                    }
                  </View>
                  {
                    item.company && <View className='project_item_compony'>{item.company}</View>
                  }

                  <View className='data_wrapper' style={`margin-top:${item.company ? '10rpx' : '18rpx'}`}>
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
                    <View className={`project_item_bottom_item ${myPermissions.includes('11') ? '' : 'project_item_bottom_item_g'}`} onClick={(e) => {
                      if (myPermissions.includes('11')) {
                        navigateFunc(e, 1, `/pages/projectPackage/roster/index?recruitSerialCode=${item.recruitSerialCode}&title=${item.title}`)
                      } else {
                        e.stopPropagation();
                        Taro.showToast({ title: '暂无权限', icon: 'none' })
                      }
                    }}>名单</View>
                    <View className={`project_item_bottom_item ${myPermissions.includes('12') ? '' : 'project_item_bottom_item_g'}`} onClick={(e) => {
                      if (myPermissions.includes('12')) {
                        navigateFunc(e, 1, `/pages/newPackage/newProjectWorker/index?recruitSerialCode=${item.recruitSerialCode}&title=${item.title}`)
                      }else {
                        e.stopPropagation();
                        Taro.showToast({ title: '暂无权限', icon: 'none' })
                      }
                    }}>录入求职者</View>
                  </View>
                </View>
              )
            })
          }

          {
            list.length >= 4 &&
            <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
          }

          {
            list.length === 0 && requestState === 3 &&
            <Taro.NoData></Taro.NoData>
          }
        </ScrollView>
      }

      {/* 选择岗位类型 */}
      <Block>
        <WorkerJobType isShow={chooseJob}
          initData={(jobTypes && jobTypes.length > 0) ? jobTypes : []}
          multiple={true}
          onClose={(e) => {
            console.log("选择的岗位类型：", e)
            if (e && e.length) {
              setJobTypes(e);
            } else {
              setJobTypes([]);
            }
            setChooseJob(false);
          }}
        ></WorkerJobType>
      </Block>

      <TabBar actCurrent={1} />
      <Taro.SubscribeMsg></Taro.SubscribeMsg>
    </View>
  )
})

export default inject('store')(Index)
