/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-12-04 17:39:54
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'
import { contractsgetRoster } from '@/util/api'
import CustomDate from '@/components/customDate';
const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight },
        userStore: { isLogin, userInfo }
    } = store;
    const filterList = [                 // 时间筛选列表
        { text: "今日", code: "TODAY" },
        { text: "昨日", code: "YESTERDAY" },
        { text: "本周", code: "THIS_WEEK" },
        { text: "上周", code: "LAST_WEEK" },
        { text: "本月", code: "THIS_MONTH" },
        { text: "上月", code: "LAST_MONTH" },
    ];

    const [tabList, setTabList] = useState([
        { state: 'SCHEDULED_INTERVIEW', name: '已约面' },
        { state: 'ARRIVE_INTERVIEW', name: '已签到' },
        { state: 'INTERVIEW_PASSED', name: '面试通过' },
        { state: 'INTERVIEW_FAILED', name: '面试失败' }]);
    const [currentTab, setCurrentTab] = useState(0);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);           // 当前选中的tab
    const [searchValue, setSearchValue] = useState('');
    const [showFilterDate, setShowFilterDate] = useState(false);
    const [dateObj, setDateObj] = useState({
        dateRange: "",
        endDate: "",
        filterTime: "全部日期",
        startDate: ""
    });
    const [infoHeight, setInfoHeight] = useState(94);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [totalCount, setTotalCount] = useState(0);
    const [title, setTitle] = useState('');

    const [list, setList] = useState([])
    const [source, setSource] = useState('');

    useEffect(() => {
        console.log("route", route.params);
        const { title, sourceName, recruitSerialCode, agentSerialCode } = route.params;
        setTitle(decodeURIComponent(title));
        setSource(decodeURIComponent(sourceName));

        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.top_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setInfoHeight(_query.height)
            }
        }, 0);
    }, [])

    useEffect(() => {
        const { agentSerialCode } = route.params;
        console.log('agentSerialCode', agentSerialCode, userInfo.userSerialCode);
        if (isLogin && agentSerialCode === userInfo.userSerialCode) {
            getList(1)
        }
    }, [isLogin, dateObj, currentTabIndex])

    const getList = async (_pageNo) => {    // 获取名单列表
        const { recruitSerialCode, agentSerialCode } = route.params;
        if (!isLogin || (agentSerialCode != userInfo.userSerialCode)) {
            return
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo * 1,
            pageSize,
            recruitSerialCode,
            agentSerialCode,
            seekState: tabList[currentTabIndex].state,
            searchInfo: searchValue,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate,
            endDate: dateObj.endDate,
            channel: 1
        }
        console.log('params', params);
        const { code, data } = await contractsgetRoster(params);
        console.log("获取名单列表", code, data);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + infoHeight}px)`;   // statusTitleHeight + contenTitleHeight + 
    }

    const callUser = (e, obj) => {
        e.stopPropagation();
        Taro.makePhoneCall({
            phoneNumber: obj.phone
        })
    }

    const getDate = (_code) => {
        if (_code) {
            let _item = filterList.filter(item => item.code === _code);
            return _item[0].text;
        }
    }

    const customDateSelect = (e) => {      // 选择日期的回调
        console.log("自定义选择日期组件 customDateSelect", e);
        setDateObj(e);
    }

    const loginOrAuth = debounce(() => {
        if (isLogin === 0) {
            Taro.navigateTo({
                url: '/pages/login/index'
            })
        }
    }, 200)

    return (
        <View className='container'>
            {/* <Navbar fixed back={false} placeholder bgColor='transparent' title='驻场名单反馈'></Navbar> */}
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_27.webp`} onClick={() => {
                        Taro.redirectTo({ url: '/pages/launch/index' })
                    }}></Image>
                    <View className='my_header_title'>名单反馈</View>
                </View>
            </View>

            <View className='top_wrapper'>
                <View className='export_infos'>
                    <View className='export_infos_name'>{source}</View>
                    <View className='export_infos_name'>岗位：{title}</View>
                </View>

                <View className='search_wrapper'>
                    <View style={`height: 36rpx;`}></View>
                    <View className='search_content'>
                        <View className='search_content_left'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                            <Input className='search_input'
                                placeholder='搜索姓名、手机号、身份证号'
                                confirmType='search'
                                placeholderStyle='color: #777777;'
                                onInput={(e) => { setSearchValue(e.detail.value) }}
                                onConfirm={(e) => {
                                    setgoonLoad(true);
                                    getList(1);
                                }}
                                value={searchValue}></Input>
                        </View>

                        <View className='search_content_right' onClick={() => setShowFilterDate(true)}>
                            <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
                            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                        </View>
                    </View>

                    <View className='tab_scroll'>
                        {
                            tabList.map((item, index) => {
                                return (
                                    <View onClick={() => setCurrentTabIndex(index)} className={`tab_item ${currentTabIndex === index ? 'tab_item_active' : ''} `} key={index}>{item.name}</View>
                                )
                            })
                        }
                    </View>
                    <View className='search_total'>共计 <Text>{totalCount}</Text> 人</View>
                </View>
            </View>

            {
                isLogin === 1 && (route.params.agentSerialCode === userInfo.userSerialCode) &&
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
                                <View className='roster_item' key={index} style={`padding:30rpx 40rpx 30rpx 68rpx;`}>
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
                                                // item.seekState === 'SCHEDULED_INTERVIEW' &&
                                                // <View className='roster_item_detail_status1'></View> ||
                                                <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }}>
                                                    <View>{getStatus(item.seekState, 1)}</View>
                                                    {/* <AtIcon value='chevron-down' size='14' color={getColor(item.seekState)}></AtIcon> */}
                                                </View>
                                            }
                                        </View>
                                    </View>
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
                </ScrollView> ||
                isLogin === 1 && (route.params.agentSerialCode != userInfo.userSerialCode) &&
                <View className='no_login'>
                    <Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image>
                    <View className='no_login_tip'>只有对应的供应商可以查看</View>
                </View>
            }

            {
                !isLogin &&
                <View className='no_login'>
                    <Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image>
                    <View className='no_login_tip'>登录后可查看反馈名单</View>
                    <View className='login_btn' onClick={() => loginOrAuth()}>立即登录</View>
                </View>
            }

            {/* 筛选日期组件 */}
            <Block>
                <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
