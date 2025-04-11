/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-10 19:59:09
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'

import UpdateStatus from '@/components/updateStatus';
import CustomDate from '@/components/customDate';
import SourcePicker from '@/components/sourcePcker';

import { contractsgetRoster, updateInterviewer, batchUpdateInterviewer, downloadRoster } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        userStore: { myPermissions, supplierCompanyInfo },
        businessStore: { rosterFilterSupplier },
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
        { state: '', name: "全部" }, { state: 'SCHEDULED_INTERVIEW', name: "已约面" },
        { state: 'ARRIVE_INTERVIEW', name: "已到面" }, { state: 'INTERVIEW_PASSED', name: "面试通过" },
        { state: 'INTERVIEW_FAILED', name: "面试失败" }, { state: 'EMPLOYED', name: "已入职" },
        { state: 'RESIGN', name: "已离职" }]);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);           // 当前选中的tab
    const [currentCliskstatus, setCurrentCliskstatus] = useState('');
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

    useEffect(() => {
        const { title, recruitSerialCode } = route.params;
        setTitle(title);
    }, [])

    useDidShow(() => {
        getList(1);
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
            agentSerialCode: rosterFilterSupplier.userSerialCode,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate,
            endDate: dateObj.endDate,
            channel: 1,
            supplierSerialCode: supplierCompanyInfo.serialCode
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
        setEditCustom(obj);
        setList(list => {
            let _list = list.map((item, i) => {
                item.showOptions = i === index ? !item.showOptions : false
                return item
            })
            return _list
        })
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
            setShowbottomOptions(!showbottomOptions);
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
        console.log("goAddWorker", recruitSerialCode, title);
        Taro.navigateTo({ url: `/pages/newPackage/newProjectWorker/index?recruitSerialCode=${recruitSerialCode}&title=${title}` })
    }

    const changeStatus = (e, reason) => {
        console.log("changeStatus", e, reason);
        setCurrentCliskstatus(e);
        let params = {
            uuid: editCustom.uuid,
            seekState: e
        }
        if (reason) {
            if (e === 'INTERVIEW_FAILED') {
                params.failReason = reason;
            } else if (e === 'RESIGN') {
                params.resignReason = reason;
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

    const changeStatusBatch = (e, reason) => {    // 批量修改状态
        console.log("changeStatusBatch", e, reason);
        if (chooseList.length === 0) {
            return Taro.showToast({ title: '请先选择用户', icon: 'none' });
        }
        let _list = chooseList.map(item => {
            let obj = {
                uuid: item,
                seekState: e
            }
            if (reason) {
                if (e === 'INTERVIEW_FAILED') {
                    obj.failReason = reason;
                } else if (e === 'RESIGN') {
                    obj.resignReason = reason;
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
        let params = { ...customRequestParams, supplierSerialCode: supplierCompanyInfo.serialCode };
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

    Taro.useShareAppMessage(res => {
        let path = `/pages/projectPackage/viewExport/index`
        let _shareTitle = `[名单]${title}`;
        if (res.from === 'button') {
            console.log("页面中的分享---customRequestParams", customRequestParams);
            const { recruitSerialCode } = route.params;
            let _par = {
                // ...customRequestParams,
                recruitSerialCode: recruitSerialCode,
                agentSerialCode: rosterFilterSupplier.userSerialCode,
                title: title,
                sourceName: rosterFilterSupplier.name,
            }
            const params = new URLSearchParams(_par);
            path = `${path}?${params.toString()}`
        } else {
            path = `/pages/index/index`
        }
        return {
            title: _shareTitle,
            path,
        }
    })

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
                <View className='search_content_wrap'>
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
                    <View className='filter_wrap_item' onClick={() => setShowFilterDate(true)}>
                        <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                </View>

                {/* <View className='filter_wrapper'>
                    <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/projectPackage/chooseSupplier/index?type=1` }) }}>
                        <View>{rosterFilterSupplier.name}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>

                    <View className='filter_wrap_item' onClick={() => setShowFilterDate(true)}>
                        <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                </View> */}

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
                        <View className='search_total_right_item' onClick={goAddWorker}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
                            <View>新增</View>
                        </View>
                        <View className='search_total_right_item' onClick={() => exportAllFunc()}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon49.webp`}></Image>
                            <View>导出</View>
                        </View>
                        {/* {
                            batchOperations ?
                                <View className='search_total_right_t' onClick={() => doneBtn()}>完成</View> :
                                <View className='search_total_right' onClick={() => setBatchOperations(true)}>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon33.webp`}></Image>
                                    <View>多选</View>
                                </View>
                        } */}
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
                                        <View className='item_title_source'>{item.sourceDesc}</View>
                                    </View>
                                </View>
                                <View className='roster_item_detail'>
                                    <View className='roster_item_detail_content'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}{((item.sex === 0 || item.sex === 1) && item.idCardNo) ? '·' : ''}{item.idCardNo ? item.idCardNo : ''}</View>
                                    <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }} onClick={(e) => {
                                        // if (!myPermissions.includes('6')) {
                                        //     return
                                        // }
                                        // showOptionFunc(e, item, index);
                                    }}>
                                        <View>{getStatus(item.seekState)}</View>
                                        {
                                            // myPermissions.includes('6') &&
                                            // <AtIcon value='chevron-down' size='14' color={getColor(item.seekState)}></AtIcon>
                                        }
                                    </View>
                                    {
                                        item.showOptions &&
                                        <View className='item_status_options'>
                                            <UpdateStatus
                                                type={2}
                                                showPicker={item.showOptions}
                                                onClose={() => setShowbottomOptions(false)}
                                                currentStatus={item.seekState}
                                                onChange={changeStatus}>
                                            </UpdateStatus>
                                        </View>
                                    }
                                </View>
                                <View className='roster_item_time'>面试时间：{item.interviewDate}</View>

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
                            {
                                rosterFilterSupplier.userSerialCode ? <Button open-type='share' className='export_model_btn'>导出为小程序页面</Button> :
                                    <Button className='export_model_btn' onClick={() => {
                                        Taro.showToast({
                                            title: '请选择具体的供应商',
                                            icon: 'none',
                                        })
                                        // setShowExportModel(false);
                                    }}>导出为小程序页面</Button>
                            }

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
                            {
                                showbottomOptions &&
                                <View className='footer_wrapper_top_position'>
                                    <UpdateStatus
                                        type={2}
                                        showPicker={showbottomOptions}
                                        onClose={() => setShowbottomOptions(false)}
                                        // currentStatus={currentCliskstatus}
                                        onChange={changeStatusBatch}>
                                    </UpdateStatus>
                                </View>
                            }
                        </View>
                        <View className='footer_wrapper_content'>
                            <View className='footer_wrapper_left' onClick={() => chooeAllFunc()}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon2${chooseAll ? 7 : 8}.webp`}></Image>
                                <View>全选</View>
                            </View>
                            <View
                                className={`footer_btn ${chooseList.length > 0 ? 'footer_btn_active' : ''}`}
                                onClick={() => editBtnFunc()}>修改状态 {chooseList.length > 0 ? chooseList.length : ''}</View>
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

        </View>
    )
})

export default inject('store')(Index)
