/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-02-24 14:02:01
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-07 14:57:05
 * @Description: 
 */


import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Button, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import './index.scss'

import { companygetInfo, getContractsByCompany, getContractsList, contractsList } from '@/util/api';

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

    const [list, setList] = useState([]);
    const [companyInfos, setCompanyInfos] = useState({})

    useEffect(() => {
        console.log("companyInfo", companyInfo)
        getList(1);
    }, [])

    useDidShow(() => {
        getComponyInfo();
    })

    const getComponyInfo = async () => {
        const { code, data } = await companygetInfo({ companySerialCode: companyInfo.companySerialCode });
        console.log("公司信息_getComponyInfo:", code, data)
        if (code === 200) {
            // setOnSiteInfo(data);
            setCompanyInfos(data);
        }
    }

    const getList = async (_pageNo) => {
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            inCooperation: null,
            companySerialCode: companyInfo.companySerialCode
        }
        const { code, data } = await getContractsList(params);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + bottomSafeAreaHeight}px - 392rpx)`;
    }

    const goSetContact = () => {
        Taro.navigateTo({
            url: `/pages/supplierPackage/setContact/index?contactSerialCode=${companyInfos.contactSerialCode ? companyInfos.contactSerialCode : ''}`
        })
    }

    const goDetail = (id) => {
        Taro.navigateTo({
            url: `/pages/projectPackage/projectDetail/index?contractsSerialCode=${id}`
        })
    }

    return (
        <View className='container'>
            <Navbar whiteIcon fixed placeholder bgColor='transparent' title='我的合作端口' titleColor='#FFFFFF'></Navbar>

            <View className='my_port'>
                <Image className='my_port_left_logo' src={companyInfos.logo}></Image>
                <View className='my_port_right'>
                    <View className='my_port_compone_name'>{companyInfos.name}</View>
                    {
                        !companyInfos.contactMobile &&
                        <View className='my_port_set' onClick={goSetContact}>
                            <View>暂未指定对接人员，点击设置</View>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_4.webp`}></Image>
                        </View> ||
                        <View className='my_port_connect' onClick={goSetContact}>
                            <View>合作对接：{companyInfos.contactName} {companyInfos.contactMobile} </View>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_4.webp`}></Image>
                        </View>
                    }
                </View>
            </View>
            <View className='my_port_label'>
                <View>全部项目</View>
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
                            <View className='supplier_list' key={index} onClick={() => goDetail(item.serialCode)}>
                                <View className='supplier_list_name'>
                                    {item.title}
                                </View>
                                <View className='supplier_list_detail'>{item.jobTypeName}·{item.salaryType === 'FIXED' ? '全职' : item.salaryType === 'DAY' ? '兼职' : '全职/兼职'}·{item.createDate.split(' ')[0]}发布</View>

                                {
                                    item.cooperationModels &&
                                    <View className='supplier_list_model'>
                                        <View className='supplier_list_model_tag'>合作模式</View>
                                        <View className='supplier_list_model_content'>{item.cooperationModels[0]}</View>
                                    </View>
                                }
                            </View>
                        )
                    })
                }
            </ScrollView>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='page_btns'>
                    <View className='copy_btn'>复制链接</View>
                    <Button open-type='share' className='share_btn'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_7.webp`}></Image>
                        <View>分享到微信</View>
                    </Button>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
