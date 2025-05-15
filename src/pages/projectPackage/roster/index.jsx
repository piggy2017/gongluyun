/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-15 11:25:49
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, throttleCustom, throttle, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import CustomDate from '@/components/customDate';
import SourcePicker from '@/components/sourcePcker';
import NewUpdateStatus from '@/components/newUpdateStatus';
import DatePicker from '@/components/datePicker'
import './index.scss'

import { contractsgetRoster, updateInterviewer, batchUpdateInterviewer, downloadRoster } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        userStore: { myPermissions, role },
        businessStore: { rosterFilterSupplier, setRosterFilterSupplier, exchangeJobInfo, setExchangeJobInfo },
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
        { state: '', name: "全部" }, { name: '待处理', state: 'PENDING', },
        { name: '已联系', state: 'CONTACT', },
        { name: '不合适', state: 'UNSUITABLE', },
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
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项
    const [chooseList, setChooseList] = useState([]);                    // 选中的列表
    const [showExportModel, setShowExportModel] = useState(false);       // 是否显示导出弹窗
    const [editCustom, setEditCustom] = useState({});                    // 当前需要更改的客户信息
    const [customRequestParams, setCustomRequestParams] = useState({});  // 当前请求参数

    const [showSourcePicker, setShowSourcePicker] = useState(false);              //  是否显示切换状态的弹窗
    const [showFilterDate, setShowFilterDate] = useState(false);                  //  是否显示切换日期的弹窗
    const [sourceObj, setSourceObj] = useState({    // 筛选来源
        source: "", name: '全部来源'
    })
    const [dateObj, setDateObj] = useState({
        dateRange: "",
        endDate: "",
        filterTime: "全部日期",
        startDate: ""
    });

    const [showEditStatus, setShowEditStatus] = useState(false);

    const [showExchangeModel, setShowExchangeModel] = useState(false);   // 是否显示转项目的弹窗
    const [showDatePicker, setShowDatePicker] = useState(false);         // 是否显示转项目的日期选择
    const [dateText, setDateText] = useState("请选择日期");

    useEffect(() => {
        return () => {
            console.log("触发 名单页面卸载")
            setRosterFilterSupplier({
                channelName: '全部供应商',
                channelCode: '',
                selected: false
            })
            setExchangeJobInfo({
                title: '',
                recruitSerialCode: '',
                edit: false
            })
        }
    }, [])

    useEffect(() => {
        const { title, recruitSerialCode } = route.params;
        setExchangeJobInfo({
            title,
            recruitSerialCode,
            edit: false
        })
        setTitle(title);
    }, [])

    useDidShow(() => {
        if (exchangeJobInfo.edit) {
            setExchangeJobInfo({
                ...exchangeJobInfo,
                edit: false
            })
        } else {
            getList(1);
        }
    })

    useEffect(() => {
        getList(1);
    }, [currentTabIndex, sourceObj, rosterFilterSupplier, dateObj])

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
            setShowbottomOptions(false);
        }
    }, [chooseList])

    const getList = throttleCustom(async (_pageNo) => {    // 获取名单列表
        const { recruitSerialCode } = route.params;
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            seekState: tabList[currentTabIndex].state,
            searchInfo: searchValue,
            recruitSerialCode,
            channelCode: rosterFilterSupplier.channelCode,
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
    }, 1000)

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
        if (role === 'CUSTOMER') {
            setShowEditStatus(true);
            setEditCustom(obj);
            // if (obj.seekState === 'PENDING' || obj.seekState === 'CONTACT' || obj.seekState === 'UNSUITABLE') {
            // } else {
            //     Taro.showToast({ title: '您无法修改', icon: 'none' });
            // }
        } else if (role === 'ON_SITE') {
            if (obj.seekState != 'PENDING' && obj.seekState != 'CONTACT' && obj.seekState != 'UNSUITABLE') {
                setShowEditStatus(true);
                setEditCustom(obj);
            } else {
                Taro.showToast({ title: '您无法修改', icon: 'none' });
            }
        }
        else {
            setShowEditStatus(true);
            setEditCustom(obj);
        }
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
        }
    }

    const doneBtn = () => {    // 点击完成按钮
        setShowbottomOptions(false);
        setBatchOperations(false);
    }

    const customDateSelect = (e) => {      // 选择日期的回调
        console.log("自定义选择日期组件 customDateSelect", e);
        setDateObj(e);
    }

    const sourcePickerSelect = (e) => {    // 选择来源的回调
        console.log("source", e);
        setSourceObj(e);
    }

    const goAddWorker = () => {
        const { recruitSerialCode, title } = route.params;
        Taro.navigateTo({ url: `/pages/newPackage/newProjectWorker/index?recruitSerialCode=${recruitSerialCode}&title=${title}` })
    }

    const changeStatus = (e, reason, date) => {
        console.log("changeStatus", e, reason, date);
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
                if (e === 'EMPLOYED') {        // 已入职
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
                setShowbottomOptions(false);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    const exportFunc = () => {
        setShowExportModel(true);
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

    const newEditStatusFunc = (status, failReason, date) => {
        console.log("newEditStatusFunc", status, failReason, date);
        // return
        if (batchOperations) {     // 批量修改
            changeStatusBatch(status, failReason, date);
        } else {                   // 单个修改
            changeStatus(status, failReason, date);
        }
    }

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        setDateText(e);
    }

    const exchangeJobFunc = () => {
        if (chooseList.length === 0) {
            return Taro.showToast({ title: '请先选择用户', icon: 'none' });
        }
        // 后续需要判断当前的用户角色,只有管理员才能操作
        setShowExchangeModel(true);
    }

    const postExchangeFunc = () => {
        if (!dateText || dateText === '请选择日期') {
            Taro.showToast({ title: '请选择日期', icon: 'none' });
            return;
        }
        let _list = chooseList.map(item => {
            let obj = {
                uuid: item,
                seekState: 'SCHEDULED_INTERVIEW',
                interviewDate: dateText,
                recruitSerialCode: exchangeJobInfo.recruitSerialCode
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
                setShowbottomOptions(false);
                setShowExchangeModel(false);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    const searchFunc = throttle(() => {
        getList(1);
        setgoonLoad(true);
    }, 300);

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
                        onConfirm={searchFunc}
                        value={searchValue}></Input>
                </View>
                <View className='filter_wrapper'>
                    {/* <View className='filter_wrap_item' onClick={() => setShowSourcePicker(true)}>
                        <View>{sourceObj.name}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View> */}
                    {
                        role === 'ADMIN' &&
                        <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/projectPackage/chooseSupplier/index?type=1` }) }}>
                            <View>{rosterFilterSupplier.channelName}</View>
                            <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                        </View>
                    }

                    {/* <View className='filter_wrap_item'>
                        <View>全部岗位</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View> */}
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
                                    if (role === 'ADMIN') {
                                        exportFunc();
                                    } else {
                                        exportAllFunc();
                                    }
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
                                        {
                                            item.phone &&
                                            <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                        }
                                        <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                                    </View>
                                </View>
                                <View className='roster_item_detail'>
                                    <View className='roster_item_detail_content'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}{((item.sex === 0 || item.sex === 1) && item.ethnicity) ? '·' : ''}{item.ethnicity ? item.ethnicity : ''}{item.ethnicity && item.idCardNo ? '·' : ''}{item.idCardNo ? item.idCardNo : ''}</View>
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
                                    item.sourceDesc && <View className='roster_item_source'>来源：{item.sourceDesc}</View>
                                }
                                {
                                    role === 'ADMIN' && item.cooperationModel &&
                                    <View className='roster_item_source'>合作模式：{item.cooperationModel}</View>
                                }
                                <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                                {
                                    item.remark &&
                                    <View className='roster_item_time'>备注：{item.remark}</View>
                                }
                                {
                                    item.company && <View className='roster_item_time'>公司简称：{item.company}</View>
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

            <Block>
                {
                    showExportModel &&
                    <View className='export_model'>
                        <View className='export_model_content'>
                            <Image onClick={() => setShowExportModel(false)} className='export_model_close' src={`${Taro.$cdnUrl}/index/index_icon54.webp`}></Image>
                            <View className='export_model_title'>导出全部名单</View>
                            <Image className='export_model_img' onClick={() => exportAllFunc()} src={`${Taro.$cdnUrl}/index/index_icon53.webp`}></Image>
                        </View>
                    </View>
                }
            </Block>

            {/* 底部操作栏 */}
            <Block>
                {
                    batchOperations &&
                    <View className='footer_wrapper'>
                        <View className='footer_wrapper_top' style={`height:16rpx;`}>

                        </View>
                        <View className='footer_wrapper_content'>
                            <View className='footer_wrapper_left' onClick={() => chooeAllFunc()}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon2${chooseAll ? 7 : 8}.webp`}></Image>
                                <View>全选</View>
                            </View>
                            {
                                (role === 'ADMIN' || role === 'CUSTOMER') &&
                                <View className='change_job_1' onClick={() => exchangeJobFunc()}>转项目</View>
                            }

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

            {/* 筛选日期组件 */}
            <Block>
                <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
            </Block>

            {/* 筛选线索来源 */}
            <Block>
                <SourcePicker showPicker={showSourcePicker} onClose={() => { setShowSourcePicker(false) }} onChange={sourcePickerSelect}></SourcePicker>
            </Block>

            {/* 新的修改状态 */}
            <Block>
                <NewUpdateStatus showPicker={showEditStatus} currentStatus={editCustom?.seekState} onClose={() => { setShowEditStatus(false) }} onChange={newEditStatusFunc}></NewUpdateStatus>
            </Block>

            {/* 转项目 */}
            <Block>
                <AtFloatLayout catchMove className='exchangeJob_init_layout' isOpened={showExchangeModel} onClose={() => { setShowExchangeModel(false) }}>
                    <View className='exchangeJob_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>转项目</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowExchangeModel(false) }}></AtIcon>
                            </View>

                            <View className='exchangeJob_content'>
                                <View className='exchangeJob_content_item'>
                                    <View className='exchangeJob_content_item_label'>
                                        <View className='exchangeJob_content_item_label_icon'></View>
                                        <View>岗位</View>
                                    </View>
                                    <View className='exchangeJob_content_item_right' onClick={() => {
                                        Taro.navigateTo({
                                            url: `/pages/talentsPackage/filterJob/index?type=7&title=选择岗位`
                                        })
                                    }}>
                                        <View>{exchangeJobInfo.title}</View>
                                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                                    </View>
                                </View>
                                <View className='exchangeJob_content_hr'></View>
                                {/* <View className='exchangeJob_content_item'>
                                    <View className='exchangeJob_content_item_label'>
                                        <View className='exchangeJob_content_item_label_icon'></View>
                                        <View>当前状态</View>
                                    </View>
                                    <View className='exchangeJob_content_item_right'>
                                        <View>{clientInfos && clientInfos.seekState ? getStatus(clientInfos.seekState) : ''}</View>
                                    </View>
                                </View> */}
                                <View className='exchangeJob_content_hr'></View>
                                <View className='exchangeJob_content_item'>
                                    <View className='exchangeJob_content_item_label'>
                                        <View className='exchangeJob_content_item_label_icon'></View>面试时间</View>
                                    <View className='exchangeJob_content_item_right' onClick={() => { setShowDatePicker(true) }}>
                                        <View>{dateText}</View>
                                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                                    </View>
                                </View>
                            </View>
                            <View className='exchangeJob_content_btn' onClick={() => postExchangeFunc()}>确定</View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>

            <Block>
                <DatePicker defaultValue={dateText} type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>
            </Block>

        </View>
    )
})

export default inject('store')(Index)
