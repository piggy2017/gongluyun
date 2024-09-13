/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-13 14:44:04
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

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, authentication }
    } = store
    const [type, setType] = useState('客户池');

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(175);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [title, setTitle] = useState('龙泉驿区招物流分拣全职月结');

    const [list, setList] = useState([
        { userName: "高小光", status: 1, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 2, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 3, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 4, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 5, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", status: 6, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    ])

    const [sourceList, setSourceList] = useState(['全部来源', '抖音直播', '小红书', 'BOSS直聘', '微信私域', '58同城', 'BOSS直聘', '微信私域', '58同城']);
    const [sourceIndex, setSourceIndex] = useState(0);
    const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

    const [tabList, setTabList] = useState(['全部', '已约面', '已到面', '面试通过', '面试失败', '已入职', '已离职']);
    const [currentTab, setCurrentTab] = useState('全部');

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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px)`;
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
                return '#999999;';
            case 2:
                return '#F00000';
            case 3:
                return '#FF6B17';
            case 4:
                return '#04B400';
            case 5:
                return '#666666';
            case 6:
                return '#FF6B00';
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

                <View className='search_total'>共计 <Text>172</Text> 人</View>

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
                            <View className='roster_item' key={index}>
                                <View className='roster_item_title'>
                                    <View className='item_title_index'>{index + 1}</View>
                                    <View className='item_title_left'>
                                        <View className='item_title_name'>{item.userName}</View>
                                        <View>{item.detail}</View>
                                    </View>
                                    <View style={{ color: getColor(item.status) }} className='item_title_right'>{getStatus(item.status)}</View>
                                </View>

                                <View className='roster_item_phone'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                    <View>{item.phone}</View>
                                </View>
                                <View className='roster_item_source'><Text>来源：</Text>{item.source}</View>
                                <View className='roster_item_hr'></View>
                                <View className='roster_item_time'>面试时间：{item.interviewTime}</View>
                            </View>
                        )
                    })
                }
            </ScrollView>

            <View className='btns'>
                <View className='btn_item'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon30.webp`}></Image>
                    <View>导出</View>
                </View>
                <View className='btn_item'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon31.webp`}></Image>
                    <View>新增</View>
                </View>
            </View>


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
