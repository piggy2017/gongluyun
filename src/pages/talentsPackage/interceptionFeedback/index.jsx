/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-10 20:04:18
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Text, Textarea, Block, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { debounce } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'

import { feedBackInfo } from '@/util/api';

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
    const [list, setList] = useState([
        // { name: "高小光", phone: '177 9190 0923', num: 5 },{ name: "高小光", phone: '177 9190 0923', num: 5 },
        // { name: "高小光", phone: '177 9190 0923', num: 5 },{ name: "高小光", phone: '177 9190 0923', num: 5 },
        // { name: "高小光", phone: '177 9190 0923', num: 5 },{ name: "高小光", phone: '177 9190 0923', num: 5 },
        // { name: "高小光", phone: '177 9190 0923', num: 5 },{ name: "高小光", phone: '177 9190 0923', num: 5 },
    ]);

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
        const { code, data } = await feedBackInfo(params);
        console.log("code", code, "data", data);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data?.length > 0) {
            setList(_pageNo === 1 ? data : [...list, ...data]);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 50rpx)`;
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='接待未反馈名单'></Navbar>

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
                            <View className='list_item' key={index} >
                                <View className='list_item_title'>
                                    <View className='list_item_title_name'>{item.memberName}</View>
                                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_75.webp`}></Image>
                                    <View className='list_item_title_phone' onClick={()=>{
                                        Taro.makePhoneCall({
                                            phoneNumber: item.phone
                                        })
                                    }}>{item.phone}</View>
                                </View>
                                
                                <View className='list_item_nums'>未反馈人数：<Text>{item.noFeedbackCount}</Text></View>
                            </View>
                        )
                    })
                }
                {
                    list.length >= 9 &&
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
