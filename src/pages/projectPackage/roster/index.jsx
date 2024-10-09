/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-08 17:00:54
 * @Description: 
 */
/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 10:53:33
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Button, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import ClueItem from '@/components/items/clueItem'
import UpdateStatus from '@/components/updateStatus';

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, authentication }
    } = store
    const [type, setType] = useState('客户池');

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(175);
    const [bottomHeight, setBottomHeight] = useState(90);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [title, setTitle] = useState('龙泉驿区招物流分拣全职月结');

    const [list, setList] = useState([
        { userName: "高小光", status: 1, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 2, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 3, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 5, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 6, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    ])

    const [sourceList, setSourceList] = useState(['全部来源', '抖音直播', '小红书', 'BOSS直聘', '微信私域', '58同城', 'BOSS直聘', '微信私域', '58同城']);
    const [sourceIndex, setSourceIndex] = useState(0);
    const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

    const [tabList, setTabList] = useState(['全部', '已约面', '已到面', '面试通过', '面试失败', '已入职', '已离职']);
    const [currentTab, setCurrentTab] = useState('全部');
    const [currentCliskstatus, setCurrentCliskstatus] = useState('');
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示底部的操作选项

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
    }, [isLogin, authentication])

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - ${batchOperations ? bottomHeight : 0}px)`;
    }

    const getBottom = () => {
        return `${tabbarHeight + 30}px`;
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

    const showOptionFunc = (obj, index) => {
        setList(list => {
            let _list = list.map((item, i) => {
                item.showOptions = i === index ? !item.showOptions : false
                return item
            })
            return _list
        })
    }

    const chooeAllFunc = () => {
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
                    <View className='filter_wrap_item' onClick={() => setShowSourceModel(true)}>
                        <View>{sourceList[sourceIndex]}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                    {/* <View className='filter_wrap_item'>
                        <View>全部岗位</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View> */}
                    <View className='filter_wrap_item'>
                        <View>今日</View>
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
                                <View onClick={() => setCurrentTab(item)} className={`tab_item ${currentTab === item ? 'tab_item_active' : ''} `} key={index}>{item}</View>
                            )
                        })
                    }
                </ScrollView>

                <View className='search_total'>
                    <View className='search_total_left'>共计 <Text>172</Text> 人</View>
                    <View className='search_total_right_wrap'>
                        <View className='search_total_right_item'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon48.webp`}></Image>
                            <View>新增</View>
                        </View>
                        <View className='search_total_right_item'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon49.webp`}></Image>
                            <View>导出</View>
                        </View>
                        {
                            batchOperations ?
                                <View className='search_total_right_t' onClick={() => setBatchOperations(false)}>完成</View> :
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
                            <View className='roster_item' key={index} style={`padding:${batchOperations ? '30rpx 28rpx 30rpx 126rpx' : '30rpx 40rpx 30rpx 68rpx'}`}>
                                <View className='roster_item_title'>
                                    <View className='item_title_index'>{index + 1}</View>
                                    <View className='item_title_left'>
                                        <View className='item_title_name'>{item.userName}</View>
                                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                        <View className='item_title_phone'>{item.phone}</View>
                                    </View>
                                </View>
                                <View className='roster_item_detail'>
                                    <View className='roster_item_detail_content'>{item.detail}</View>
                                    <View className='roster_item_detail_status' style={{ color: getColor(item.status) }} onClick={() => showOptionFunc(item, index)}>
                                        <View>{getStatus(item.status)}</View>
                                        <AtIcon value='chevron-down' size='14' color={getColor(item.status)} onClick={() => setShowSourceModel(false)}></AtIcon>
                                    </View>
                                    {
                                        item.showOptions &&
                                        <View className='item_status_options'>
                                            <UpdateStatus
                                                type={2}
                                                onClose={() => setShowbottomOptions(false)}
                                                showPicker={true}
                                                currentStatus={currentCliskstatus}
                                                // bottomHeight={bottomHeight}
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

            {/* 线索来源 */}
            <AtFloatLayout catchMove className='source_init_layout' isOpened={showSourceModel} onClose={() => setShowSourceModel(false)}>
                <View className='filter_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View>按性别筛选</View>
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
            </AtFloatLayout>
        </View>
    )
})

export default inject('store')(Index)
