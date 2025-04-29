/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-28 18:10:13
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import CustomDate from '@/components/customDate';
import NewUpdateStatus from '@/components/newUpdateStatus';

import { contractsgetRoster, updateInterviewer, batchUpdateInterviewer, downloadRoster, mySupplierList, batchUpdateSupplier } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        userStore: { myPermissions, companyInfo },
        businessStore: { channelFilterSupplier, setChannelFilterSupplier },
    } = store
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(175);
    const [bottomHeight, setBottomHeight] = useState(90);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [totalCount, setTotalCount] = useState(0);
    const [title, setTitle] = useState('');

    const [list, setList] = useState([]);

    const [tabList, setTabList] = useState([
        { state: '', name: "全部" },
        // { name: '待处理', state: 'PENDING', },
        // { name: '已联系', state: 'CONTACT', },
        // { name: '不合适', state: 'UNSUITABLE', },
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
        // { name: '可结算', state: 'SETTLEMENT', }
    ]);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);           // 当前选中的tab
    const [currentCliskstatus, setCurrentCliskstatus] = useState('');
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    // const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项
    const [chooseList, setChooseList] = useState([]);                    // 选中的列表
    const [showExportModel, setShowExportModel] = useState(false);       // 是否显示导出弹窗
    const [editCustom, setEditCustom] = useState({});                    // 当前需要更改的客户信息
    const [customRequestParams, setCustomRequestParams] = useState({});  // 当前请求参数

    const [showFilterDate, setShowFilterDate] = useState(false);                  //  是否显示切换日期的弹窗
    const [dateObj, setDateObj] = useState({
        dateRange: "",
        endDate: "",
        filterTime: "全部日期",
        startDate: ""
    });
    const [showPatternModel, setShowPatternModel] = useState(false);
    const [currentPattren, setCurrentPattren] = useState('');
    const [showEditStatus, setShowEditStatus] = useState(false);

    const [showSupplierModel, setShowSupplierModel] = useState(false);
    const [supplierList, setSupplierList] = useState([]);
    const [isRefresh2, setIsRefresh2] = useState(false);
    const [goonLoad2, setGoonLoad2] = useState(true);
    const [pageNo2, setPageNo2] = useState(1)
    const pageSize2 = 20;
    const [requestState2, setRequestState2] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [supplierValue, setSupplierValue] = useState('');

    useEffect(() => {
        getSupplierList(1);
        return () => {
            console.log("触发 名单页面卸载")
            setChannelFilterSupplier({
                channelName: '全部供应商',
                // userSerialCode: '',
                channelCode: '',
                selected: false
            })
        }
    }, [])

    useEffect(() => {
        if (!showSupplierModel && supplierList.length > 0) {
            setSupplierList(supplierList => {
                supplierList.forEach(i => {
                    i.selected = false
                })
                return supplierList;
            })
            forceUpdate();
        }
    }, [showSupplierModel])

    useEffect(() => {
        const { title, recruitSerialCode, contractsSerialCode, cooperationModels } = route.params;
        console.log("title, recruitSerialCode, contractsSerialCode ", title, recruitSerialCode, contractsSerialCode, cooperationModels)
        setTitle(title);
    }, [])

    useDidShow(() => {
        getList(1);
    })

    useEffect(() => {
        console.log("roster-channelFilterSupplier", channelFilterSupplier);
        getList(1);
    }, [currentTabIndex, channelFilterSupplier, dateObj])

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
            const _bot = await selectorQueryDomInfo('.footer_wrapper');
            if (_bot?.height) {
                console.log("_bot_bot_bot", _bot.height);
                setBottomHeight(_bot.height)
            }
        }, 0);
    }, [batchOperations])

    useEffect(() => {
        console.log("chooseList", chooseList);
        if (chooseList.length === 0) {
        }
    }, [chooseList])


    const getSupplierList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize: pageSize2,
            companySerialCode: companyInfo.companySerialCode,
            supplierSerialCode: '',
            searchInfo: supplierValue,
        }
        setRequestState2(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await mySupplierList(params);
        Taro.hideLoading();
        console.log("code, data", code, data);
        setIsRefresh2(false);
        if (code === 200 && data?.responses?.length > 0) {
            data.responses.forEach(item => {
                item.selected = false;
            })
            setSupplierList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
            setGoonLoad2(true);
            setPageNo2(data.pageNo);
            setRequestState2(2);
        } else {
            setGoonLoad2(false);
            setRequestState2(3);
            if (_pageNo === 1) {
                setSupplierList([]);
            }
        }
    }
    const handleScrollToLower2 = debounce(() => {    // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        if (goonLoad2) {
            getSupplierList(pageNo2 + 1);
        }
    }, 500);

    const handleScrollToUpper2 = debounce(() => {    // 滑动到最顶部,触发下拉刷新
        setIsRefresh2(true);
        getSupplierList(1);
    }, 200);

    const getList = async (_pageNo) => {    // 获取名单列表
        const { recruitSerialCode } = route.params;
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            seekState: tabList[currentTabIndex].state,
            searchInfo: searchValue,
            recruitSerialCode,
            // source: sourceObj.source,
            channelCode: channelFilterSupplier.channelCode,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate,
            endDate: dateObj.endDate,
            channel: 1
        }
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - ${batchOperations ? bottomHeight : 0}px)`;
    }

    const showOptionFunc = (e, obj, index) => {
        if (batchOperations) return;
        e.stopPropagation();
        setShowEditStatus(true);
        setEditCustom(obj);
    }

    const callUser = (e, obj) => {
        if (batchOperations) return;
        e.stopPropagation();
        Taro.makePhoneCall({
            phoneNumber: obj.phone
        })
    }

    const chooeAllFunc = () => {      // 全选、反选
        if (chooseAll) {
            setChooseList([])
        } else {
            setChooseList(list.map(item => item.uuid))
        }
        setChooseAll(!chooseAll);
        setList(list => {
            let _list = list.map(item => {
                item.isChoosed = !chooseAll
                return item
            })
            return _list
        })
    }

    const editBtnFunc = () => {   // 点击下方的修改状态按钮
        if (chooseList.length > 0) {
            setShowEditStatus(true);
            setEditCustom({})
        }
    }

    const chooseItemFunc = (obj, index) => {
        if (batchOperations) {
            setList(list => {
                let _list = list.map((item, i) => {
                    if (i === index) {
                        item.isChoosed = !item.isChoosed
                    }
                    return item
                })
                setChooseList(_list.filter(item => item.isChoosed).map(item => item.uuid))
                return _list
            })
        } else {
            Taro.navigateTo({
                url: `/pages/channelPackage/clientDetail/index?uid=${obj.uuid}&phone=${obj.phone}`
            })
        }
    }

    const doneBtn = () => {    // 点击完成按钮
        setBatchOperations(false);
    }

    const customDateSelect = (e) => {      // 选择日期的回调
        console.log("自定义选择日期组件 customDateSelect", e);
        setDateObj(e);
    }

    const goAddWorker = () => {
        const { recruitSerialCode, title } = route.params;
        Taro.navigateTo({ url: `/pages/newPackage/newProjectWorker/index?phoneRule=1&recruitSerialCode=${recruitSerialCode}&title=${title}&channelCode=${channelFilterSupplier.channelCode}` })
    }

    const changeStatus = (e, reason, date) => {
        console.log("changeStatus", e, reason, date);
        setCurrentCliskstatus(e);
        let params = {
            uuid: editCustom.uuid,
            seekState: e
        }
        if (reason) {
            params.failReason = reason;
        }
        if (date) {
            if (e === 'EMPLOYED') {       // 已入职
                params.employedDate = date;
            } else if (e === 'RESIGN') {   // 已离职
                params.resignDate = date;
            }
        }

        Taro.showLoading({ title: '提交中...' });
        updateInterviewer(params).then(res => {
            Taro.hideLoading();
            if (res.code === 200) {
                Taro.showToast({ title: '更新成功', icon: 'none' })
                // setClientInfos({ ...clientInfos, seekState: e });
                getList(1);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    const changeStatusBatch = (e, reason, date) => {    // 批量修改状态
        console.log("changeStatusBatch", e, reason, date);
        if (chooseList.length === 0) {
            return Taro.showToast({ title: '请先选择用户', icon: 'none' });
        }
        let _list = chooseList.map(item => {
            let obj = {
                uuid: item,
                seekState: e
            }
            if (reason) {
                obj.failReason = reason;
            }
            if (date) {
                if (e === 'EMPLOYED') {       // 已入职
                    obj.employedDate = date;
                } else if (e === 'RESIGN') {   // 已离职
                    obj.resignDate = date;
                }
            }
            return obj
        })
        Taro.showLoading({ title: '提交中...' });
        batchUpdateInterviewer(_list).then(res => {
            Taro.hideLoading();
            if (res.code === 200) {
                Taro.showToast({ title: '更新成功', icon: 'none' })
                getList(1);
                setChooseList([]);
                setChooseAll(false);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
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


    const setPatternFunc = () => {
        if (list.length === 0) {
            return Taro.showToast({ title: '暂无数据', icon: 'none' });
        }
        if (chooseList.length === 0) {
            return Taro.showToast({ title: '请先选择用户', icon: 'none' });
        }
        if (JSON.parse(route.params.cooperationModels).length === 0) {
            return Taro.showToast({ title: '当前项目暂无合作模式', icon: 'none' });
        }
        setShowPatternModel(true);
    }

    const getChoosePattern = async (value) => {   // 选择合作模式的回调
        console.log("选择的模式", value);
        // setShowPatternModel(false);
        let _list = chooseList.map(item => {
            let obj = {
                uuid: item,
                cooperationModel: value
            }
            return obj
        })
        Taro.showLoading({ title: '提交中...' });
        batchUpdateInterviewer(_list).then(res => {
            Taro.hideLoading();
            if (res.code === 200) {
                Taro.showToast({ title: '更新成功', icon: 'none' })
                getList(1);
                setChooseList([]);
                setChooseAll(false);
                setShowPatternModel(false);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    const newEditStatusFunc = (status, failReason, date) => {
        console.log("newEditStatusFunc", status, failReason, date);
        if (batchOperations) {     // 批量修改
            changeStatusBatch(status, failReason, date);
        } else {                   // 单个修改
            changeStatus(status, failReason, date);
        }
    }

    const chooseSupplierFunc = async (obj, index) => {    // 设置供应商
        setSupplierList(supplierList => {
            supplierList.forEach(i => {
                i.selected = false
            })
            supplierList[index].selected = true;
            console.log('supplierList---===', supplierList)
            return supplierList;
        })
        forceUpdate();
        // let _list = chooseList.map(item => {
        //     let _obj = {
        //         uuid: item,
        //         supplierSerialCode: obj.supplierSerialCode
        //     }
        //     return _obj
        // })
        let params = {
            uuids: chooseList,
            supplierSerialCode: obj.supplierSerialCode
        }
        Taro.showLoading({ title: '提交中...' });
        const { code, data, msg } = await batchUpdateSupplier(params);
        console.log("批量设置供应商的结果:", code, data, msg);
        Taro.hideLoading();
        if (code === 200) {
            Taro.showToast({ title: '更新成功', icon: 'none' })
            setChooseList([]);
            setChooseAll(false);
            getList(1);
            setTimeout(() => {
                setShowSupplierModel(false);
            }, 500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' })
        }
    }

    return (
        <View className='container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <Image className='back_icon' src={`${Taro.$cdnBackIcon}`} onClick={() => Taro.navigateBack({ delta: 1 })}></Image>
                    <View className='project_name'>{title}</View>
                </View>
            </View>

            <View className='search_wrapper'>
                <View style={`height: 18rpx;`}></View>
                <View className='search_content'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                    <Input className='search_input'
                        placeholder='搜索姓名、手机号、身份证号'
                        confirmType='search'
                        placeholderStyle='color: #777777;'
                        onInput={(e) => { setSearchValue(e.detail.value) }}
                        onConfirm={(e) => {
                            setgoonLoad(true);
                            getList(1);
                        }}
                        value={searchValue}></Input>
                </View>
                <View className='filter_wrapper'>
                    {
                        <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/channelPackage/chooseSupplier/index?contractsSerialCode=${route.params.contractsSerialCode}` }) }}>
                            <View>{channelFilterSupplier.channelName}</View>
                            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                        </View>
                    }
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
                                <View onClick={() => setCurrentTabIndex(index)} className={`tab_item ${currentTabIndex === index ? 'tab_item_active' : ''} `} key={index}>{item.name}</View>
                            )
                        })
                    }
                </ScrollView>

                <View className='search_total'>
                    <View className='search_total_left'>共计 <Text>{totalCount}</Text> 人</View>
                    <View className='search_total_right_wrap'>

                        {
                            myPermissions.includes('12') &&
                            <View className='search_total_right_item' onClick={goAddWorker}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
                                <View>新增</View>
                            </View>
                        }
                        {
                            myPermissions.includes('20') &&
                            <>
                                <View className='search_total_right_item' onClick={() => {
                                    exportAllFunc();
                                }}>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon49.webp`}></Image>
                                    <View>导出</View>
                                </View>
                            </>
                        }

                        {
                            batchOperations ?
                                <View className='search_total_right_t' onClick={() => doneBtn()}>完成</View> :
                                <View className='search_total_right' onClick={() => setBatchOperations(true)}>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon33.webp`}></Image>
                                    <View>多选</View>
                                </View>
                        }
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
                            <View onClick={() => chooseItemFunc(item, index)} className='roster_item' key={index} style={`padding:${batchOperations ? '30rpx 28rpx 30rpx 126rpx' : '30rpx 40rpx 30rpx 68rpx'}`}>
                                <View className='roster_item_title'>
                                    <View className='item_title_index'>{index + 1}</View>
                                    <View className='item_title_left'>
                                        <View className='item_title_name'>{item.name}</View>
                                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                        <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                                    </View>
                                </View>
                                <View className='roster_item_detail'>
                                    <View className='roster_item_detail_content'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}{((item.sex === 0 || item.sex === 1) && item.idCardNo) ? '·' : ''}{item.idCardNo ? item.idCardNo : ''}</View>
                                    <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }} onClick={(e) => {
                                        if (!myPermissions.includes('14')) {
                                            return
                                        }
                                        showOptionFunc(e, item, index);
                                    }}>
                                        <View>{getStatus(item.seekState)}</View>
                                        {
                                            myPermissions.includes('14') &&
                                            <AtIcon value='chevron-down' size='14' color={getColor(item.seekState)}></AtIcon>
                                        }
                                    </View>
                                </View>
                                {
                                    item.sourceDesc && <View className='roster_item_time'>来源：{item.sourceDesc}</View>
                                }
                                <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                                {
                                    item.cooperationModel &&
                                    <View className='roster_item_time'>合作模式：{item.cooperationModel}</View>
                                }

                                {
                                    batchOperations && <Image className='roster_item_choose' src={`${Taro.$cdnUrl}/index/index_icon2${item.isChoosed ? 7 : 8}.webp`}></Image>
                                }
                            </View>
                        )
                    })
                }
                {
                    list.length >= 6 &&
                    <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                }

                {
                    list.length === 0 && requestState === 3 &&
                    <Taro.NoData></Taro.NoData>
                }
            </ScrollView>

            {/* 底部操作栏 */}
            <Block>
                {
                    batchOperations &&
                    <View className='footer_wrapper'>
                        <View className='footer_wrapper_top' style='height:16rpx;'>
                        </View>
                        <View className='footer_wrapper_content'>
                            <View className='footer_wrapper_left' onClick={() => chooeAllFunc()}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon2${chooseAll ? 7 : 8}.webp`}></Image>
                                <View>全选</View>
                            </View>

                            <View className='footer_wrapper_pattern' onClick={() => {
                                if (chooseList.length === 0) {
                                    return Taro.showToast({ title: '请先选择用户', icon: 'none' });
                                }
                                setShowSupplierModel(true);
                            }}>归属供应商</View>

                            <View className='footer_wrapper_pattern' onClick={setPatternFunc}>合作模式</View>

                            <View
                                className={`footer_btn ${chooseList.length > 0 ? 'footer_btn_active' : ''}`}
                                onClick={() => {
                                    if (myPermissions.includes('14')) {
                                        editBtnFunc();
                                    } else {
                                        Taro.showToast({ title: '暂无权限', icon: 'none' });
                                    }
                                }}>修改状态</View>
                        </View>
                        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                    </View>
                }
            </Block>

            {/* 新的修改状态 */}
            <Block>
                <NewUpdateStatus showPicker={showEditStatus} currentStatus={editCustom?.seekState} onClose={() => { setShowEditStatus(false) }} onChange={newEditStatusFunc}></NewUpdateStatus>
            </Block>

            {/* 筛选日期组件 */}
            <Block>
                <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
            </Block>

            <Block>
                {
                    route.params.cooperationModels &&
                    <Taro.ChoosePattern initItem={currentPattren} list={JSON.parse(route.params.cooperationModels)} showPicker={showPatternModel} onClose={() => setShowPatternModel(false)} onchange={getChoosePattern}></Taro.ChoosePattern>
                }
            </Block>

            {/* 选择供应商 */}
            <Block>
                {
                    showSupplierModel &&
                    <AtFloatLayout catchMove className='supplier_init_layout' isOpened={showSupplierModel} onClose={() => { setShowSupplierModel(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View>选择供应商</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowSupplierModel(false) }}></AtIcon>
                                </View>
                                <View className='search_content'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                                    <Input className='search_input'
                                        // disabled={(!isLogin || (role === 'SEEK' && !companyVerified)) ? true : false}
                                        placeholder='搜索供应商'
                                        confirmType='search'
                                        placeholderStyle='color: #777777;'
                                        onInput={(e) => { setSupplierValue(e.detail.value) }}
                                        onConfirm={() => {
                                            setgoonLoad(true);
                                            getSupplierList(1);
                                        }}
                                        value={supplierValue}></Input>
                                </View>
                                <ScrollView scrollY
                                    className='sup_scrollWrapper'
                                    scrollWithAnimation
                                    showScrollbar={false}
                                    enablePassive
                                    refresherEnabled
                                    refresherTriggered={isRefresh2}
                                    onScrollToLower={handleScrollToLower2}
                                    onRefresherRefresh={handleScrollToUpper2}
                                    lowerThreshold={300}>
                                    {
                                        supplierList.length > 0 && supplierList.map((item, index) => {
                                            return (
                                                <View onClick={() => chooseSupplierFunc(item, index)} className={`sup_item ${item.selected ? 'sup_item_active' : ''}`} key={index}>
                                                    {item.name}
                                                </View>
                                            )
                                        })
                                    }
                                    {
                                        supplierList.length >= 7 &&
                                        <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                                    }
                                    {
                                        supplierList.length === 0 && requestState2 === 3 &&
                                        <Taro.NoData></Taro.NoData>
                                    }
                                </ScrollView>

                                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                            </View>
                        </View>
                    </AtFloatLayout>
                }
            </Block>

        </View>
    )
})

export default inject('store')(Index)
