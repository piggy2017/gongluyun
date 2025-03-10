/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-07 17:21:42
 * @Description: 项目详情中查看供应商列表
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Button, Text, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'

import { mySupplierListByContracts } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
        userStore: { companyInfo }
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [list, setList] = useState([
        // { name: "龙泉驿区招物流分拣全职月结区招物流分拣全职月结", model: '模式1:在职15天400，人多+V，卡点3天,在职三十天返现', num1: 3, num2: 79, num3: 0, num4: 7 },
        // { name: "四川阿普企业管理咨询有限公司", model: '', num1: 3, num2: 79, num3: 0, num4: 7 },
    ]);

    useEffect(() => {
        const { contractsSerialCode, title } = route.params;
        console.log('contractsSerialCode', contractsSerialCode, title);
        getList(1);
    }, [])

    const getList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
            contractsSerialCode: route.params.contractsSerialCode,
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await mySupplierListByContracts(params);
        Taro.hideLoading();
        console.log("code, data", code, data);
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
        getList(1)
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + bottomSafeAreaHeight}px - 140rpx)`;
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#fff' title={route.params.title} titleColor='#222222'></Navbar>
            <View style={`height:24rpx;`}></View>
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
                            <View className='project_list' key={index}>
                                <View className='supplier_list_name'>
                                    <View className='supplier_list_name_l'>{item.name}</View>
                                    <View className='supplier_list_name_r'>
                                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_2.webp`}></Image>
                                        <View>名单</View>
                                    </View>
                                </View>
                                {
                                    // item.model &&
                                    // <View className='supplier_list_model'>
                                    //     <Text>模式1：</Text>{item.model}
                                    // </View> ||
                                    // !item.model &&
                                    // <View className='supplier_list_goSet'>
                                    //     <View>暂无合作模式，点击设置</View>
                                    //     <Image src={`${Taro.$cdnUrl}/supplier/supplier_4.webp`}></Image>
                                    // </View>
                                }
                                <View className='supplier_list_nums'>
                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.signUpCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已上报</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.alreadyArrivedCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已到面</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.deliveredCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>累计入职</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.resignCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>累计离职</View>
                                    </View>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='page_btns'>
                    <View className='copy_btn'>邀请新供应商</View>
                    <Button open-type='share' className='share_btn'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_6.webp`}></Image>
                        <View>添加供应商</View>
                    </Button>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
