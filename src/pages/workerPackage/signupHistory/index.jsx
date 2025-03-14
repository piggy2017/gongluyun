/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-14 16:52:02
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Text, Textarea, Block, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { debounce } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'

import { signUpRecruitList } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { filterJobTypes },
        businessStore: { jobFilterAddress, setJobFilterAddress },
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true)
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [list, setList] = useState([]);

    useEffect(() => {
        getList(1);
    }, [])

    const getList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        const { code, data } = await signUpRecruitList(params);
        console.log("code", code, "data", data);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
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

    const handleScrollToLower = debounce(() => {    // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (goonLoad) {
            getList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {    // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
        getList(1);
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 30rpx)`;
    }


    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='报名记录'></Navbar>

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
                            <View className='list_item' key={index} onClick={() => goDetail(item)}>
                                <View className='list_item_title'>
                                    <View className='list_item_title_name'>{item.recruitTitle}</View>
                                    {
                                        item.recruitSalaryRange &&
                                        <View className='list_item_title_salary'>
                                            {item.recruitSalaryRange.split('元/')[0]}
                                            {
                                                item.recruitSalaryRange.split('元/')[1] && <Text>元/{item.recruitSalaryRange.split('元/')[1]}</Text>
                                            }
                                        </View>
                                    }
                                </View>
                                {
                                    item.jobReq && item.tags &&
                                    <View className='require_req'>
                                        {
                                            [...item.jobReq, ...item.tags].map((r, i) => {
                                                return <View key={i}>{r}</View>
                                            })
                                        }
                                    </View>
                                }
                                <View className='list_item_bottom'>
                                    <View className='list_item_addr'>{item.areaName}</View>
                                </View>
                                <View className='list_item_hr'></View>
                                <View className='list_item_create'>报名时间：{item.signUpDate}</View>
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
