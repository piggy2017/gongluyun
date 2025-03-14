/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-02-24 14:02:01
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-14 14:01:22
 * @Description: 
 */


import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Text, Button, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';
import Navbar from '@/components/navbar';
import './index.scss'

import { getCoopCompanyBySupplier, getContractsByCompany, joinContracts } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight, tabbarHeight },
        businessStore: { billComponySerialCode, setBillComponySerialCode },
        userStore: { isLogin, setRole, supplierCompanyInfo, getSupplierCompanyInfo }
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [list, setList] = useState([]);
    const [type, setType] = useState(0);

    const [componyInfo, setComponyInfo] = useState({});
    const [isOpened, setIsOpened] = useState(false);
    const [showJoinPicker, setShowJoinPicker] = useState(false);
    const [showPatternModel, setShowPatternModel] = useState(false);
    const [currentItem, setCurrentItem] = useState({});

    useDidShow(() => {
        if (isLogin) {
            getSupplierCompanyInfo();
        }
    })

    useEffect(() => {
        console.log("进入到分享:", route);
        const { role, companySerialCode } = route.params;
        if (role === 'SUPPLIER') {
            setRole('SUPPLIER');
        }
    }, [])

    useEffect(() => {
        const { role, companySerialCode } = route.params;
        if (companySerialCode) {
            setBillComponySerialCode(companySerialCode);
        }
    }, [isLogin])

    useEffect(() => {
        console.log("billComponySerialCode_billComponySerialCode",billComponySerialCode);
        if (billComponySerialCode) {
            getList(1);
        }
    }, [type, billComponySerialCode, isLogin])

    useEffect(() => {
        const { companySerialCode } = route.params;
        if (isLogin && !companySerialCode && supplierCompanyInfo.serialCode) {  // 不是从发单方分享进入,从个人中心切换用户进入
            let params = {
                pageNo: 1,
                pageSize: 10,
                supplierSerialCode: supplierCompanyInfo.serialCode,
                companySerialCode: supplierCompanyInfo.name
            }
            getCoopCompanyBySupplier(params).then(res => {
                console.log("合作公司列表:", res);
                if (res.code === 200 && res.data.responses.length > 0) {
                    setBillComponySerialCode(res.data.responses[0].companySerialCode);
                } else {
                    // 提醒用户先加入供应商
                }
            })
        }
    }, [isLogin, supplierCompanyInfo])

    const getList = async (_pageNo) => {
        // const { companySerialCode } = route.params;
        let params = {
            pageNo: _pageNo,
            pageSize,
            inCooperation: type === 0 ? null : type === 1 ? true : false,
            companySerialCode: billComponySerialCode
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await getContractsByCompany(params);
        Taro.hideLoading();
        setIsRefresh(false);
        console.log("合同列表_getContractsByCompany:", code, data)
        if (code === 200) {
            setComponyInfo(data.company);
            if (data.responses?.length > 0) {
                setList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
                setgoonLoad(true);
                setPageNo(data.pageNo);
                setRequestState(2);
            } else {
                setgoonLoad(false);
                setRequestState(3);
            }
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px - 274rpx)`;
    }

    const goDetail = (item, index) => {
        if (!isLogin) {
            return setIsOpened(true)
        }
        console.log("contractSerialCode", item.serialCode)
        Taro.navigateTo({
            url: `/pages/supplierPackage/projectDetail/index?contractSerialCode=${item.serialCode}`
        })
    }
    const onClose = (e) => {
        if (e === 'success') {
            // forceUpdate()
        }
        setIsOpened(false)
    }

    const joinProject = (e, item) => {
        e.stopPropagation();
        setCurrentItem(item);
        if (!isLogin) {
            return setIsOpened(true)
        }
        if (!supplierCompanyInfo.name) {   // 调用输入公司名字的弹窗
            return setShowJoinPicker(true);
        } 
        // else {
        //     setShowPatternModel(true);
        // }
        getChoosePattern(item);
    }

    // const getComponyName = () => {
    //     setShowPatternModel(true);
    // }
    const getChoosePattern = async (obj) => {
        console.log("---选择合作模式:", obj);
        let params = {
            companySerialCode: billComponySerialCode,  // route.params.companySerialCode
            contractsSerialCode: obj.serialCode,
            supplierName: supplierCompanyInfo.name,
            // coopModel: value,
        }
        Taro.showLoading({
            title: '提交中...',
            mask: true
        })
        const { code, data, msg } = await joinContracts(params);
        Taro.hideLoading();
        console.log("加入项目", code, data, msg);
        if (code === 200) {
            Taro.showToast({ title: '加入成功', icon: 'none' });
            getList(1);
            // setShowPatternModel(false);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    return (
        <View className='container'>
            <Navbar back={false} fixed placeholder bgColor='transparent' title='我的合作端口' titleColor='#FFFFFF'></Navbar>

            <View className='my_port'>
                <View className='my_port_left_logo' src={componyInfo.logo}></View>
                <View className='my_port_right'>
                    <View className='my_port_compone_name'>{componyInfo.name}</View>
                    <View className='my_port_connect'>
                        <View>合作对接：{componyInfo.contactName} <Text>{componyInfo.contactMobile}</Text> </View>
                    </View>
                </View>
                <Image className='my_port_right_logo' src={`${Taro.$cdnUrl}/supplier/supplier_14.webp`} onClick={() => {
                    Taro.navigateTo({ url: `/pages/supplierPackage/collaborateBill/index` })
                }} ></Image>
            </View>
            <View className='my_port_label'>
                <View onClick={() => setType(0)} className={`${type === 0 ? 'my_port_active' : ''}`}>全部项目</View>
                <View onClick={() => setType(1)} className={`${type === 1 ? 'my_port_active' : ''}`}>合作中</View>
                <View onClick={() => setType(2)} className={`${type === 2 ? 'my_port_active' : ''}`}>未合作</View>
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
                            <View className='supplier_list' key={index} onClick={() => goDetail(item, index)}>
                                <View className='supplier_list_name'>
                                    {item.title}
                                </View>

                                <View className='supplier_list_detail'>
                                    <View>
                                        {item.jobTypeName}·
                                        {item.salaryType === 'FIXED' ? '全职' : item.salaryType === 'DAY' ? '兼职' : '全职/兼职'}·
                                        {item.createDate.split(' ')[0]}发布
                                    </View>
                                    {
                                        item.joiningSuccessful &&
                                        <View className='joined'></View> ||
                                        <View className='join_project_btn' onClick={(e) => joinProject(e, item)}>加入项目</View>
                                    }
                                </View>
                                {
                                    item.joiningSuccessful &&
                                    <View className='supplier_list_nums'>
                                        <View className='supplier_list_nums_item'>
                                            <View className='supplier_list_nums_item_top'>
                                                <View className='supplier_list_nums_item_top_l'>{item.signUpCounts}</View>
                                                <View className='supplier_list_nums_item_top_r'>人</View>
                                            </View>
                                            <View className='supplier_list_nums_item_bottom'>已上报</View>
                                        </View>

                                        <View className='supplier_list_nums_item'>
                                            <View className='supplier_list_nums_item_top'>
                                                <View className='supplier_list_nums_item_top_l'>{item.alreadyArrivedCounts}</View>
                                                <View className='supplier_list_nums_item_top_r'>人</View>
                                            </View>
                                            <View className='supplier_list_nums_item_bottom'>已到面</View>
                                        </View>

                                        <View className='supplier_list_nums_item'>
                                            <View className='supplier_list_nums_item_top'>
                                                <View className='supplier_list_nums_item_top_l'>{item.interviewPass}</View>
                                                <View className='supplier_list_nums_item_top_r'>人</View>
                                            </View>
                                            <View className='supplier_list_nums_item_bottom'>面试通过</View>
                                        </View>

                                        <View className='supplier_list_nums_item'>
                                            <View className='supplier_list_nums_item_top'>
                                                <View className='supplier_list_nums_item_top_l'>{item.deliveredCounts}</View>
                                                <View className='supplier_list_nums_item_top_r'>人</View>
                                            </View>
                                            <View className='supplier_list_nums_item_bottom'>已入职</View>
                                        </View>
                                    </View>
                                }

                                {
                                    item.cooperationModels &&
                                    <View className='supplier_list_model'>
                                        <View className='supplier_list_model_tag'>合作模式</View>
                                        <View className='supplier_list_model_content'>
                                            {
                                                item.cooperationModels.map((child, idx) => {
                                                    return (
                                                        <Text key={idx}>{child}</Text>
                                                    )
                                                })
                                            }
                                        </View>
                                    </View>
                                }
                            </View>
                        )
                    })
                }
            </ScrollView>

            <TabBar actCurrent={0} />

            <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} />
            <Taro.GlobalJoinSupplier showPicker={showJoinPicker} onClose={() => { setShowJoinPicker(false) }}></Taro.GlobalJoinSupplier>
            <Taro.ChoosePattern list={currentItem?.cooperationModels} showPicker={showPatternModel} onClose={() => setShowPatternModel(false)} onchange={getChoosePattern}></Taro.ChoosePattern>
        </View>
    )
})

export default inject('store')(Index)
