/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-10 16:04:43
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, {  } from '@tarojs/taro';
import { View, Text, Input, Image, Block, ScrollView } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';
import WorkerJobType from '@/components/workerJobType';

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import { indexFeeds } from '@/util/api'

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, refreshUserInfo, getSubTemplates },
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
    const [chooseJob, setChooseJob] = useState(false);     // 选择岗位类型的弹窗
    const [chooseType, setChooseType] = useState(false);   // 选择工作类型的弹窗   全职-兼职
    const [typeInfo, setTypeInfo] = useState({
        name: "", salaryType: ''
    });
    const [isOpened, setIsOpened] = useState(false);

    const chooseTypeFunc = (name, salaryType) => {
        setChooseType(false);
        setTypeInfo({ name, salaryType });
    }

    useEffect(() => {
        console.log('jobFilterAddress', jobFilterAddress);
        getList(1);
    }, [jobFilterAddress, typeInfo, jobTypes]);

    useEffect(() => {
        if (isLogin) {
            refreshUserInfo();
            getSubTemplates();
        }
    }, [isLogin]);

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
    }, [])

    const getList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
            areaCode: jobFilterAddress.adcode,
            searchInfo: searchValue,
            jobTypeIds: jobTypes.map(item => item.id),
            salaryType: typeInfo.salaryType
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px - 334rpx)`;
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

    return (
        <View className='container'>
            <View style={`height:${statusTitleHeight + contenTitleHeight}px;`}></View>

            {/* 搜索区域 */}
            <View className='search_wrapper'>
                <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                <Input className='search_input'
                    placeholder='输入关键词搜索岗位'
                    confirmType='search'
                    placeholderStyle='color: #777777;'
                    onInput={(e) => { setSearchValue(e.detail.value) }}
                    onConfirm={(e) => {
                        setgoonLoad(true);
                        getList(1);
                    }}
                    value={searchValue}></Input>
            </View>

            {/* 筛选区 */}
            <View className='filter_wrapper_con'>
                <View className='filter_item' onClick={() => {
                    setChooseJob(true);
                    // Taro.navigateTo({
                    //     url: "/pages/selectorPackage/jobChoose/index"
                    // })
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
                <View className='filter_item' onClick={() => setChooseType(true)}>
                    <View>{typeInfo.salaryType ? typeInfo.name : '结算类型'}</View>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_33.webp`}></Image>
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

            {/* 选择结算类型 */}
            <Block>
                <AtFloatLayout catchMove className='salaryType_init_layout' isOpened={chooseType} onClose={() => { setChooseType(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>请选择工作类型</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setChooseType(false) }}></AtIcon>
                            </View>
                            <View className='type_wrapper'>
                                <View onClick={() => chooseTypeFunc('全职', 'FIXED')} className={`type_item ${typeInfo.name === '全职' ? 'type_item_active' : ''}`}>全职</View>
                                <View onClick={() => chooseTypeFunc('兼职', 'DAY')} className={`type_item ${typeInfo.name === '兼职' ? 'type_item_active' : ''}`}>兼职</View>
                                <View onClick={() => chooseTypeFunc('全职/兼职', 'ALL')} className={`type_item ${typeInfo.name === '全职/兼职' ? 'type_item_active' : ''}`}>全职/兼职</View>
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>

            <Taro.GlobalLogin isOpened={isOpened} onClose={() => setIsOpened(false)} />

            <Taro.SubscribeMsg></Taro.SubscribeMsg>

            <TabBar actCurrent={0} />
        </View>
    )
})

export default inject('store')(Index)
