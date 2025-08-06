/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-07-07 11:42:26
 * @LastEditors: 孙林
 * @LastEditTime: 2025-08-06 10:30:24
 * @Description: 
 */


import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Button, ScrollView, Text, Block, Input } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, throttleCustom, throttle, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import CustomDate from '@/components/customDate';
import IndexRosterUpdateStatus from '@/components/indexRosterUpdateStatus';

import { employedList, contractsgetRoster, contractsSign, updateInterviewer, batchUpdateInterviewer, downloadRoster, exportRoster } from '@/util/api'

const Index = observer(({ store }) => {
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        userStore: { role },
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight, platform },
        businessStore: { setEditClientInfos, channelListSupplier, setChannelListSupplier, adminRosterFilterJob, setAdminRosterFilterJob, onsiteRosterFilterJob, setOnsiteRosterFilterJob
        },
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
        { name: '已入职', state: 'EMPLOYED', },
        { name: '已离职', state: 'RESIGN', },
    ]);
    const [currentTab, setCurrentTab] = useState(0);
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项
    const [chooseList, setChooseList] = useState([]);                    // 选中的uuid列表
    const [chooseObjList, setChooseObjList] = useState([]);              // 选中的列表
    const [showFilterDate, setShowFilterDate] = useState(false);         // 是否显示切换日期的弹窗

    const [showExportModel, setShowExportModel] = useState(false);       // 是否显示导出弹窗
    const [editCustom, setEditCustom] = useState({});                    // 当前需要更改的客户信息
    const [customRequestParams, setCustomRequestParams] = useState({});  // 当前请求参数

    const [dateObj, setDateObj] = useState({
        dateRange: "",
        endDate: "",
        filterTime: "全部日期",
        startDate: ""
    });
    const [showEditStatus, setShowEditStatus] = useState(false);

    useDidShow(() => {
        getList(1);
    })

    useEffect(() => {
        return () => {
            setChannelListSupplier([
                {
                    channelName: '全部供应商',
                    channelCode: '',
                    selected: false
                }
            ])

            setAdminRosterFilterJob([
                {
                    title: '全部岗位',
                    recruitSerialCode: '',
                    selected: false
                }
            ])
            setOnsiteRosterFilterJob([
                {
                    title: '全部岗位',
                    recruitSerialCode: '',
                    selected: false
                }
            ])
        }
    }, [])

    useEffect(() => {
        getList(1);
    }, [currentTab, dateObj, adminRosterFilterJob, onsiteRosterFilterJob])

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
        console.log("chooseObjList_发生了变化", chooseObjList);
        if (chooseObjList.length === 0) {
            setShowbottomOptions(false);
        }
    }, [chooseObjList])

    const customDateSelect = (e) => {      // 选择日期的回调
        console.log("自定义选择日期组件 customDateSelect", e);
        setDateObj(e);
    }

    const getList = throttleCustom(async (_pageNo, type) => {    // 获取名单列表,  type 是否是更改状态后的请求
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let _jobFilter = role === 'ADMIN' ? adminRosterFilterJob : onsiteRosterFilterJob;
        let _recruitSerialCodes = _jobFilter.map(item => item.recruitSerialCode);
        if (_recruitSerialCodes.length === 1 && _recruitSerialCodes[0] === '') {
            _recruitSerialCodes = [];
        }

        let _channelCodes = channelListSupplier.map(item => item.channelCode);
        if (_channelCodes.length === 1 && _channelCodes[0] === '') {
            _channelCodes = [];
        }

        let params = {
            pageNo: _pageNo,
            pageSize,
            seekState: tabList[currentTab].state,
            searchInfo: searchValue,
            recruitSerialCodes: _recruitSerialCodes,
            channelCodes: _channelCodes,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate,
            endDate: dateObj.endDate,
        }
        console.log("params", params);
        const { code, data } = await employedList(params);
        console.log("获取名单列表", code, data);
        setCustomRequestParams({ ...params });
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            if (batchOperations && chooseObjList.length > 0 && !type) {
                let _uuids = chooseObjList.map(item => item.uuid);
                for (let i = 0; i < data.responses.length; i++) {
                    if (_uuids.includes(data.responses[i].uuid)) {
                        data.responses[i].isChoosed = true;
                    }
                }
            }
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

    const swtitchCurrentTab = (item) => {    // 切换分类tab
        if (item === currentTab) return;
        setCurrentTab(item);
        setBatchOperations(false);
        setChooseList([]);
        setChooseObjList([]);
        setChooseAll(false);
        setShowbottomOptions(false);
    }

    const showOptionFunc = (e, obj, index) => {
        if (batchOperations) return;
        if (obj.seekState === 'RESIGN') return;   // 已离职的状态不可修改
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
            setChooseList([]);
            setChooseObjList(chooseObjList => {
                let _list = JSON.parse(JSON.stringify(chooseObjList));
                const arr2Ids = new Set(list.map(item => item.uuid));
                const arr3 = _list.filter(item => !arr2Ids.has(item.uuid));
                return arr3
            })
        } else {
            setChooseList(list.map(item => item.uuid));
            setChooseObjList(chooseObjList => {
                let _list = JSON.parse(JSON.stringify(chooseObjList));
                const arr3 = Array.from(
                    [..._list, ...list].reduce((map, obj) => map.set(obj.uuid, obj), new Map()).values()
                );
                return arr3;
            })
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

    const editBtnFunc = () => {                // 点击下方的修改状态按钮
        if (currentTab === 2) {  // 已离职不可修改
            Taro.showToast({ title: '当前状态不可修改', icon: 'none', duration: 2000 });
            return;
        }
        if (chooseObjList.length > 0) {
            // setShowbottomOptions(!showbottomOptions);
            setShowEditStatus(true);
            setEditCustom({});
        }
    }

    const chooseItemFunc = (obj, index) => {   // 选中某一项
        console.log('选中某一项_obj', obj);
        if (batchOperations) {
            if (obj.isChoosed) {  // 如果当前是选中的,则移除
                setChooseObjList(chooseObjList => {
                    return chooseObjList.filter(item => item.uuid !== obj.uuid);
                })
            } else {
                setChooseObjList(chooseObjList => {
                    return [...chooseObjList, obj];
                })
            }
            setList(list => {
                let _list = list.map((item, i) => {
                    if (i === index) {
                        item.isChoosed = !item.isChoosed
                    }
                    return item
                })
                // setChooseList(_list.filter(item => item.isChoosed).map(item => item.uuid));
                return _list
            })
        } else {
            // Taro.navigateTo({
            //     url: `/pages/talentsPackage/clientDetail/index?uid=${obj.uuid}&myClientCount=${totalCount}&index=${index * 1 + 1}&type=1&notEdit=${dataSource === 'OWN_REPORT' ? 1 : ''}`
            // })
        }
    }

    const doneBtn = () => {    // 点击完成按钮
        setShowbottomOptions(false);
        setBatchOperations(false);
        setChooseObjList([]);
        setChooseList([]);
        setChooseAll(false);
        setList(list => {
            let _list = list.map(item => {
                item.isChoosed = false;
                return item
            })
            return _list
        })
    }

    const changeItemState = (state, reason, date) => {    // 单个修改状态
        Taro.showLoading({ title: '提交中...' });
        let params = {
            uuid: editCustom.uuid,
            seekState: state
        }
        if (reason) {
            params.failReason = reason;
        }
        if (date) {
            if (state === 'EMPLOYED') {       // 已入职
                params.employedDate = date;
            } else if (state === 'RESIGN') {   // 已离职
                params.resignDate = date;
            }
        }

        updateInterviewer(params).then(res => {
            Taro.hideLoading();
            if (res.code === 200) {
                Taro.showToast({ title: '更新成功', icon: 'none' })
                // getList(1, 1);
                setList(list => {
                    let _list = list.map(item => {
                        if (item.uuid === editCustom.uuid) {
                            item.seekState = state;
                            item.failReason = reason;
                            if (state === 'EMPLOYED') {       // 已入职
                                item.employedDate = date;
                            } else if (state === 'RESIGN') {   // 已离职
                                item.resignDate = date;
                            }
                        }
                        return item
                    })
                    return _list
                })
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    const batchChangeState = (state, reason, date) => {    // 批量修改状态
        if (chooseObjList.length === 0) {
            return Taro.showToast({ title: '请先选择用户', icon: 'none' });
        }
        let _list = chooseObjList.map(item => {
            let obj = {
                uuid: item.uuid,
                seekState: state
            }
            if (reason) {
                obj.failReason = reason;
            }
            if (date) {
                if (state === 'EMPLOYED') {       // 已入职
                    obj.employedDate = date;
                } else if (state === 'RESIGN') {   // 已离职
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
                // getList(1, 1);
                setList(list => {
                    let _list = list.map(item => {
                        if (chooseObjList.some(obj => obj.uuid === item.uuid)) {
                            item.seekState = state;
                            item.isChoosed = false;
                            item.failReason = reason;
                            if (state === 'EMPLOYED') {       // 已入职
                                item.employedDate = date;
                            } else if (state === 'RESIGN') {   // 已离职
                                item.resignDate = date;
                            }
                        }
                        return item
                    })
                    return _list
                })
                setChooseList([]);
                setChooseObjList([]);
                setChooseAll(false);
                setShowbottomOptions(false);
                forceUpdate();
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    const newEditStatusFunc = (status, failReason, date) => {
        console.log("newEditStatusFunc", status, failReason, date);
        if (batchOperations) {     // 批量修改
            batchChangeState(status, failReason, date);
        } else {                   // 单个修改
            changeItemState(status, failReason, date);
        }
    }

    const exportAllFunc = async () => {
        if (list.length === 0) {
            return Taro.showToast({ title: '暂无数据', icon: 'none' });
        }
        Taro.showLoading({ title: '导出中...' });
        let params = { ...customRequestParams };
        delete params.pageNo;
        delete params.pageSize;
        const { code, data, msg } = await exportRoster(params);
        console.log("exportRoster", code, data, msg);
        Taro.hideLoading();
        if (code === 200) {
            let _downLoadSrc = data;
            wx.downloadFile({
                url: _downLoadSrc,
                success: function (result) {
                    console.log("下载文件成功", result)
                    if (platform === 'pc') {
                        Taro.setClipboardData({
                            data: _downLoadSrc,
                            success: () => {
                                Taro.showToast({
                                    title: '下载地址已复制到粘贴板,可下载查看',
                                    icon: 'none',
                                    duration: 3000
                                })
                            }
                        })
                    } else {
                        if (Taro.getSystemInfoSync().platform === 'android') {
                            Taro.showToast({ title: '点击右上方的按钮然后保存至手机', icon: 'none', duration: 3000 });
                        } else {
                            Taro.showToast({ title: '点击右上方的按钮然后分享至微信进行查看', icon: 'none', duration: 3000 });
                        }
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

    const searchFunc = throttle(() => {
        getList(1);
        setgoonLoad(true);
    }, 300);

    const deletechooseObjItem = (obj, index) => {  // 删除选中的数据
        console.log("触发 deletechooseObjItem :", obj, index)
        setChooseObjList(chooseObjList => {
            chooseObjList = chooseObjList.filter(item => item.uuid != obj.uuid);
            return chooseObjList;
        })

        setList(list => {
            list = list.map(item => {
                if (item.uuid === obj.uuid) {
                    item.isChoosed = false;
                }
                return item;
            })
            return list;
        })
    }

    const clearChoosed = () => {    // 清空所有的选中数据
        setChooseObjList([]);
        setChooseList([]);
        setChooseAll(false);
        setList(list => {
            list = list.map(item => {
                item.isChoosed = false;
                return item;
            })
            return list;
        })
    }

    const goFilterJob = () => {
        Taro.navigateTo({ url: `/pages/talentsPackage/multipleFilterJob/index?type=${role === 'ADMIN' ? 7 : 8}&title=选择岗位` })
    }

    const goEdit = (e, item) => {
        e.stopPropagation();
        setEditClientInfos({ ...item });
        setTimeout(() => {
            Taro.navigateTo({
                url: `/pages/minePackage/indexRosterEdit/index`
            })
        }, 500);
    }

    return (
        <View className='container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <Image className='my_header_back' src={Taro.$cdnBackIcon} onClick={() => {
                        Taro.navigateBack({ delta: 1 });
                    }}></Image>
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
                </View>
            </View>

            <View className='search_wrapper'>
                <View className='filter_wrapper'>
                    <View className='filter_wrap_item' onClick={goFilterJob}>

                        {
                            role === 'ADMIN' &&
                            <View>
                                {adminRosterFilterJob.length === 1 ? adminRosterFilterJob[0].title : adminRosterFilterJob[0].title + '等' + adminRosterFilterJob.length + '个岗位'}
                            </View> ||
                            role === 'ON_SITE' &&
                            <View>
                                {onsiteRosterFilterJob.length === 1 ? onsiteRosterFilterJob[0].title : onsiteRosterFilterJob[0].title + '等' + onsiteRosterFilterJob.length + '个岗位'}
                            </View>
                        }
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>

                    <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/channelPackage/multipleSupplier/index` }) }}>
                        <View>{channelListSupplier.length === 1 ? channelListSupplier[0].channelName : channelListSupplier[0].channelName + '等' + channelListSupplier.length + '个供应商'}</View>
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
                        <View className='search_total_right_item' onClick={() => exportAllFunc()}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon49.webp`}></Image>
                            <View>导出</View>
                        </View>
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
                                            <View className='roster_item_detail_content'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}{((item.sex === 0 || item.sex === 1) && item.idCardNo) ? '·' : ''}{item.idCardNo ? item.idCardNo : ''}</View>
                                        </View>
                                        <View className='roster_item_job'>{item.recruitTitle}</View>
                                        {
                                            item.sourceDesc && <View className='roster_item_job'>来源：{item.sourceDesc}</View>
                                        }
                                        {
                                            item.interviewDate && <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                                        }
                                        {
                                            item.employedDate && <View className='roster_item_time'>入职时间：{item.employedDate}</View>
                                        }
                                        {
                                            item.resignDate && <View className='roster_item_time'>离职时间：{item.resignDate}</View>
                                        }
                                        {
                                            item.remark && <View className='roster_item_time'>备注：{item.remark}</View>
                                        }
                                        {
                                            item.agentName && <View className='roster_item_time'>推荐人：{item.agentName}</View>
                                        }
                                        {
                                            item.companyName && <View className='roster_item_time'>公司简称：{item.companyName}</View>
                                        }
                                        {
                                            item.emergencyContact && <View className='roster_item_time'>紧急联系人：{item.emergencyContact} {item.emergencyPhoneNo}</View>
                                        }
                                    </View>
                                    <View className='roster_item_wrap_right'>
                                        <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }} onClick={(e) => showOptionFunc(e, item, index)}>
                                            <View>{getStatus(item.seekState, 1)}</View>
                                            {
                                                item.seekState === 'EMPLOYED' &&
                                                <AtIcon value='chevron-down' size='14' color={getColor(item.seekState)}></AtIcon>
                                            }
                                        </View>
                                    </View>

                                    <View className='item_title_copy' onClick={(e) => goEdit(e, item)}>编辑</View>
                                </View>
                                {
                                    batchOperations && <Image className='roster_item_choose' src={`${Taro.$cdnUrl}/index/index_icon2${item.isChoosed ? 7 : 8}.webp`}></Image>
                                }
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

            {/* 新的修改状态 */}
            <Block>
                <IndexRosterUpdateStatus showPicker={showEditStatus} currentStatus={editCustom?.seekState} onClose={() => { setShowEditStatus(false) }} onChange={newEditStatusFunc}></IndexRosterUpdateStatus>
            </Block>

            {/* 底部操作栏 */}
            <Block>
                {
                    batchOperations &&
                    <View className='footer_wrapper'>
                        <View className='footer_wrapper_top' style='height:16rpx;'>
                            {
                                chooseObjList.length > 0 &&
                                <View className='footer_wrapper_chooseObjList_wrap'>
                                    <View className='footer_wrapper_chooseObjList_wrap_title'>
                                        <View>已选数据</View>
                                        <View onClick={clearChoosed} className='footer_wrapper_chooseObjList_wrap_title_clear'>清空</View>
                                    </View>
                                    <View className='footer_wrapper_chooseObjList'>
                                        {
                                            chooseObjList.length > 0 && chooseObjList.map((item, index) => {
                                                return (
                                                    <View className='footer_wrapper_chooseObjList_item' key={item.uuid} onClick={() => deletechooseObjItem(item, index)}>
                                                        {item.name}
                                                        <AtIcon value='close' size='10' color='#1678FF' ></AtIcon>
                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                            }
                        </View>
                        <View className='footer_wrapper_content'>
                            <View className='footer_wrapper_left' onClick={() => chooeAllFunc()}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon2${chooseAll ? 7 : 8}.webp`}></Image>
                                <View>全选</View>
                            </View>
                            <View
                                className={`footer_btn ${chooseObjList.length > 0 ? 'footer_btn_active' : ''}`}
                                onClick={() => editBtnFunc()}>修改状态 {chooseObjList.length > 0 ? chooseObjList.length : ''}</View>
                        </View>
                        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                    </View>
                }
            </Block>

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
        </View>
    )
})

export default inject('store')(Index)
