/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-08 15:27:47
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-08 15:20:29
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Button, ScrollView, Text, Block, Input, Textarea } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import TabBar from '@/components/tabBar';
import CustomDate from '@/components/customDate';

import { contractsgetRoster, downloadRoster, getCoopCompanyByChannel, getContractsByCompany } from '@/util/api'

const Index = observer(({ store }) => {
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight, setKeyBoardHeight },
        businessStore: { setMyClientParams, supplierListFilterJob, setSupplierListFilterJob },
        userStore: { supplierCompanyInfo, getSupplierCompanyInfo }
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(175);
    const [bottomHeight, setBottomHeight] = useState(90);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);                // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [totalCount, setTotalCount] = useState(0);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10

    const [list, setList] = useState([]);

    const [tabList, setTabList] = useState([
        { state: '', name: '全部' },
        { name: "已约面", state: "SCHEDULED_INTERVIEW", },
        { name: '未到面', state: 'NOT_INTERVIEW', },
        { name: '已签到', state: 'ARRIVE_INTERVIEW', },
        { name: '待定', state: 'UNDETERMINED', },
        { name: '名单满储备下次', state: 'FULL', },
        { name: '名单审核不通过', state: 'REVIEW_NOT_PASSED', },
        { name: '面试失败', state: 'INTERVIEW_FAILED', },
        { name: '面试通过', state: 'INTERVIEW_PASSED', },
        { name: '中途放弃', state: 'GIVE_HALFWAY', },
        { name: '未入职', state: 'NOT_EMPLOYED', },
        { name: '已入职', state: 'EMPLOYED', },
        { name: '已离职', state: 'RESIGN', },
        // { name: '可结算', state: 'SETTLEMENT', },
    ]);
    const [currentTab, setCurrentTab] = useState(0);
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    const [chooseList, setChooseList] = useState([]);                    // 选中的列表
    const [showFilterDate, setShowFilterDate] = useState(false);         // 是否显示切换日期的弹窗

    const [showExportModel, setShowExportModel] = useState(false);       // 是否显示导出弹窗
    const [customRequestParams, setCustomRequestParams] = useState({});  // 当前请求参数

    const [dateObj, setDateObj] = useState({
        dateRange: "",
        endDate: "",
        filterTime: "全部日期",
        startDate: ""
    });

    const [companyList, setCompanyList] = useState([]);
    const [companyPageNo, setCompanyPageNo] = useState(1);
    const [companyGoonLoad, setCompanyGoonLoad] = useState(true);
    const [companyRequestState, setCompanyRequestState] = useState(0);
    const [companyIsRefresh, setCompanyIsRefresh] = useState(false);
    const [currentCompany, setCurrentCompany] = useState({});
    const [showCompanyModel, setShowCompanyModel] = useState(false);

    // useDidShow(() => {
    //     getList(1);
    // })

    useEffect(() => {
        getCompanyList(1);
    }, [])

    useEffect(() => {
        // console.log("useEffect---currentCompany", currentCompany);
        console.log("useEffect---currentTab, dateObj, supplierListFilterJob", currentTab, dateObj, supplierListFilterJob);
        if (Object.keys(currentCompany).length === 0) return;
        getList(1);
    }, [currentTab, dateObj, supplierListFilterJob])

    useEffect(() => {
        console.log("useEffect---currentCompany", currentCompany);
        if (Object.keys(currentCompany).length === 0) return;
        getList(1);
    }, [currentCompany])

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
    }, [])

    useEffect(() => {
        console.log("chooseList", chooseList);
    }, [chooseList])

    const customDateSelect = (e) => {      // 选择日期的回调
        console.log("自定义选择日期组件 customDateSelect", e);
        setDateObj(e);
    }

    const getCompanyList = async (_pageNo) => {
        setCompanyRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize: 20,
            supplierSerialCode: supplierCompanyInfo.serialCode
        }
        const { code, data } = await getCoopCompanyByChannel(params);
        Taro.hideLoading();
        console.log("code,getCompanyList-- data", code, data);
        setCompanyIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            if (Object.keys(currentCompany).length === 0 && _pageNo === 1) {
                setCurrentCompany(data.responses[0]);
                data.responses[0].selected = true;
            } else if (Object.keys(currentCompany).length > 0) {
                for (let i = 0; i < data.responses.length; i++) {
                    data.responses[i].selected = false;
                    if (data.responses[i].companySerialCode === currentCompany.companySerialCode) {
                        data.responses[i].selected = true;
                    }
                }
            }

            setCompanyList(_pageNo === 1 ? data.responses : [...companyList, ...data.responses]);
            setCompanyGoonLoad(true);
            setCompanyPageNo(data.pageNo);
            setCompanyRequestState(2);
        } else {
            setCompanyGoonLoad(false);
            setCompanyRequestState(3);
            if (_pageNo === 1) {
                setCompanyList([]);
            }
        }
    }

    const handleCompanyScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setCompanyIsRefresh(true);
        getCompanyList(1);
    }, 200);

    const handleCompanyScrollToLower = debounce(() => {  // 滑动到最底部,触发上拉加载
        console.log('上拉加载');
        if (companyGoonLoad) {
            getCompanyList(companyPageNo + 1);
        }
    }, 200);


    const getList = async (_pageNo) => {    // 获取名单列表
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let _recruitSerialCodes = supplierListFilterJob.map(item => item.recruitSerialCode);
        if (_recruitSerialCodes.length === 1 && _recruitSerialCodes[0] === '') {
            _recruitSerialCodes = [];
        }
        let params = {
            pageNo: _pageNo,
            pageSize,
            seekState: tabList[currentTab].state,
            searchInfo: searchValue,
            recruitSerialCodes: _recruitSerialCodes,
            // agentSerialCode: onSiteFilterSUPPLIER.userSerialCode,
            supplierSerialCode: supplierCompanyInfo.serialCode,
            companySerialCode: currentCompany.companySerialCode,
            source: '',
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate,
            endDate: dateObj.endDate,
        }
        console.log("params", params);
        setMyClientParams({ ...params });
        const { code, data } = await contractsgetRoster(params);
        console.log("获取名单列表", code, data);
        setCustomRequestParams({ ...params });
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            setList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
            setgoonLoad(true);
            setPageNo(data.pageNo);
            setTotalCount(data.totalCount);
            setRequestState(2);
        } else {
            setgoonLoad(false);
            setRequestState(3);
            setTotalCount(data.totalCount);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - ${batchOperations ? bottomHeight : tabbarHeight}px)`;
    }

    const swtitchCurrentTab = (item) => {    // 切换分类tab
        if (item === currentTab) return;
        setCurrentTab(item);
        setBatchOperations(false);
        setChooseList([]);
        setChooseAll(false);
    }

    const callUser = (e, obj) => {
        if (batchOperations) return;
        e.stopPropagation();
        Taro.makePhoneCall({
            phoneNumber: obj.phone
        })
    }

    const chooseItemFunc = (obj, index) => {
        return
        Taro.navigateTo({
            url: `/pages/talentsPackage/clientDetail/index?uid=${obj.uuid}&myClientCount=${totalCount}&index=${index * 1 + 1}&type=1&notEdit=${dataSource === 'OWN_REPORT' ? 1 : ''}`
        })
    }

    const exportAllFunc = async () => {
        if (list.length === 0) {
            return Taro.showToast({ title: '暂无数据', icon: 'none' });
        }
        Taro.showLoading({ title: '导出中...' });
        let params = { ...customRequestParams };
        delete params.pageNo;
        delete params.pageSize;
        const { code, data, msg } = await downloadRoster(params);
        console.log("downloadRoster", code, data, msg);
        Taro.hideLoading();
        if (code === 200) {
            let _downLoadSrc = data;
            wx.downloadFile({
                url: _downLoadSrc,
                success: function (result) {
                    console.log("下载文件成功", result)
                    if (Taro.getSystemInfoSync().platform === 'android') {
                        Taro.showToast({ title: '点击右上方的按钮然后保存至手机', icon: 'none', duration: 3000 });
                    } else {
                        Taro.showToast({ title: '点击右上方的按钮然后分享至微信进行查看', icon: 'none', duration: 3000 });
                    }
                    const filePath = result.tempFilePath;  // 临时文件路径
                    setShowExportModel(false);
                    setTimeout(() => {
                        forceUpdate();
                        wx.openDocument({
                            filePath: filePath,
                            showMenu: true, // 预览文件右上方的...
                            success: function (response) {
                                console.log('打开文档成功', response)
                            }
                        })
                    }, 3000);
                }
            })
        } else {
            Taro.showToast({ title: msg, icon: 'none' })
        }
    }

    const chooseCompanyFunc = (obj, index) => {
        if (Object.keys(currentCompany).length === 0 || (currentCompany.companySerialCode !== obj.companySerialCode)) {
            if (supplierListFilterJob.length === 1 && supplierListFilterJob[0].recruitSerialCode === '') {
                console.log('不用重新设置')
            } else {
                setSupplierListFilterJob([{
                    title: '全部岗位',
                    recruitSerialCode: '',
                    selected: false
                }]);
            }
        }
        setCurrentCompany(obj);
        setCompanyList(list => {
            list.forEach(i => {
                i.selected = false
            })
            list[index].selected = true
            return list;
        })

        setTimeout(() => {
            setShowCompanyModel(false);
        }, 200);
    }


    return (
        <View className='container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <View className='search_content'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                        {/* <View className='search_input_view'>搜索姓名、手机号、身份证号</View> */}
                        <Input className='search_input'
                            value={searchValue}
                            placeholder='搜索姓名、手机号、身份证号'
                            placeholderStyle='color: #999999;'
                            confirmType='search'
                            onInput={(e) => { setSearchValue(e.detail.value); }}
                            onConfirm={(e) => {
                                setgoonLoad(true);
                                getList(1);
                            }}
                        ></Input>
                    </View>
                </View>
            </View>

            <View className='search_wrapper'>
                <View className='filter_wrapper'>
                    <View className='filter_wrap_item' onClick={() => setShowCompanyModel(true)}>
                        <View>{currentCompany?.name}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                    <View className='filter_wrap_item' onClick={() => {
                        if (Object.keys(currentCompany).length === 0) {
                            return Taro.showToast({ title: '请先选择公司', icon: 'none' })
                        }
                        Taro.navigateTo({ url: `/pages/supplierPackage/filterJob/index?companySerialCode=${currentCompany.companySerialCode}` })
                    }}>
                        <View>{supplierListFilterJob.length === 1 ? supplierListFilterJob[0].title : supplierListFilterJob[0].title + '等' + supplierListFilterJob.length + '个岗位'}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                    <View className='filter_wrap_item' onClick={() => setShowFilterDate(true)}>
                        <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                </View>

                <ScrollView
                    className='tab_scroll'
                    scrollWithAnimation
                    scrollX
                    enhanced
                    bounces
                    showScrollbar={false}
                >
                    {
                        tabList.map((item, index) => {
                            return (
                                <View onClick={() => swtitchCurrentTab(index)} className={`tab_item ${currentTab === index ? 'tab_item_active' : ''} `} key={index}>{item.name}</View>
                            )
                        })
                    }
                </ScrollView>

                <View className='search_total'>
                    <View className='search_total_left'>共计 <Text>{totalCount}</Text> 人</View>
                    <View className='search_total_right_wrap'>
                        {/* <View className='search_total_right_item' onClick={() => Taro.navigateTo({ url: '/pages/newPackage/newWorker/index?entryChannel=SOURCE&onSite=1' })}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
                            <View>新增</View>
                        </View> */}

                        <View className='search_total_right_item' onClick={() => exportAllFunc()}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon49.webp`}></Image>
                            <View>导出</View>
                        </View>
                    </View>
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
                            <View onClick={() => chooseItemFunc(item, index)} className='roster_item' key={index} style='padding:30rpx 40rpx 30rpx 68rpx;'>
                                <View className='roster_item_wrap'>
                                    <View className='roster_item_wrap_left'>
                                        <View className='roster_item_title'>
                                            <View className='item_title_index'>{index + 1}</View>
                                            <View className='item_title_left'>
                                                <View className='item_title_name'>{item.name}</View>
                                                {
                                                    item.phone &&
                                                    <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                                }
                                                <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                                            </View>

                                        </View>
                                        <View className='roster_item_detail'>
                                            <View className='roster_item_detail_content'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}{((item.sex === 0 || item.sex === 1) && item.ethnicity) ? '·' : ''}{item.ethnicity ? item.ethnicity : ''}{item.ethnicity && item.idCardNo ? '·' : ''}{item.idCardNo ? item.idCardNo : ''}</View>
                                        </View>
                                        <View className='roster_item_job'>{item.recruitTitle}</View>
                                        {
                                            item.sourceDesc && <View className='roster_item_job'>来源：{item.sourceDesc}</View>
                                        }
                                        {
                                            item.cooperationModel && <View className='roster_item_job'>合作模式：{item.cooperationModel}</View>
                                        }
                                        <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                                    </View>
                                    <View className='roster_item_wrap_right'>
                                        <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }}>
                                            <View>{getStatus(item.seekState, 1)}</View>
                                        </View>
                                    </View>
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

            {/* 客户池筛选日期组件 */}
            <Block>
                <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
            </Block>

            <Block>
                {
                    showExportModel &&
                    <View className='export_model'>
                        <View className='export_model_content'>
                            <Image onClick={() => setShowExportModel(false)} className='export_model_close' src={`${Taro.$cdnUrl}/index/index_icon54.webp`}></Image>
                            <View className='export_model_title'>导出全部名单</View>
                            <Image className='export_model_img' onClick={() => exportAllFunc()} src={`${Taro.$cdnUrl}/index/index_icon53.webp`}></Image>
                            {/* {
                                (onSiteFilterJob.recruitSerialCode && onSiteFilterSUPPLIER.userSerialCode) ?
                                    <Button open-type='share' className='export_model_btn'>导出为小程序页面</Button> :
                                    <Button className='export_model_btn' onClick={() => {
                                        Taro.showToast({
                                            title: '请选择具体的岗位和供应商',
                                            icon: 'none',
                                        })
                                    }}>导出为小程序页面</Button>
                            } */}

                        </View>
                    </View>
                }
            </Block>

            {/* 选择公司 */}
            <Block>
                {
                    showCompanyModel &&
                    <AtFloatLayout catchMove className='supplier_init_layout' isOpened={showCompanyModel} onClose={() => { setShowCompanyModel(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View>选择公司</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowCompanyModel(false) }}></AtIcon>
                                </View>
                                <ScrollView scrollY
                                    className='sup_scrollWrapper'
                                    scrollWithAnimation
                                    showScrollbar={false}
                                    enablePassive
                                    refresherEnabled
                                    refresherTriggered={companyIsRefresh}
                                    onScrollToLower={handleCompanyScrollToLower}
                                    onRefresherRefresh={handleCompanyScrollToUpper}
                                    lowerThreshold={300}>
                                    {
                                        companyList.length > 0 && companyList.map((item, index) => {
                                            return (
                                                <View onClick={() => chooseCompanyFunc(item, index)} className={`sup_item ${item.selected ? 'sup_item_active' : ''}`} key={index}>
                                                    {item.name}
                                                </View>
                                            )
                                        })
                                    }
                                    {
                                        companyList.length >= 7 &&
                                        <Taro.LoadMore goonLoad={companyGoonLoad}></Taro.LoadMore>
                                    }
                                    {
                                        companyList.length === 0 && companyRequestState === 3 &&
                                        <Taro.NoData></Taro.NoData>
                                    }
                                </ScrollView>

                                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                            </View>
                        </View>
                    </AtFloatLayout>
                }
            </Block>

            <TabBar actCurrent={1} />
        </View>
    )
})

export default inject('store')(Index)
