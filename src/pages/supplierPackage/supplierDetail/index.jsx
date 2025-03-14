/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-14 17:35:17
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Text, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'

import { getSupplierInfo, getContractsBySupplierAndCompany } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { setRosterFilterSupplier },
        userStore: { companyInfo, userInfo }
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [detail, setDetail] = useState({});   // 详情

    const [list, setList] = useState([]);

    useEffect(() => {
        getDetail();
        getList(1);
    }, [])

    const getDetail = async () => {
        const { supplierSerialCode } = route.params;
        Taro.showLoading({ title: '加载中...' });
        const { code, data } = await getSupplierInfo({ supplierSerialCode });
        Taro.hideLoading();
        console.log("供应商详情", code, data)
        if (code == 200) {
            setDetail(data);
        }
    }

    const getList = async (_pageNo) => {
        const { supplierSerialCode } = route.params;
        let params = {
            pageNo: _pageNo,
            pageSize,
            supplierSerialCode,
            userSerialCode: userInfo.userSerialCode,
            companySerialCode: companyInfo.companySerialCode,
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await getContractsBySupplierAndCompany(params);
        Taro.hideLoading();
        console.log("getList", code, data);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 454rpx)`;
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#fff' title='供应商详情'></Navbar>

            <View className='supplier_info'>
                <View className='supplier_info_top'>
                    <Image src={detail.logo} className='supplier_info_top_logo'></Image>
                    <View className='supplier_info_content'>
                        <View className='supplier_info_content_top'>
                            <View>{detail.name}</View>
                            <View className='supplier_info_content_auth'>{detail.companyVerified ? '已认证' : '未认证'}</View>
                        </View>
                        <View className='supplier_info_content_bottom'>
                            <View className='supplier_info_content_dot'></View>
                            <View className='supplier_info_content_status'>合作中</View>
                            <View className='supplier_info_content_hr'></View>
                            <View className='supplier_info_content_time'>已入驻 {detail.settledDate}</View>
                        </View>
                    </View>
                </View>

                <View className='supplier_info_bottom'>
                    <View className='supplier_info_item'>
                        <View className='supplier_info_item_nums'>
                            <View>{detail.coopContracts}</View>
                            <View className='supplier_info_item_nums_unit'>个</View>
                        </View>
                        <View className='supplier_info_item_label'>合作项目</View>
                    </View>
                    <View className='supplier_info_item'>
                        <View className='supplier_info_item_nums'>
                            <View>{detail.deliveredCounts}</View>
                            <View className='supplier_info_item_nums_unit'>个</View>
                        </View>
                        <View className='supplier_info_item_label'>累计入职</View>
                    </View>
                    <View className='supplier_info_item'>
                        <View className='supplier_info_item_nums'>
                            <View>{detail.resignCounts}</View>
                            <View className='supplier_info_item_nums_unit'>个</View>
                        </View>
                        <View className='supplier_info_item_label'>累计离职</View>
                    </View>
                    <View className='supplier_info_item'>
                        <View className='supplier_info_item_nums'>
                            <View>{detail.settlementCounts}</View>
                            <View className='supplier_info_item_nums_unit'>个</View>
                        </View>
                        <View className='supplier_info_item_label'>已结费</View>
                    </View>
                </View>
            </View>
            <View className='supplier_total_wrapper'>
                <View className='supplier_total'>合作项目 <Text>{detail.coopContracts}</Text> 个</View>
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
                            <View className='project_list' key={index}>
                                <View className='supplier_list_name'>
                                    <View className='supplier_list_name_l'>{item.title}</View>
                                    <View className='supplier_list_name_r' onClick={() => {
                                        setRosterFilterSupplier({
                                            name: detail.name,
                                            userSerialCode: detail.supplierUserSerialCode,
                                            selected: true
                                        })
                                        Taro.navigateTo({
                                            url: `/pages/projectPackage/roster/index?recruitSerialCode=${item.recruitSerialCode}&title=${item.title}`
                                        })
                                    }}>
                                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_2.webp`}></Image>
                                        <View>名单</View>
                                    </View>
                                </View>
                                {
                                    // item.model &&
                                    // <View className='supplier_list_model'>
                                    //     <View className='supplier_list_model_tag'>合作模式</View>
                                    //     <View className='supplier_list_model_text'>{item.model}</View>
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

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.settlementCounts}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已结费</View>
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
