/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-08 15:27:47
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-27 10:24:29
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Image, Button, ScrollView, Text, Block, RootPortal, Input, Textarea } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, throttleCustom, throttle, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import TabBar from '@/components/tabBar';
import CustomDate from '@/components/customDate';
import NewUpdateStatus from '@/components/newUpdateStatus';

import { contractsgetRoster, mySupplierList, updateInterviewer, batchUpdateInterviewer, downloadRoster, batchUpdateSupplier, getContractsCoopModels } from '@/util/api'
import './index.scss'

const Index = observer(({ store }) => {
    // 使用useReducer来强制更新组件
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    // 从store中解构出需要的属性
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight, platform },
        userStore: { myPermissions, companyInfo },
        businessStore: { channelListSupplier, setChannelListSupplier, channelListFilterJob, setchannelListFilterJob },
    } = store

    // 定义一些状态变量
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
    ]);
    const [currentTab, setCurrentTab] = useState(0);
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项
    const [chooseList, setChooseList] = useState([]);                    // 选中的列表
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

    const [showSupplierModel, setShowSupplierModel] = useState(false);
    const [showPatternModel, setShowPatternModel] = useState(false);
    const [supplierList, setSupplierList] = useState([]);
    const [isRefresh2, setIsRefresh2] = useState(false);
    const [goonLoad2, setGoonLoad2] = useState(true);
    const [pageNo2, setPageNo2] = useState(1)
    const pageSize2 = 20;
    const [requestState2, setRequestState2] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [supplierValue, setSupplierValue] = useState('');

    const [modelValue, setModelValue] = useState('');
    const [isRefresh3, setIsRefresh3] = useState(false);
    const [goonLoad3, setGoonLoad3] = useState(true);
    const [pageNo3, setPageNo3] = useState(1)
    const [requestState3, setRequestState3] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [modelList, setModelList] = useState([
        // { content: "模式1", selected: false, isEdit: false }, { content: "模式2", selected: false, isEdit: false },
        // { content: "模式3", selected: false, isEdit: false }
    ]);
    const [showCoopsModel, setShowCoopModel] = useState(false);        // 是否显示选择合作模式的弹窗
    const [chooseCoopsContent, setChooseCoopsContent] = useState('');  // 选择的合作模式

    const [chooseObjList, setChooseObjList] = useState([]);              // 选中的列表
    // 页面加载时获取名单列表
    useDidShow(() => {
        getList(1);
    })

    // 监听channelListFilterJob的变化，如果变化则获取合作模式
    useEffect(() => {
        if (channelListFilterJob.length > 0 && channelListFilterJob[0].recruitSerialCode != '') {
            getCoopModels(1);
        }
    }, [channelListFilterJob])

    // 页面加载时获取供应商列表，并在组件卸载时重置channelListFilterJob和channelListSupplier
    useEffect(() => {
        getSupplierList(1);
        return () => {
            setchannelListFilterJob([
                {
                    title: '全部岗位',
                    recruitSerialCode: '',
                    selected: false
                }
            ])
            setChannelListSupplier([
                {
                    channelName: '全部供应商',
                    channelCode: '',
                    selected: false
                }
            ])
        }
    }, [])

    // 监听currentTab、dateObj、channelListFilterJob的变化，如果变化则获取名单列表
    useEffect(() => {
        getList(1);
    }, [currentTab, dateObj, channelListFilterJob])

    // 监听batchOperations的变化，如果变化则获取searchHeight和bottomHeight
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

    // 监听chooseList的变化，如果chooseList为空，则隐藏底部的操作选项
    // useEffect(() => {
    //     console.log("chooseList", chooseList);
    //     if (chooseList.length === 0) {
    //         setShowbottomOptions(false);
    //     }
    // }, [chooseList])

    useEffect(() => {
        console.log("chooseObjList_发生了变化", chooseObjList);
        if (chooseObjList.length === 0) {
            setShowbottomOptions(false);
        }
    }, [chooseObjList])

    // 选择日期的回调函数
    const customDateSelect = (e) => {      // 选择日期的回调
        console.log("自定义选择日期组件 customDateSelect", e);
        setDateObj(e);
    }

    // 根据serialCode获取合作模式
    const getCoopModels = async (_pageNo) => {   // 根据serialCode获取合作模式
        let params = {
            pageNo: _pageNo,
            pageSize: 10,
            contractsSerialCodes: channelListFilterJob.map(item => item.serialCode),
            searchInfo: modelValue,
        }
        setRequestState3(1);
        const { code, data } = await getContractsCoopModels(params);
        console.log("getContractsCoopModels--code, data", code, data);
        setIsRefresh3(false);
        if (code === 200 && data?.responses?.length > 0) {
            let _list = data.responses.map(item => {
                let obj = {
                    content: item,
                    selected: false,
                    isEdit: false
                }
                return obj;
            })
            setModelList(_pageNo === 1 ? _list : [...modelList, ..._list]);
            setGoonLoad3(true);
            setPageNo3(data.pageNo);
            setRequestState3(2);
        } else {
            setGoonLoad3(false);
            setRequestState3(3);
            if (_pageNo === 1) {
                setModelList([]);
                setChooseCoopsContent('');
            }
        }
    }

    // 获取供应商列表
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

    // 获取名单列表
    const getList = throttleCustom(async (_pageNo, type) => {    // 获取名单列表
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let _recruitSerialCodes = channelListFilterJob.map(item => item.recruitSerialCode);
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
            // recruitSerialCode: channelListFilterJob.recruitSerialCode,
            recruitSerialCodes: _recruitSerialCodes,
            channelCodes: _channelCodes,
            // agentSerialCode: onSiteFilterSUPPLIER.channelCode,
            source: '',
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate,
            endDate: dateObj.endDate,
        }
        console.log("params", params);
        const { code, data } = await contractsgetRoster(params);
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
    }, 1000);

    // 滑动到底部时加载下一页的数据
    const handleScrollToLower = debounce((type) => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (type == 1 && goonLoad) {
            getList(pageNo + 1);
        } else if (type == 2 && goonLoad2) {
            getSupplierList(pageNo2 + 1);
        } else if (type == 3 && goonLoad3) {
            getCoopModels(pageNo3 + 1)
        }
    }, 500);

    // 滑动到顶部时触发下拉刷新
    const handleScrollToUpper = debounce((type) => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        if (type == 1) {
            setIsRefresh(true);
            getList(1);
        } else if (type == 2) {
            setIsRefresh2(true);
            getSupplierList(1);
        } else if (type == 3) {
            setIsRefresh3(true);
            getCoopModels(1);
        }
    }, 200);

    // 计算高度
    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - ${batchOperations ? bottomHeight : tabbarHeight}px)`;
    }

    // 切换分类tab
    const swtitchCurrentTab = (item) => {    // 切换分类tab
        if (item === currentTab) return;
        setCurrentTab(item);
        setBatchOperations(false);
        setChooseList([]);
        setChooseObjList([]);
        setChooseAll(false);
        setShowbottomOptions(false);
    }

    // 显示操作选项
    const showOptionFunc = (e, obj, index) => {
        if (batchOperations) return;
        e.stopPropagation();
        setShowEditStatus(true);
        setEditCustom(obj);
    }

    // 拨打电话
    const callUser = (e, obj) => {
        if (batchOperations) return;
        e.stopPropagation();
        Taro.makePhoneCall({
            phoneNumber: obj.phone
        })
    }

    // 全选、反选
    const chooeAllFunc = () => {      // 全选、反选
        if (chooseAll) {
            setChooseList([]);
            setChooseObjList(chooseObjList => {
                let _list = JSON.parse(JSON.stringify(chooseObjList));
                const arr2Ids = new Set(list.map(item => item.uuid));
                const arr3 = _list.filter(item => !arr2Ids.has(item.uuid));
                return arr3
            });
        } else {
            setChooseList(list.map(item => item.uuid));
            setChooseObjList(chooseObjList => {
                let _list = JSON.parse(JSON.stringify(chooseObjList));
                const arr3 = Array.from(
                    [..._list, ...list].reduce((map, obj) => map.set(obj.uuid, obj), new Map()).values()
                );
                return arr3;
            });
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

    // 点击下方的修改状态按钮
    const editBtnFunc = () => {                // 点击下方的修改状态按钮
        if (chooseObjList.length > 0) {
            // setShowbottomOptions(!showbottomOptions);
            setShowEditStatus(true);
            setEditCustom({});
        }
    }

    // 选择名单
    const chooseItemFunc = (obj, index) => {
        if (batchOperations) {
            // setList(list => {
            //     let _list = list.map((item, i) => {
            //         if (i === index) {
            //             item.isChoosed = !item.isChoosed
            //         }
            //         return item
            //     })
            //     setChooseList(_list.filter(item => item.isChoosed).map(item => item.uuid))
            //     return _list
            // })
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
            Taro.navigateTo({
                url: `/pages/talentsPackage/clientDetail/index?uid=${obj.uuid}&myClientCount=${totalCount}&index=${index * 1 + 1}&type=1`
            })
        }
    }

    // 点击完成按钮
    const doneBtn = () => {    // 点击完成按钮
        setShowbottomOptions(false);
        setBatchOperations(false);
        setChooseList([]);
        setChooseObjList([]);
        setChooseAll(false);
        setList(list=>{
            let _list = list.map(item=>{
                item.isChoosed = false;
                return item;
            })
            return _list;
        })
    }

    // 单个修改状态
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
                getList(1, 1);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    // 批量修改状态
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
                getList(1, 1);
                setChooseList([]);
                setChooseObjList([]);
                setChooseAll(false);
                setShowbottomOptions(false);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    // 修改状态
    const newEditStatusFunc = (status, failReason, date) => {
        console.log("newEditStatusFunc", status, failReason, date);
        if (batchOperations) {     // 批量修改
            batchChangeState(status, failReason, date);
        } else {                   // 单个修改
            changeItemState(status, failReason, date);
        }
    }

    // 导出全部名单
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
                    if (platform === 'pc') {
                        Taro.setClipboardData({
                            data: _downLoadSrc,
                            success: () => {
                                Taro.showToast({
                                    title: '下载地址已复制到粘贴板,可下载查看',
                                    icon: 'none',
                                    duration: 3000
                                })
                                setShowExportModel(false);
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

    const setPatternFunc = () => {
        console.log("电击 合作模式 按钮");
        // if (list.length === 0) {
        //     console.log(111)
        //     return Taro.showToast({ title: '暂无数据', icon: 'none' });
        // }
        if (chooseObjList.length === 0) {
            console.log(222)
            return Taro.showToast({ title: '请先选择用户', icon: 'none' });
        }

        // 先判断是否选择了岗位,必须先选择了岗位
        // 判断是否有合作模式,如果有合作模式,则弹窗
        // setShowCoopModel(true);
        // return
        console.log('channelListFilterJob', channelListFilterJob)
        if (channelListFilterJob.length === 1 && channelListFilterJob[0].recruitSerialCode === "") {
            console.log(333)
            return Taro.showToast({ title: '请先选择岗位', icon: 'none' });
        } else {
            console.log(444)
            setShowCoopModel(true);
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
            uuids: chooseObjList.map(item => item.uuid),
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
            getList(1, 1);
            setChooseObjList([]);
            setShowbottomOptions(false);
            setTimeout(() => {
                setShowSupplierModel(false);
            }, 500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' })
        }
    }

    const getChoosePattern = async () => {   // 批量设置合作模式
        console.log("选择的模式", chooseCoopsContent);
        if(modelList.length === 0) {
            setChooseCoopsContent('');
            return Taro.showToast({ title: '暂无数据', icon: 'none' });
        }
        if (!chooseCoopsContent) {
            return Taro.showToast({ title: '请选择合作模式', icon: 'none' });
        }
        let _list = chooseObjList.map(item => {
            let obj = {
                uuid: item.uuid,
                cooperationModel: chooseCoopsContent
            }
            return obj
        })
        Taro.showLoading({ title: '提交中...' });
        batchUpdateInterviewer(_list).then(res => {
            Taro.hideLoading();
            if (res.code === 200) {
                Taro.showToast({ title: '更新成功', icon: 'none' })
                getList(1, 1);
                setChooseList([]);
                setChooseAll(false);
                setShowCoopModel(false);
                setChooseObjList([]);
                setShowbottomOptions(false);
                setChooseCoopsContent('');
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' })
            }
        })
    }

    const searchFunc = throttle((type) => {
        if (type === 1) {
            getList(1);
            setgoonLoad(true);
        } else if (type === 2) {
            setGoonLoad2(true);
            getSupplierList(1);
        } else if (type === 3) {
            setGoonLoad3(true);
            getCoopModels(1);
        }
    }, 300);

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

    return (
        <View className='container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <View className='search_content' onClick={() => {
                        // Taro.navigateTo({ url: `/pages/projectPackage/siteSearch/index` })
                    }}>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                        {/* <View className='search_input_view'>搜索姓名、手机号、身份证号</View> */}
                        <Input className='search_input'
                            placeholder='搜索姓名、手机号、身份证号'
                            confirmType='search'
                            placeholderStyle='color: #777777;'
                            onInput={(e) => { setSearchValue(e.detail.value) }}
                            onConfirm={() => searchFunc(1)}
                            value={searchValue}></Input>
                    </View>
                </View>
            </View>


            <View className='search_wrapper'>
                <View className='filter_wrapper'>
                    <View className='filter_wrap_item' onClick={() => { Taro.navigateTo({ url: `/pages/talentsPackage/multipleFilterJob/index?type=6&title=选择岗位` }) }}>
                        <View>{channelListFilterJob.length === 1 ? channelListFilterJob[0].title : channelListFilterJob[0].title + '等' + channelListFilterJob.length + '个岗位'}</View>
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
                        {
                            myPermissions.includes('12') &&
                            <View className='search_total_right_item' onClick={() => Taro.navigateTo({ url: `/pages/channelPackage/newInterviewWorker/index` })}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
                                <View>新增</View>
                            </View>
                        }

                        {
                            myPermissions.includes('20') &&
                            <View className='search_total_right_item' onClick={() => exportAllFunc()}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon49.webp`}></Image>
                                <View>导出</View>
                            </View>
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
                onScrollToLower={() => handleScrollToLower(1)}
                onRefresherRefresh={() => handleScrollToUpper(1)}
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
                                            <View className='roster_item_detail_content'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : ''}{((item.sex === 0 || item.sex === 1) && item.ethnicity) ? '·' : ''}{item.ethnicity ? item.ethnicity : ''}{item.ethnicity && item.idCardNo ? '·' : ''}{item.idCardNo ? item.idCardNo : ''}</View>
                                        </View>
                                        <View className='roster_item_job'>{item.recruitTitle}</View>
                                        {
                                            item.sourceDesc && <View className='roster_item_job'>来源：{item.sourceDesc}</View>
                                        }
                                        {
                                            item.cooperationModel && <View className='roster_item_coops'>合作模式：{item.cooperationModel}</View>
                                        }
                                        <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                                        {
                                            item.remark && <View className='roster_item_time'>备注：{item.remark}</View>
                                        }
                                        {
                                            item.company && <View className='roster_item_time'>公司简称：{item.company}</View>
                                        }
                                    </View>
                                    <View className='roster_item_wrap_right'>
                                        <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }} onClick={(e) => {
                                            if (!myPermissions.includes('14')) {
                                                return
                                            }
                                            showOptionFunc(e, item, index)
                                        }}>
                                            <View>{getStatus(item.seekState, 1)}</View>
                                            {
                                                myPermissions.includes('14') &&
                                                <AtIcon value='chevron-down' size='14' color={getColor(item.seekState)}></AtIcon>
                                            }
                                        </View>
                                    </View>

                                    {/* <View className='item_title_copy' onClick={(e) => copyFunc(e, item)}>一键复制</View> */}
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

            {/* 新的修改状态弹窗组件 */}
            <Block>
                <NewUpdateStatus showPicker={showEditStatus} currentStatus={editCustom?.seekState} onClose={() => { setShowEditStatus(false) }} onChange={newEditStatusFunc}></NewUpdateStatus>
            </Block>

            {/* 底部操作栏 */}
            <Block>
                {
                    batchOperations &&
                    <View className='footer_wrapper_c'>
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
                                                        <AtIcon value='close' size='10' color='#1678FF'></AtIcon>
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

                            <View className='footer_wrapper_pattern' onClick={() => {
                                if (chooseObjList.length === 0) {
                                    return Taro.showToast({ title: '请先选择用户', icon: 'none' });
                                }
                                setShowSupplierModel(true);
                            }}>归属供应商</View>

                            <View className='footer_wrapper_pattern' onClick={setPatternFunc}>合作模式</View>

                            <View
                                className={`footer_btn ${chooseObjList.length > 0 ? 'footer_btn_active' : ''}`}
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

            {/* 设置供应商 */}
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
                                        onConfirm={() => searchFunc(2)}
                                        value={supplierValue}></Input>
                                </View>
                                <ScrollView scrollY
                                    className='sup_scrollWrapper'
                                    scrollWithAnimation
                                    showScrollbar={false}
                                    enablePassive
                                    refresherEnabled
                                    refresherTriggered={isRefresh2}
                                    onScrollToLower={() => handleScrollToLower(2)}
                                    onRefresherRefresh={() => handleScrollToUpper(2)}
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
                                        <Taro.LoadMore goonLoad={goonLoad2}></Taro.LoadMore>
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

            {/* 选择合作模式 */}
            <Block>
                {
                    showCoopsModel &&
                    <AtFloatLayout catchMove className='supplier_init_layout' isOpened={showCoopsModel} onClose={() => { setShowCoopModel(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View>选择合作模式</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowCoopModel(false) }}></AtIcon>
                                </View>
                                <View className='search_content'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                                    <Input className='search_input'
                                        placeholder='搜索合作模式'
                                        confirmType='search'
                                        placeholderStyle='color: #777777;'
                                        onInput={(e) => { setModelValue(e.detail.value) }}
                                        onConfirm={() => searchFunc(3)}
                                        value={modelValue}></Input>
                                </View>
                                <ScrollView scrollY
                                    className='sup_scrollWrapper sup_scrollWrapper2'
                                    scrollWithAnimation
                                    showScrollbar={false}
                                    enablePassive
                                    refresherEnabled
                                    refresherTriggered={isRefresh3}
                                    onScrollToLower={() => handleScrollToLower(3)}
                                    onRefresherRefresh={() => handleScrollToUpper(3)}
                                    lowerThreshold={300}>
                                    {
                                        modelList.length > 0 && modelList.map((item, index) => {
                                            return (
                                                // <View onClick={() => chooseSupplierFunc(item, index)} className={`sup_item ${item.selected ? 'sup_item_active' : ''}`} key={index}>
                                                //     {item}
                                                // </View>
                                                <View onClick={() => {
                                                    console.log("点击了模式", item);
                                                    if (!item.isEdit) {
                                                        setChooseCoopsContent(item.content);
                                                    }
                                                }
                                                } className={`filter_pattern_item ${chooseCoopsContent == item.content ? 'filter_pattern_item_active' : ''}`} key={index} >
                                                    <View className='filter_coops_title'>
                                                        <View>模式{index + 1}:</View>
                                                        <View className='filter_coops_edit' onClick={(e) => {
                                                            e.stopPropagation();
                                                            setModelList(modelList.map((item2, index2) => {
                                                                if (index === index2) {
                                                                    item2.isEdit = !item2.isEdit
                                                                } else {
                                                                    item2.isEdit = false;
                                                                }
                                                                return item2
                                                            }))
                                                        }}>{item.isEdit ? '完成' : '编辑'}</View>
                                                    </View>

                                                    {
                                                        item.isEdit &&
                                                        <Textarea className='filter_item_input'
                                                            adjustPosition={true} // 键盘弹起时，是否自动上推页面
                                                            show-confirm-bar
                                                            autoHeight
                                                            focus={true}
                                                            maxlength={200}
                                                            confirmType='return'
                                                            value={item.content}
                                                            onInput={(e) => {
                                                                // setChooseCoopsContent(e.detail.value)
                                                                setModelList(modelList.map((item2, index2) => {
                                                                    if (index === index2) {
                                                                        item2.content = e.detail.value
                                                                    }
                                                                    return item2
                                                                }))
                                                            }}
                                                            placeholder='请输入模式内容'></Textarea> ||
                                                        <View className='filter_item_content'>{item.content}</View>
                                                    }
                                                </View>
                                            )
                                        })
                                    }
                                    {
                                        modelList.length >= 7 &&
                                        <Taro.LoadMore goonLoad={goonLoad3}></Taro.LoadMore>
                                    }
                                    {
                                        modelList.length === 0 && requestState3 === 3 &&
                                        <Taro.NoData></Taro.NoData>
                                    }
                                </ScrollView>

                                <View className='post_btn' onClick={getChoosePattern}>确定</View>

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
