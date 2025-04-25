/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-02-24 14:02:01
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-25 09:46:48
 * @Description:
 */


import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Text, Button, Input, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';
import Navbar from '@/components/navbar';
import './index.scss'

import { getCoopCompanyByChannel, getCoopCompanyBySupplier, getContractsByCompany, joinContracts, switchRoles, getDocoument } from '@/util/api';


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
    const [searchValue, setSearchValue] = useState('');
    const [tipsContent, setTipsContent] = useState([]);
    const [showTips, setShowTips] = useState(false);

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
            Taro.setStorageSync('role', 'SUPPLIER');
        }
        getDocoument({ dicTypes: ['announcement'] }).then(res => {
            console.log("首页 getDocoument", res);
            if (res.code === 200) {
                let _text = [];
                _text.push(res.data.supplier.split('{')[0])
                _text.push(res.data.supplier.split('{')[1].split('}')[0])
                _text.push(res.data.supplier.split('}')[1]);
                console.log("_text", _text);
                setTipsContent(_text);
                setShowTips(true);
            }
        })
    }, [])

    useEffect(() => {
        console.log("isLogin", isLogin)
        const { role, companySerialCode } = route.params;
        if (companySerialCode) {
            setBillComponySerialCode(companySerialCode);
        }
        console.log("role, companySerialCode", role, companySerialCode);

        if (isLogin && role === 'SUPPLIER') {
            switchRoles({ userRole: 'SUPPLIER' }).then(res => {
                console.log("首页 供应商登录后,调接口切换到供应商__", res);
                if (res.code === 200) {

                }
            })
        }
    }, [isLogin])

    useEffect(() => {
        console.log("billComponySerialCode_billComponySerialCode", billComponySerialCode);
        if (billComponySerialCode) {
            getList(1);
        }
    }, [type, billComponySerialCode, isLogin])

    useEffect(() => {
        const { companySerialCode } = route.params;
        if (isLogin && !companySerialCode && supplierCompanyInfo.serialCode && billComponySerialCode == '') {  // 不是从发单方分享进入,从个人中心切换用户进入
            let params = {
                pageNo: 1,
                pageSize: 10,
                supplierSerialCode: supplierCompanyInfo.serialCode,
                // companySerialCode: supplierCompanyInfo.name
            }
            getCoopCompanyByChannel(params).then(res => {
                console.log("合作公司列表:", res);
                if (res.code === 200 && res.data.responses.length > 0) {
                    if (billComponySerialCode == '') {
                        console.log("如果没有 billComponySerialCode", billComponySerialCode);
                        setBillComponySerialCode(res.data.responses[0].companySerialCode);
                    }
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
            companySerialCode: billComponySerialCode,
            searchInfo: searchValue
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await getContractsByCompany(params);
        Taro.hideLoading();
        setIsRefresh(false);
        console.log("合同列表_getContractsByCompany:", code, data)
        if (code === 200 && data.responses?.length > 0) {
            setComponyInfo(data.company);
            if (data.responses?.length > 0) {
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px - 282rpx - 88rpx - ${showTips ? 116 : 0}rpx)`;
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
        if (!supplierCompanyInfo.serialCode) {   // 调用输入公司名字的弹窗
            return setShowJoinPicker(true);
        }
        getChoosePattern(item);
    }

    const getChoosePattern = async (obj) => {
        console.log("---选择合作模式:", obj);
        let params = {
            companySerialCode: billComponySerialCode,  // route.params.companySerialCode
            contractsSerialCode: obj.serialCode,
            supplierName: supplierCompanyInfo.name,
            supplierSerialCode: supplierCompanyInfo.serialCode,
            channelCode: supplierCompanyInfo.channelCode
            // coopModel: value,
        }
        console.log('加入项目参数:', params);
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

            {
                showTips &&
                <View className='my_tips'>
                    <View className='my_tips_left'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_85.webp`}></Image>
                        <View className='my_tips_text'>
                            {
                                tipsContent.length > 0 &&
                                tipsContent.map((item, index) => {
                                    return (
                                        <Text onClick={() => {
                                            if (index === 1) {
                                                Taro.makePhoneCall({
                                                    phoneNumber: item,
                                                })
                                            }
                                        }} className={`${index === 1 ? 'my_tips_phone' : ''}`} key={index}>{item}</Text>
                                    )
                                })
                            }
                        </View>
                    </View>
                    <Image onClick={() => { setShowTips(false) }} className='my_tips_right' src={`${Taro.$cdnUrl}/supplier/supplier_86.webp`}></Image>
                </View>
            }

            <View className='my_port'>
                <Image className='my_port_left_logo' src={componyInfo?.logo}></Image>
                <View className='my_port_right'>
                    <View className='my_port_compone_name'>{componyInfo.name}</View>
                    <View className='my_port_connect'>
                        <View>合作对接：{componyInfo.contactName} <Text onClick={() => {
                            Taro.makePhoneCall({
                                phoneNumber: componyInfo.contactMobile
                            })
                        }}>{componyInfo.contactMobile}</Text> </View>
                    </View>
                </View>
                <Image className='my_port_right_logo' src={`${Taro.$cdnUrl}/supplier/supplier_14.webp`} onClick={() => {
                    Taro.navigateTo({ url: `/pages/supplierPackage/collaborateBill/index` })
                }} ></Image>
            </View>

            <View className='search_content'>
                <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                <Input className='search_input'
                    placeholder='搜索项目'
                    confirmType='search'
                    placeholderStyle='color: #777777;'
                    onInput={(e) => { setSearchValue(e.detail.value) }}
                    onConfirm={(e) => {
                        setgoonLoad(true);
                        getList(1);
                    }}
                    value={searchValue}></Input>
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
                                        {item.areaName ? item.areaName + '·' : ''}
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
                                    item.company &&
                                    <View className='supplier_list_detail'>{item.company}</View>
                                }
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
                                                        <Text key={idx}>{child} </Text>
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
                {
                    list.length === 0 && requestState === 3 &&
                    <Taro.NoData></Taro.NoData>
                }
            </ScrollView>

            <TabBar actCurrent={0} />

            <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} isSupplier={true} />
            <Taro.GlobalJoinSupplier showPicker={showJoinPicker} onClose={() => { setShowJoinPicker(false) }}></Taro.GlobalJoinSupplier>
            <Taro.ChoosePattern list={currentItem?.cooperationModels} showPicker={showPatternModel} onClose={() => setShowPatternModel(false)} onchange={getChoosePattern}></Taro.ChoosePattern>
        </View>
    )
})

export default inject('store')(Index)
