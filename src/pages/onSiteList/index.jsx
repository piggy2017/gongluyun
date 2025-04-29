/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-08 15:27:47
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-24 16:49:32
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Button, ScrollView, Text, Block, RootPortal, Textarea } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import TabBar from '@/components/tabBar';
import CustomDate from '@/components/customDate';
import NewUpdateStatus from '@/components/newUpdateStatus';

import { contractsgetRoster, contractsSign, updateInterviewer, batchUpdateInterviewer, downloadRoster } from '@/util/api'

const Index = observer(({ store }) => {
  const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight, setKeyBoardHeight },
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
    { state: '', name: '全部' },
    { name: "已约面", state: "SCHEDULED_INTERVIEW", },
    { name: '未到面', state: 'NOT_INTERVIEW', },
    { name: '已签到', state: 'ARRIVE_INTERVIEW', },
    { name: '待定', state: 'UNDETERMINED', },
    { name: '名单满储备下次', state: 'FULL', },
    { name: '名单审核不通过', state: 'REVIEW_NOT_PASSED', },
    { name: '面试失败', state: 'INTERVIEW_FAILED', },
    { name: '面试通过', state: 'INTERVIEW_PASSED', },
    { name: '中途放弃', state: 'GIVE_HALFWAY', },
    { name: '未入职', state: 'NOT_EMPLOYED', },
    { name: '已入职', state: 'EMPLOYED', },
    { name: '已离职', state: 'RESIGN', },
    // { name: '可结算', state: 'SETTLEMENT', },
  ]);
  const [currentTab, setCurrentTab] = useState(0);
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

  const [dataSource, setDataSource] = useState('ONSITE_DATA');   // 由谁录入的求职者 ONSITE_DATA-他人上报数据 OWN_REPORT-由我上报数据
  const [chooseDataSource, setChooseDataSource] = useState(false);
  const [showEditStatus, setShowEditStatus] = useState(false);

  useDidShow(() => {
    getList(1);
  })

  useEffect(() => {
    getList(1);
  }, [currentTab, dateObj, onSiteFilterJob, onSiteFilterSUPPLIER, dataSource])

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
    let _recruitSerialCodes = onSiteFilterJob.map(item => item.recruitSerialCode);
    if (_recruitSerialCodes.length === 1 && _recruitSerialCodes[0] === '') {
      _recruitSerialCodes = [];
    }
    let params = {
      pageNo: _pageNo,
      pageSize,
      seekState: tabList[currentTab].state,
      searchInfo: searchValue,
      // recruitSerialCode: onSiteFilterJob.recruitSerialCode,
      recruitSerialCodes: _recruitSerialCodes,
      agentSerialCode: onSiteFilterSUPPLIER.channelCode,
      source: '',
      dateRange: dateObj.dateRange,
      startDate: dateObj.startDate,
      endDate: dateObj.endDate,
      dataType: dataSource
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
  }

  const showOptionFunc = (e, obj, index) => {
    if (batchOperations) return;
    e.stopPropagation();
    if (dataSource === 'OWN_REPORT') {
      return Taro.showToast({ title: '该数据您无法修改', icon: 'none' });
    }
    setShowEditStatus(true);
    setEditCustom(obj);
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
      // setShowbottomOptions(!showbottomOptions);
      setShowEditStatus(true);
      setEditCustom({});
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
        url: `/pages/talentsPackage/clientDetail/index?uid=${obj.uuid}&myClientCount=${totalCount}&index=${index * 1 + 1}&type=1&notEdit=${dataSource === 'OWN_REPORT' ? 1 : ''}`
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
    if (dataSource === 'OWN_REPORT') {
      return Taro.showToast({ title: '该数据您无法修改', icon: 'none' });
    }
    const { uuid } = obj;
    Taro.showLoading({ title: '签到中...' });
    const { code, data, msg } = await contractsSign({ uuid });
    Taro.hideLoading();
    if (code === 200) {
      Taro.showToast({ title: '签到成功', icon: 'none', duration: 2000 });
      setTimeout(() => {
        getList(1);
      }, 1500);
    } else {
      Taro.showToast({ title: msg, icon: 'none', duration: 2000 });
    }
  }

  const changeItemState = (state, reason, date) => {    // 单个修改状态
    if (dataSource === 'OWN_REPORT') {
      return Taro.showToast({ title: '该数据您无法修改', icon: 'none' });
    }
    Taro.showLoading({ title: '提交中...' });
    let params = {
      uuid: editCustom.uuid,
      seekState: state
    }
    if (reason) {
      params.failReason = reason;
    }
    if (date) {
      if (state === 'EMPLOYED') {       // 已入职
        params.employedDate = date;
      } else if (state === 'RESIGN') {   // 已离职
        params.resignDate = date;
      }
    }

    updateInterviewer(params).then(res => {
      Taro.hideLoading();
      if (res.code === 200) {
        Taro.showToast({ title: '更新成功', icon: 'none' })
        getList(1);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none' })
      }
    })
  }

  const batchChangeState = (state, reason, date) => {    // 批量修改状态
    if (dataSource === 'OWN_REPORT') {
      return Taro.showToast({ title: '该数据您无法修改', icon: 'none' });
    }
    if (chooseList.length === 0) {
      return Taro.showToast({ title: '请先选择用户', icon: 'none' });
    }
    let _list = chooseList.map(item => {
      let obj = {
        uuid: item,
        seekState: state
      }
      if (reason) {
        obj.failReason = reason;
      }
      if (date) {
        if (state === 'EMPLOYED') {       // 已入职
          obj.employedDate = date;
        } else if (state === 'RESIGN') {   // 已离职
          obj.resignDate = date;
        }
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

  const newEditStatusFunc = (status, failReason, date) => {
    console.log("newEditStatusFunc", status, failReason, date);
    if (batchOperations) {     // 批量修改
      batchChangeState(status, failReason, date);
    } else {                   // 单个修改
      changeItemState(status, failReason, date);
    }
  }

  const exportAllFunc = async () => {
    if (list.length === 0) {
      return Taro.showToast({ title: '暂无数据', icon: 'none' });
    }
    Taro.showLoading({ title: '导出中...' });
    let params = { ...customRequestParams };
    delete params.pageNo;
    delete params.pageSize;
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
        sourceName: onSiteFilterSUPPLIER.channelName,
        channelCode: onSiteFilterSUPPLIER.channelCode,
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

  const copyFunc = (e, obj) => {
    console.log("obj", obj)
    e.stopPropagation();
    let _sex = obj.sex === 0 ? '男' : obj.sex === 1 ? '女' : ''
    let _text = '';
    _text += '姓名:' + obj.name + '\n'
    _text += '手机号码:' + obj.phone + '\n'
    _text += '年龄:' + obj.age + '\n'
    _text += '性别:' + _sex + '\n'
    _text += '身份证号:' + (obj.idCardNo ? obj.idCardNo : '') + '\n'
    _text += '面试时间:' + obj.interviewDate + '\n'

    console.log("复制的内容:", _text);
    Taro.setClipboardData({
      data: _text,
      success: () => {
        Taro.showToast({
          title: '复制成功',
          icon: 'none'
        })
      }
    })
  }

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
          <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/talentsPackage/multipleFilterJob/index?type=5&title=选择岗位` }) }}>
            <View>{onSiteFilterJob.length === 1 ? onSiteFilterJob[0].title : onSiteFilterJob[0].title + '等' + onSiteFilterJob.length + '个岗位'}</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>

          <View className='filter_wrap_item' onClick={() => setChooseDataSource(true)}>
            <View>{dataSource == 'ONSITE_DATA' ? '项目数据' : '我的数据'}</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>

          <View className='filter_wrap_item' onClick={() => setShowFilterDate(true)}>
            <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
        </View>

        <ScrollView
          className='tab_scroll'
          scrollWithAnimation
          scrollX
          enhanced
          bounces
          showScrollbar={false}
        >
          {
            tabList.map((item, index) => {
              return (
                <View onClick={() => swtitchCurrentTab(index)} className={`tab_item ${currentTab === index ? 'tab_item_active' : ''} `} key={index}>{item.name}</View>
              )
            })
          }
        </ScrollView>

        <View className='search_total'>
          <View className='search_total_left'>共计 <Text>{totalCount}</Text> 人</View>
          <View className='search_total_right_wrap'>
            <View className='search_total_right_item' onClick={() => Taro.navigateTo({ url: '/pages/newPackage/newWorker/index?entryChannel=SOURCE&onSite=1' })}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
              <View>新增</View>
            </View>

            <View className='search_total_right_item' onClick={() => exportAllFunc()}>
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
                    {
                      item.sourceDesc && <View className='roster_item_job'>来源：{item.sourceDesc}</View>
                    }
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

                  <View className='item_title_copy' onClick={(e) => copyFunc(e, item)}>一键复制</View>
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
          <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
        }
        {
          list.length === 0 && requestState === 3 &&
          <Taro.NoData></Taro.NoData>
        }
      </ScrollView>

      {/* 客户池筛选日期组件 */}
      <Block>
        <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
      </Block>

      {/* 新的修改状态 */}
      <Block>
        <NewUpdateStatus showPicker={showEditStatus} currentStatus={editCustom?.seekState} onClose={() => { setShowEditStatus(false) }} onChange={newEditStatusFunc}></NewUpdateStatus>
      </Block>

      {/* 底部操作栏 */}
      <Block>
        {
          batchOperations &&
          <View className='footer_wrapper'>
            <View className='footer_wrapper_top' style={`height:16rpx;`}>

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
              {/* <Button open-type='share' className='export_model_btn'>导出为小程序页面</Button> */}
              {
                (onSiteFilterJob.recruitSerialCode && onSiteFilterSUPPLIER.userSerialCode) ? <Button open-type='share' className='export_model_btn'>导出为小程序页面</Button> :
                  <Button className='export_model_btn' onClick={() => {
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

      <Block>
        <AtFloatLayout catchMove className='filterSource_init_layout' isOpened={chooseDataSource} onClose={() => { setChooseDataSource(false) }}>
          <View className='filter_wrapper'>
            <View className='filter_wrapper_bg'>
              <View className='filter_title'>
                <View>选择数据录入来源</View>
                <AtIcon value='close' size='14' color='#222222' onClick={() => { setChooseDataSource(false) }}></AtIcon>
              </View>
              <View className='type_wrapper'>
                <View onClick={() => {
                  setDataSource('ONSITE_DATA')
                  setChooseDataSource(false);
                }} className={`type_item ${dataSource === 'ONSITE_DATA' ? 'type_item_active' : ''}`}>项目数据</View>
                <View onClick={() => {
                  setDataSource('OWN_REPORT');
                  setChooseDataSource(false);
                }} className={`type_item ${dataSource === 'OWN_REPORT' ? 'type_item_active' : ''}`}>我的数据</View>
              </View>
              <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
          </View>
        </AtFloatLayout>
      </Block>

      <TabBar actCurrent={2} />
    </View>
  )
})

export default inject('store')(Index)
