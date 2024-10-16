/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-08 15:27:47
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-10 14:25:09
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import TabBar from '@/components/tabBar';
import UpdateStatus from '@/components/updateStatus';

const Index = observer(({ store }) => {
  const {
    baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    userStore: { isLogin, companyVerified }
  } = store

  const [searchValue, setSearchValue] = useState('');
  const [searchHeight, setSearchHeight] = useState(175);
  const [bottomHeight, setBottomHeight] = useState(90);

  const [isRefresh, setIsRefresh] = useState(false);
  const [goonLoad, setgoonLoad] = useState(true);

  const [list, setList] = useState([
    { id: 1, userName: "高小光", status: 1, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 2, userName: "高小光", status: 2, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 3, userName: "高小光", status: 3, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 4, userName: "高小光", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
    { id: 5, userName: "高小光5", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", jobName: "龙泉驿招物流分拣全职月结", interviewTime: "7月25日" },
  ])

  const [sourceList, setSourceList] = useState(['全部来源', '抖音直播', '小红书', 'BOSS直聘', '微信私域', '58同城', 'BOSS直聘', '微信私域', '58同城']);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

  const [tabList, setTabList] = useState(['已约面', '已签到', '面试通过', '面试失败']);
  const [currentTab, setCurrentTab] = useState('已约面');
  const [currentCliskstatus, setCurrentCliskstatus] = useState('');
  const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
  const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
  const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项
  const [chooseList, setChooseList] = useState([]);                    // 选中的列表

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

  const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
    console.log('滑动到了最底部');
  }, 500);

  const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
    console.log('下拉刷新');
  }, 200);

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - ${batchOperations ? bottomHeight : tabbarHeight}px)`;
  }

  const getStatus = (status) => {
    switch (status) {
      case 2:
        return '已签到';
      case 3:
        return '面试通过';
      case 4:
        return '面试失败';
    }
  }

  const getColor = (status) => {
    switch (status) {
      case 2:
        return '#1678FF';
      case 3:
        return '#FF7C32';
      case 4:
        return '#F00000';
    }
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
      setChooseList(list.map(item => item.id))
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

  const changeStatus = (e) => {
    console.log("changeStatus", e);
    setCurrentCliskstatus(e);
  }

  const editBtnFunc = () => {   // 点击下方的修改状态按钮
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
        setChooseList(_list.filter(item => item.isChoosed).map(item => item.id))
        return _list
      })
    }
  }

  const doneBtn = () => {    // 点击完成按钮
    setShowbottomOptions(false);
    setBatchOperations(false);
  }

  return (
    <View className='container'>
      <View className='my_header'>
        <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
        <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
          <View className='search_content' onClick={() => { Taro.navigateTo({ url: `/pages/projectPackage/siteSearch/index` }) }}>
            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
            {/* <Input className='search_input'
              placeholder='搜索姓名、手机号、身份证号'
              confirmType='search'
              placeholderStyle='color: #777777;'
              onInput={(e) => { setSearchValue(e.detail.value) }}
              onConfirm={(e) => {
              }}
              value={searchValue}></Input> */}
              <View className='search_input_view'>搜索姓名、手机号、身份证号</View>
          </View>
        </View>
      </View>

      <View className='search_wrapper'>
        <View className='filter_wrapper'>
          <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/talentsPackage/filterJob/index` }) }}>
            <View>全部岗位</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
          <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/projectPackage/chooseSupplier/index` }) }}>
            <View>全部供应商</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>

          <View className='filter_wrap_item'>
            <View>今日</View>
            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
          </View>
        </View>

        <View className='tab_scroll'>
          {
            tabList.map((item, index) => {
              return (
                <View onClick={() => swtitchCurrentTab(item)} className={`tab_item ${currentTab === item ? 'tab_item_active' : ''} `} key={index}>{item}</View>
              )
            })
          }
        </View>

        <View className='search_total'>
          <View className='search_total_left'>共计 <Text>172</Text> 人</View>
          <View className='search_total_right_wrap'>
            <View className='search_total_right_item' onClick={() => Taro.navigateTo({ url: '/pages/newPackage/newWorker/index' })}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
              <View>新增</View>
            </View>
            <View className='search_total_right_item'>
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
                        <View className='item_title_name'>{item.userName}</View>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                        <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                      </View>
                    </View>
                    <View className='roster_item_detail'>
                      <View className='roster_item_detail_content'>{item.detail}</View>
                    </View>
                    <View className='roster_item_job'>{item.jobName}</View>
                    <View className='roster_item_time'>面试时间：{item.interviewTime}</View>
                  </View>
                  <View className='roster_item_wrap_right'>
                    {
                      item.status === 1 &&
                      <View className='roster_item_detail_status1'>签到</View> ||
                      <View className='roster_item_detail_status' style={{ color: getColor(item.status) }} onClick={(e) => showOptionFunc(e, item, index)}>
                        <View>{getStatus(item.status)}</View>
                        <AtIcon value='chevron-down' size='14' color={getColor(item.status)}></AtIcon>
                      </View>
                    }
                  </View>

                  {
                    item.showOptions &&
                    <View className='item_status_options'>
                      <View className='item_status_options_wrap'>
                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已约面')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon50.webp`}></Image>
                            <View style={{ color: '#08B5FF' }}>已约面</View>
                          </View>
                          {
                            currentCliskstatus === '已约面' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已签到')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                            <View style={{ color: '#1678FF' }}>已签到</View>
                          </View>
                          {
                            currentCliskstatus === '已签到' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试通过')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                            <View style={{ color: '#FF6B17' }}>面试通过</View>
                          </View>
                          {
                            currentCliskstatus === '面试通过' &&
                            <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                          }
                        </View>

                        <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试失败')}>
                          <View className='item_status_option_item_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                            <View style={{ color: '#F00000' }}>面试失败</View>
                          </View>
                          {
                            currentCliskstatus === '面试失败' &&
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
      </ScrollView>

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
                    <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已约面')}>
                      <View className='item_status_option_item_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon50.webp`}></Image>
                        <View style={{ color: '#08B5FF' }}>已约面</View>
                      </View>
                      {
                        currentCliskstatus === '已约面' &&
                        <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                      }
                    </View>

                    <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已签到')}>
                      <View className='item_status_option_item_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                        <View style={{ color: '#1678FF' }}>已签到</View>
                      </View>
                      {
                        currentCliskstatus === '已签到' &&
                        <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                      }
                    </View>

                    <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试通过')}>
                      <View className='item_status_option_item_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                        <View style={{ color: '#FF6B17' }}>面试通过</View>
                      </View>
                      {
                        currentCliskstatus === '面试通过' &&
                        <Image className='item_status_option_item_right' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                      }
                    </View>

                    <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试失败')}>
                      <View className='item_status_option_item_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                        <View style={{ color: '#F00000' }}>面试失败</View>
                      </View>
                      {
                        currentCliskstatus === '面试失败' &&
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

      {/* 线索来源 */}
      <AtFloatLayout catchMove className='source_init_layout' isOpened={showSourceModel} onClose={() => setShowSourceModel(false)}>
        <View className='filter_wrapper'>
          <View className='filter_wrapper_bg'>
            <View className='filter_title'>
              <View>按性别筛选</View>
              <AtIcon value='close' size='14' color='#222222' onClick={() => setShowSourceModel(false)}></AtIcon>
            </View>
            <View className='filter_wrapper_content'>
              {
                sourceList.map((item, index) => {
                  return (
                    <View
                      key={index}
                      className={`filter_wrapper_item ${index === sourceIndex ? 'filter_wrapper_item_active' : ''}`}
                      onClick={() => setSourceIndex(index)}
                    >{item}</View>
                  )
                })
              }
            </View>
            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
          </View>
        </View>
      </AtFloatLayout>

      <TabBar actCurrent={2} />
    </View>
  )
})

export default inject('store')(Index)
