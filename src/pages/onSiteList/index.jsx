/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-08 15:27:47
 * @LastEditors: 孙林
 * @LastEditTime: 2024-12-04 17:37:15
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Button, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'

import TabBar from '@/components/tabBar';
import CustomDate from '@/components/customDate';

import { contractsgetRoster, contractsSign, updateInterviewer, batchUpdateInterviewer, downloadRoster } from '@/util/api'

const Index = observer(({ store }) => {
  const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    businessStore: { onSiteFilterJob, onSiteFilterSUPPLIER, setMyClientParams },
  } = store

  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(175);
  const [bottomHeight, setBottomHeight] = useState(90);

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);
  const [requestState, setRequestState] = useState(0);                // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
  const [totalCount, setTotalCount] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const pageSize = 10

  const [list, setList] = useState([]);

  const [tabList, setTabList] = useState([
    { state: 'SCHEDULED_INTERVIEW', name: '已约面' },
    { state: 'ARRIVE_INTERVIEW', name: '已签到' },
    { state: 'INTERVIEW_PASSED', name: '面试通过' },
    { state: 'INTERVIEW_FAILED', name: '面试失败' }]);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentCliskstatus, setCurrentCliskstatus] = useState('SCHEDULED_INTERVIEW');
  const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
  const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
  const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项
  const [chooseList, setChooseList] = useState([]);                    // 选中的列表
  const [showFilterDate, setShowFilterDate] = useState(false);         // 是否显示切换日期的弹窗

  const [showExportModel, setShowExportModel] = useState(false);       // 是否显示导出弹窗
  const [editCustom, setEditCustom] = useState({});                    // 当前需要更改的客户信息
  const [customRequestParams, setCustomRequestParams] = useState({});  // 当前请求参数

  const [dateObj, setDateObj] = useState({
    dateRange: "",
    endDate: "",
    filterTime: "全部日期",
    startDate: ""
  });

  useDidShow(() => {
    getList(1);
  })

  useEffect(() => {
    getList(1);
  }, [currentTab, dateObj, onSiteFilterJob, onSiteFilterSUPPLIER])

  useEffect(() => {
    setTimeout(async () => {
      const _query = await selectorQueryDomInfo('.search_wrapper');
      if (_query?.height) {
        console.log("_query_query_query", _query.height);
        setSearchHeight(_query.height)
      }
      const _bot = await selectorQueryDomInfo('.footer_wrapper');
      if (_bot?.height) {
        console.log("_bot_bot_bot", _bot.height);
        setBottomHeight(_bot.height)
      }
    }, 0);
  }, [batchOperations])

  useEffect(() => {
    console.log("chooseList", chooseList);
    if (chooseList.length === 0) {
      setShowbottomOptions(false);
    }
  }, [chooseList])

  const customDateSelect = (e) => {      // 选择日期的回调
    console.log("自定义选择日期组件 customDateSelect", e);
    setDateObj(e);
  }

  
  const getList = async (_pageNo) => {    // 获取名单列表
    setRequestState(1);
    Taro.showLoading({ title: '加载中...' });
    let params = {
      pageNo: _pageNo,
      pageSize,
      seekState: tabList[currentTab].state,
      searchInfo: searchValue,
      recruitSerialCode: onSiteFilterJob.recruitSerialCode,
      agentSerialCode: onSiteFilterSUPPLIER.userSerialCode,
      source: '',
      dateRange: dateObj.dateRange,
      startDate: dateObj.startDate,
      endDate: dateObj.endDate
    }
    console.log("params", params);
    setMyClientParams({ ...params });
    const { code, data } = await contractsgetRoster(params);
    console.log("获取名单列表", code, data);
    setCustomRequestParams({ ...params });
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
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - ${batchOperations ? bottomHeight : tabbarHeight}px)`;
  }

  const swtitchCurrentTab = (item) => {    // 切换分类tab
    if (item === currentTab) return;
    setCurrentTab(item);
    setBatchOperations(false);
    setChooseList([]);
    setChooseAll(false);
    setShowbottomOptions(false);
    setCurrentCliskstatus('');
  }

  const showOptionFunc = (e, obj, index) => {
    if (batchOperations) return;
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

  const callUser = (e, obj) => {
    if (batchOperations) return;
    e.stopPropagation();
    Taro.makePhoneCall({
      phoneNumber: obj.phone
    })
  }

  const chooeAllFunc = () => {      // 全选、反选
    if (chooseAll) {
      setChooseList([])
    } else {
      setChooseList(list.map(item => item.uuid))
    }
    setChooseAll(!chooseAll);
    setList(list => {
      let _list = list.map(item => {
        item.isChoosed = !chooseAll
        return item
      })
      return _list
    })
  }

  const editBtnFunc = () => {                // 点击下方的修改状态按钮
    if (chooseList.length > 0) {
      setShowbottomOptions(!showbottomOptions);
    }
  }

  const chooseItemFunc = (obj, index) => {
    if (batchOperations) {
      setList(list => {
        let _list = list.map((item, i) => {
          if (i === index) {
            item.isChoosed = !item.isChoosed
          }
          return item
        })
        setChooseList(_list.filter(item => item.isChoosed).map(item => item.uuid))
        return _list
      })
    } else {
      Taro.navigateTo({
        url: `/pages/talentsPackage/clientDetail/index?uid=${obj.uuid}&myClientCount=${totalCount}&index=${index * 1 + 1}&type=1`
      })
    }
  }

  const doneBtn = () => {    // 点击完成按钮
    setShowbottomOptions(false);
    setBatchOperations(false);
  }

  const signUpFunc = async (e, obj, index) => {
    if (batchOperations) return;
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

  const batchChangeState = (state) => {    // 批量修改状态
    setCurrentCliskstatus(state);
    if (chooseList.length === 0) {
      return Taro.showToast({ title: '请先选择用户', icon: 'none' });
    }
    let _list = chooseList.map(item => {
      let obj = {
        uuid: item,
        seekState: state
      }
      return obj
    })
    Taro.showLoading({ title: '提交中...' });
    batchUpdateInterviewer(_list).then(res => {
      Taro.hideLoading();
      if (res.code === 200) {
        Taro.showToast({ title: '更新成功', icon: 'none' })
        getList(1);
        setChooseList([]);
        setChooseAll(false);
        setShowbottomOptions(false);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none' })
      }
    })
  }

  const exportFunc = () => {
    setShowExportModel(true);
  }

  const exportAllFunc = async () => {
    if (list.length === 0) {
      return Taro.showToast({ title: '暂无数据', icon: 'none' });
    }
    Taro.showLoading({ title: '导出中...' });
    let params = { ...customRequestParams };
    const { code, data, msg } = await downloadRoster(params);
    console.log("downloadRoster", code, data, msg);
    Taro.hideLoading();
    if (code === 200) {
      let _downLoadSrc = data;
      wx.downloadFile({
        url: _downLoadSrc,
        success: function (result) {
          console.log("下载文件成功", result)
          if (Taro.getSystemInfoSync().platform === 'android') {
            Taro.showToast({ title: '点击右上方的按钮然后保存至手机', icon: 'none', duration: 3000 });
          } else {
            Taro.showToast({ title: '点击右上方的按钮然后分享至微信进行查看', icon: 'none', duration: 3000 });
          }
          const filePath = result.tempFilePath;  // 临时文件路径
          setShowExportModel(false);
          setTimeout(() => {
            forceUpdate();
            wx.openDocument({
              filePath: filePath,
              showMenu: true, // 预览文件右上方的...
              success: function (response) {
                console.log('打开文档成功', response)
              }
            })
          }, 3000);
        }
      })
    } else {
      Taro.showToast({ title: msg, icon: 'none' })
    }
  }

  Taro.useShareAppMessage(res => {
    let path = `/pages/projectPackage/siteExport/index`
    if (res.from === 'button') {
      console.log("页面中的分享---customRequestParams", customRequestParams);
      let _par = {
        // ...customRequestParams,
        sourceName: onSiteFilterSUPPLIER.name,
        agentSerialCode: onSiteFilterSUPPLIER.userSerialCode,
        title: onSiteFilterJob.title,
        recruitSerialCode: onSiteFilterJob.recruitSerialCode,
      }
      const params = new URLSearchParams(_par);
      path = `${path}?${params.toString()}`
    } else {
      path = `/pages/index/index`
    }
    return {
      path,
    }
  })

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View className='search_content' onClick={() => { Taro.navigateTo({ url: `/pages/projectPackage/siteSearch/index` }) }}>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            <View className='search_input_view'>搜索姓名、手机号、身份证号</View>
          </View>
        </View>
      </View>

      <View className='search_wrapper'>
        <View className='filter_wrapper'>
          <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/talentsPackage/filterJob/index?type=5&title=选择岗位` }) }}>
            <View>{onSiteFilterJob.title}</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
          <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/projectPackage/chooseSupplier/index?type=2` }) }}>
            <View>{onSiteFilterSUPPLIER.name}</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>

          <View className='filter_wrap_item' onClick={() => setShowFilterDate(true)}>
            <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
        </View>

        <View className='tab_scroll'>
          {
            tabList.map((item, index) => {
              return (
                <View onClick={() => swtitchCurrentTab(index)} className={`tab_item ${currentTab === index ? 'tab_item_active' : ''} `} key={index}>{item.name}</View>
              )
            })
          }
        </View>

        <View className='search_total'>
          <View className='search_total_left'>共计 <Text>{totalCount}</Text> 人</View>
          <View className='search_total_right_wrap'>
            <View className='search_total_right_item' onClick={() => Taro.navigateTo({ url: '/pages/newPackage/newWorker/index?entryChannel=SOURCE' })}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
              <View>新增</View>
            </View>
            <View className='search_total_right_item' onClick={() => exportFunc()}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon49.webp`}></Image>
              <View>导出</View>
            </View>
            {
              batchOperations ?
                <View className='search_total_right_t' onClick={() => doneBtn()}>完成</View> :
                <View className='search_total_right' onClick={() => setBatchOperations(true)}>
                  <Image src={`${Taro.$cdnUrl}/index/index_icon33.webp`}></Image>
                  <View>多选</View>
                </View>
            }
          </View>
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
            return (
              <View onClick={() => chooseItemFunc(item, index)} className='roster_item' key={index} style={`padding:${batchOperations ? '30rpx 28rpx 30rpx 126rpx' : '30rpx 40rpx 30rpx 68rpx'}`}>
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
                {
                  batchOperations && <Image className='roster_item_choose' src={`${Taro.$cdnUrl}/index/index_icon2${item.isChoosed ? 7 : 8}.webp`}></Image>
                }
              </View>
            )
          })
        }
        {
          list.length >= 5 &&
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

      {/* 客户池筛选日期组件 */}
      <Block>
        <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
      </Block>

      {/* 底部操作栏 */}
      <Block>
        {
          batchOperations &&
          <View className='footer_wrapper'>
            <View className='footer_wrapper_top' style={`height:16rpx;`}>
              {
                showbottomOptions &&
                <View className='footer_wrapper_top_position'>
                  <View className='item_status_options_wrap'>
                    <View className='item_status_option_item' onClick={() => batchChangeState('SCHEDULED_INTERVIEW')}>
                      <View className='item_status_option_item_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon50.webp`}></Image>
                        <View style={{ color: '#08B5FF' }}>已约面</View>
                      </View>
                      {
                        currentCliskstatus === 'SCHEDULED_INTERVIEW' &&
                        <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                      }
                    </View>

                    <View className='item_status_option_item' onClick={() => batchChangeState('ARRIVE_INTERVIEW')}>
                      <View className='item_status_option_item_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                        <View style={{ color: '#1678FF' }}>已签到</View>
                      </View>
                      {
                        currentCliskstatus === 'ARRIVE_INTERVIEW' &&
                        <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                      }
                    </View>

                    <View className='item_status_option_item' onClick={() => batchChangeState('INTERVIEW_PASSED')}>
                      <View className='item_status_option_item_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                        <View style={{ color: '#FF6B17' }}>面试通过</View>
                      </View>
                      {
                        currentCliskstatus === 'INTERVIEW_PASSED' &&
                        <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                      }
                    </View>

                    <View className='item_status_option_item' onClick={() => batchChangeState('INTERVIEW_FAILED')}>
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
            <View className='footer_wrapper_content'>
              <View className='footer_wrapper_left' onClick={() => chooeAllFunc()}>
                <Image src={`${Taro.$cdnUrl}/index/index_icon2${chooseAll ? 7 : 8}.webp`}></Image>
                <View>全选</View>
              </View>
              <View
                className={`footer_btn ${chooseList.length > 0 ? 'footer_btn_active' : ''}`}
                onClick={() => editBtnFunc()}>修改状态 {chooseList.length > 0 ? chooseList.length : ''}</View>
            </View>
            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
          </View>
        }
      </Block>

      <Block>
        {
          showExportModel &&
          <View className='export_model'>
            <View className='export_model_content'>
              <Image onClick={() => setShowExportModel(false)} className='export_model_close' src={`${Taro.$cdnUrl}/index/index_icon54.webp`}></Image>
              <View className='export_model_title'>导出全部名单</View>
              <Image className='export_model_img' onClick={() => exportAllFunc()} src={`${Taro.$cdnUrl}/index/index_icon53.webp`}></Image>
              {
                (onSiteFilterJob.recruitSerialCode && onSiteFilterSUPPLIER.userSerialCode) ? <Button open-type='share' className='export_model_btn'>导出为小程序页面</Button> :
                <Button className='export_model_btn' onClick={()=>{
                  Taro.showToast({
                    title: '请选择具体的岗位和供应商',
                    icon: 'none',
                })
                }}>导出为小程序页面</Button>
              }
              
            </View>
          </View>
        }
      </Block>

      <TabBar actCurrent={2} />
    </View>
  )
})

export default inject('store')(Index)
