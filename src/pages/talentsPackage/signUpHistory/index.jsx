/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-15 14:08:29
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import Navbar from '@/components/navbar';
import WorkerInfo from '@/components/workerInfo';
import './index.scss'

import { cluegetUserInfo, getUserSignUpList } from '@/util/api'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store
    const route = useRouter();
    const [type, setType] = useState('SIGNED_UP');
    const [signUpList, setSignUpList] = useState([]);
    const [initData, setInitData] = useState([]);           // 原始数据
    const [clientInfos, setClientInfos] = useState(null);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10;
    const [requestState, setRequestState] = useState(0);    // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [bottomHeight, setBottomHeight] = useState(90);
    const [infoHeight, setInfoHeight] = useState(170);

    useDidShow(() => {
        const { uuid, phone } = route.params;
        getClientDetail(uuid);
        getHistoryList(1);
    })

    useEffect(() => {
        // const { uuid, phone } = route.params;
        // getClientDetail(uuid);
        // getHistoryList(1);
    }, [])

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.bottom_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setBottomHeight(_query.height);
            }
        }, 0);
    }, []);

    useEffect(() => {
        if (clientInfos) {
            setTimeout(async () => {
                const _query = await selectorQueryDomInfo('.info_wrap');
                if (_query?.height) {
                    console.log("info_wrapinfo_wrap", _query.height);
                    setInfoHeight(_query.height);
                }
            }, 0);
        }
    }, [clientInfos]);

    useEffect(() => {
        getHistoryList(1);
    }, [type])

    const getClientDetail = async (_uuid) => {
        const { code, data, msg } = await cluegetUserInfo({ uuid: _uuid });
        console.log("code", code, "data", data, "msg", msg);
        if (code === 200) {
            setClientInfos(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const getHistoryList = async (_pageNo) => {
        const { uuid, phone } = route.params;
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            phone,
            seekState: type
        }
        const { code, data, msg } = await getUserSignUpList(params);
        console.log("code", code, "data", data, "msg", msg);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            setInitData(_pageNo === 1 ? data.responses : [...initData, ...data.responses]);
            setgoonLoad(true);
            setPageNo(data.pageNo);
            setRequestState(2);
            let _list = _pageNo === 1 ? data.responses : [...initData, ...data.responses];

            const grouped = _list.reduce((acc, item) => {
                // 查找当前日期分组是否已经存在
                let dateGroup = acc.find(group => group.createDate === item.createDate);
                // 如果不存在，创建新的日期分组并添加到结果数组
                if (!dateGroup) {
                    dateGroup = { createDate: item.createDate, child: [] };
                    acc.push(dateGroup);
                }
                // 将当前项的 areaName 和 jobTypeName 添加到该日期分组的 child 中
                dateGroup.child.push(item);
                return acc;
            }, []);
            console.log("groupedgroupedgrouped", grouped);
            setSignUpList(grouped);
        } else {
            setgoonLoad(false);
            setRequestState(3);
            if (_pageNo === 1) {
                setSignUpList([]);
                setInitData([]);
            }
        }
    }

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (goonLoad) {
            getHistoryList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
        getHistoryList(1);
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + bottomHeight + infoHeight + 70}px)`;
    }

    const goInterview = () => {
        Taro.navigateTo({
            url: `/pages/talentsPackage/talentInterview/index?uuid=${clientInfos.uuid}`
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='求职历史'></Navbar>

            <View className='info_wrap'>
                <WorkerInfo info={clientInfos} type={2}></WorkerInfo>
            </View>

            <View className='record_title flex-row-items'>
                <View onClick={() => setType('SIGNED_UP')} className={`record_title_item ${type === 'SIGNED_UP' ? 'record_title_item_active' : ''}`}>报名记录</View>
                <View onClick={() => setType('EMPLOYED')} className={`record_title_item ${type === 'EMPLOYED' ? 'record_title_item_active' : ''}`}>入职记录</View>
            </View>

            <ScrollView
                scrollY
                className='record_content'
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
                    signUpList.length > 0 && signUpList.map((item, index) => {
                        return (
                            <View className='record_item' key={index}>
                                <View className='record_item_title'>{item.createDate}</View>
                                <View className='record_item_list'>
                                    {
                                        item.child.map((child, idx) => {
                                            return (
                                                <View className='record_item_list_item' key={idx}>
                                                    <View className='record_item_names flex-row-between'>
                                                        <View className='record_item_list_item_name row-show-1'>{child.recruitTitle}</View>
                                                        {
                                                            child.recruitSalaryRange &&
                                                            <View className='record_item_list_item_price'>
                                                                {child.recruitSalaryRange.split('元/')[0]}
                                                                {
                                                                    child.recruitSalaryRange.split('元/')[1] && <Text>元/{child.recruitSalaryRange.split('元/')[1]}</Text>
                                                                }
                                                            </View>
                                                        }

                                                    </View>

                                                    <View className='record_item_list_item_addr flex-row-items'>
                                                        <Image src={`${Taro.$cdnUrl}/index/index_icon12.webp`}></Image>
                                                        <View>{child.conAreaName}</View>
                                                    </View>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                            </View>
                        )
                    })
                }
                {
                    initData.length >= 5 &&
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
                    initData.length === 0 && requestState === 3 &&
                    <View className='no_data2'>
                        <View><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
                        <View>暂无相关数据~</View>
                    </View>
                }
            </ScrollView>

            <View style={`height:260rpx`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:16rpx`}></View>
                <View className='interview_btn' onClick={() => goInterview()}>安排面试</View>
                <View style={`height:${bottomSafeAreaHeight}px`}></View>
            </View>
        </View >
    )
})

export default inject('store')(Index)
