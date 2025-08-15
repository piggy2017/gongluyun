/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-08-15 10:01:52
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { useRouter, usePageScroll } from '@tarojs/taro';
import { View, Text, Input, Picker, Image, Block, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { debounce, throttle, throttleCustom } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'

import { indexFeeds, signUpAdd } from '@/util/api'

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, refreshUserInfo, getSubTemplates, setRole, setEnterParams },
        businessStore: { jobFilterAddress, setJobFilterAddress },
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true)
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [list, setList] = useState([]);

    const [searchValue, setSearchValue] = useState('');
    const [jobTypes, setJobTypes] = useState([]);          // 岗位类型
    const [typeInfo, setTypeInfo] = useState({
        name: "", salaryType: ''
    });

    useEffect(() => {
        const { preference, title } = route.params;
        console.log('preference', preference);
        console.log('title', title);
        getList(1);
    }, [])

    const getList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
            searchInfo: searchValue,
            preference: route.params.preference,
            // areaCode: jobFilterAddress.adcode,
            // jobTypeIds: jobTypes.map(item => item.id),
            // salaryType: typeInfo.salaryType
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        const { code, data } = await indexFeeds(params);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 108rpx)`;   //  - 334rpx
    }

    const goDetail = (item) => {
        Taro.navigateTo({
            url: `/pages/workerPackage/projectDetail/index?recruitSerialCode=${item.recruitSerialCode}`
        })
    }

    const signupFunc = async (e, index, item) => {   // 点击立即报名
        return
        e.stopPropagation();
        if (!isLogin) {
            return setIsOpened(true)
        }
    }
    const searchFunc = throttle(() => {
        getList(1);
        setgoonLoad(true);
    }, 300);

    return (
        <View className='container'>

            <Navbar fixed placeholder bgColor='transparent' title={route.params.title} ></Navbar>
            {/* 搜索区域  */}
            <View className='search_wrapper' >
                <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                <Input className='search_input'
                    placeholder='输入关键词搜索岗位'
                    confirmType='search'
                    placeholderStyle='color: #777777;'
                    onInput={(e) => { setSearchValue(e.detail.value) }}
                    onConfirm={searchFunc}
                    value={searchValue}></Input>
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
                            <View className='list_item' key={index} onClick={() => goDetail(item)}>
                                <View className='list_item_title'>
                                    <View className='list_item_title_name'>{item.labels === '新出招聘' ? item.labels : ''}{item.recruitTitle}</View>
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
                                {
                                    item.updateDate && <View className='list_item_time'>更新时间：{item.updateDate}</View>
                                }
                                <View className='list_item_bottom'>
                                    <View className='list_item_addr'>{item.areaName}</View>
                                    {
                                        !item.signUp &&
                                        <View className='list_item_btn' onClick={(e) => signupFunc(e, index, item)}>查看详情</View> ||
                                        <View className='did_signup'>已报名</View>
                                    }
                                </View>
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
