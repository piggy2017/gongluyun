/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-01 17:19:32
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'

import UpdateStatus from '@/components/updateStatus';
import CustomDate from '@/components/customDate';
import SourcePicker from '@/components/sourcePcker';

import { contractsgetRoster } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, companyVerified }
    } = store

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

    const [list, setList] = useState([
        { id: 1, userName: "高小光", status: 1, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 2, userName: "高小光", status: 2, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 3, userName: "高小光", status: 3, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 4, userName: "高小光", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 5, userName: "高小光", status: 5, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 6, userName: "高小光", status: 6, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    ])

    const [tabList, setTabList] = useState([
        { state: '', name: "全部" }, { state: 'SCHEDULED_INTERVIEW', name: "已约面" },
        { state: 'ARRIVE_INTERVIEW', name: "已到面" },{ state: 'INTERVIEW_PASSED', name: "面试通过" },
        { state: 'INTERVIEW_FAILED', name: "面试失败" },{ state: 'EMPLOYED', name: "已入职" },
        { state: 'RESIGN', name: "已离职" }]);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);           // 当前选中的tab
    const [currentCliskstatus, setCurrentCliskstatus] = useState('');
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项
    const [chooseList, setChooseList] = useState([]);                    // 选中的列表
    const [showExportModel, setShowExportModel] = useState(false);       // 是否显示导出弹窗

    const [showSourcePicker, setShowSourcePicker] = useState(false);              //  是否显示切换状态的弹窗
    const [showFilterDate, setShowFilterDate] = useState(false);                  //  客户池是否显示切换日期的弹窗
    const [sourceObj, setSourceObj] = useState({    // 筛选来源
        source: "", name: '全部来源'
    })
    const [dateObj, setDateObj] = useState({
        dateRange: "TODAY",
        endDate: "",
        filterTime: "今日",
        startDate: ""
    });

    useEffect(() => {
        const { title, recruitSerialCode } = route.params;
        setTitle(title);
        getList(1);
    }, [])

    useEffect(()=>{

    },[currentTabIndex, sourceObj, dateObj])

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

    const getList = async (_pageNo) => {    // 获取花名册列表
        const { recruitSerialCode } = route.params;
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            state: tabList[currentTabIndex].state,
            searchInfo: searchValue,
            recruitSerialCode,
            source: sourceObj.source,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate,
            endDate: dateObj.endDate
        }
        const { code, data } = await contractsgetRoster(params);
        console.log("获取花名册列表", code, data);
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

    const getStatus = (status) => {
        switch (status) {
            case 1:
                return '已约面';
            case 2:
                return '已到面';
            case 3:
                return '面试通过';
            case 4:
                return '面试失败';
            case 5:
                return '已入职';
            case 6:
                return '已离职';
        }
    }

    const getColor = (status) => {
        switch (status) {
            case 1:
                return '#08B5FF';
            case 2:
                return '#1678FF';
            case 3:
                return '#FF7C32';
            case 4:
                return '#F00000';
            case 5:
                return '#04B400';
            case 6:
                return '#666666';
        }
    }

    const swtitchCurrentTab = (item) => {    // 切换分类tab
        if (item === currentTab) return;
        setCurrentTab(item);
        setBatchOperations(false);
        setChooseList([]);
        setChooseAll(false);
        setShowbottomOptions(false);
        setCurrentCliskstatus('');
    }

    const showOptionFunc = (e, obj, index) => {
        if (batchOperations) return;
        e.stopPropagation();
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
            setChooseList(list.map(item => item.id))
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

    const changeStatus = (e) => {
        console.log("changeStatus", e);
        setCurrentCliskstatus(e);
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
                setChooseList(_list.filter(item => item.isChoosed).map(item => item.id))
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
                        }}
                        value={searchValue}></Input>
                </View>
                <View className='filter_wrapper'>
                    <View className='filter_wrap_item' onClick={() => setShowSourcePicker(true)}>
                        <View>{sourceObj.name}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
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
                    <View className='search_total_left'>共计 <Text>172</Text> 人</View>
                    <View className='search_total_right_wrap'>
                        <View className='search_total_right_item' onClick={() => Taro.navigateTo({ url: '/pages/newPackage/newWorker/index' })}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
                            <View>新增</View>
                        </View>
                        <View className='search_total_right_item' onClick={() => setShowExportModel(true)}>
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
                                <View className='roster_item_title'>
                                    <View className='item_title_index'>{index + 1}</View>
                                    <View className='item_title_left'>
                                        <View className='item_title_name'>{item.userName}</View>
                                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                        <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                                    </View>
                                </View>
                                <View className='roster_item_detail'>
                                    <View className='roster_item_detail_content'>{item.detail}</View>
                                    <View className='roster_item_detail_status' style={{ color: getColor(item.status) }} onClick={(e) => showOptionFunc(e, item, index)}>
                                        <View>{getStatus(item.status)}</View>
                                        <AtIcon value='chevron-down' size='14' color={getColor(item.status)}></AtIcon>
                                    </View>
                                    {
                                        item.showOptions &&
                                        <View className='item_status_options'>
                                            <UpdateStatus
                                                type={2}
                                                showPicker={item.showOptions}
                                                onClose={() => setShowbottomOptions(false)}
                                                currentStatus={currentCliskstatus}
                                                onChange={changeStatus}>
                                            </UpdateStatus>
                                        </View>
                                    }
                                </View>
                                <View className='roster_item_time'>面试时间：{item.interviewTime}</View>

                                {
                                    batchOperations && <Image className='roster_item_choose' src={`${Taro.$cdnUrl}/index/index_icon2${item.isChoosed ? 7 : 8}.webp`}></Image>
                                }
                            </View>
                        )
                    })
                }
            </ScrollView>

            <Block>
                {
                    showExportModel &&
                    <View className='export_model'>
                        <View className='export_model_content'>
                            <Image onClick={() => setShowExportModel(false)} className='export_model_close' src={`${Taro.$cdnUrl}/index/index_icon54.webp`}></Image>
                            <View className='export_model_title'>导出全部名单</View>
                            <Image className='export_model_img' src={`${Taro.$cdnUrl}/index/index_icon53.webp`}></Image>
                            <View className='export_model_btn'>导出为小程序页面</View>
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
                                        currentStatus={currentCliskstatus}
                                        onChange={changeStatus}>
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

            {/* 线索来源 */}
            <Block>
                {/* <AtFloatLayout catchMove className='source_init_layout' isOpened={showSourceModel} onClose={() => setShowSourceModel(false)}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>线索来源</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => setShowSourceModel(false)}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    sourceList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${index === sourceIndex ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => setSourceIndex(index)}
                                            >{item}</View>
                                        )
                                    })
                                }
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout> */}
            </Block>

            {/* 客户池筛选日期组件 */}
            <Block>
                <CustomDate showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
            </Block>

            {/* 客户池筛选线索来源 */}
            <Block>
                <SourcePicker showPicker={showSourcePicker} onClose={() => { setShowSourcePicker(false) }} onChange={sourcePickerSelect}></SourcePicker>
            </Block>

        </View>
    )
})

export default inject('store')(Index)
