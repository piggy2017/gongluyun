/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-14 17:36:24
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Text, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'

import { getCoopCompanyBySupplier } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { billComponySerialCode, setBillComponySerialCode },
        userStore: { companyInfo, supplierCompanyInfo },
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [list, setList] = useState([]);

    useEffect(() => {
        getList(1);
    }, [])


    const getList = async (_pageNo) => {
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            supplierSerialCode: supplierCompanyInfo.serialCode,
            // companySerialCode: supplierCompanyInfo.name
        }
        const { code, data } = await getCoopCompanyBySupplier(params);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px)`;
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#fff' title='合作的发单方'></Navbar>

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
                            <View className={`supplier_list ${item.companySerialCode === billComponySerialCode ? 'supplier_list_active' : ''}`} key={index} onClick={() => {
                                setBillComponySerialCode(item.companySerialCode);
                                Taro.navigateBack({
                                    delta: 1
                                })
                            }}>
                                <View className='supplier_list_name'>{item.name}</View>
                                <View className='supplier_list_nums'>
                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.coopContracts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>合作项目</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.deliveredCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>人</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已入职</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.resignCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>人</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已离职</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.settlementCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>人</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已结算</View>
                                    </View>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
})

export default inject('store')(Index)
