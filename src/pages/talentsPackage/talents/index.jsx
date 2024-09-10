/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-10 17:31:41
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import SexPicker from '@/components/sexPicker';
import AgePicker from '@/components/agePicker';

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, authentication }
    } = store
    const [type, setType] = useState('客户池');

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(52);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);

    const [list, setList] = useState([
        { id: 1, userName: "高小光", detail: "45岁·男·汉族", phone: "177****0923", labels: ['有电工证', '接受倒班', '15年工作经验', '高中文凭'], jobIntention: "普工、快递、小工、物流分拣、保洁、家政、修车工" },
        { id: 2, userName: "张三", detail: "45岁·男·汉族", phone: "177****0923", labels: ['有电工证', '接受倒班', '15年工作经验', '高中文凭'], jobIntention: "普工、物流分拣、保洁、家政、修车工、物流分拣、保洁、家政、修车工" },
        { id: 3, userName: "里斯", detail: "45岁·男·汉族", phone: "177****0923", labels: ['有电工证', '接受倒班', '能上夜班', '15年工作经验', '高中文凭'], jobIntention: "普工、物流分拣、保洁、家政、修车工" },
        { id: 4, userName: "高小光", detail: "45岁·男·汉族", phone: "177****0923", labels: ['有电工证', '接受倒班', '15年工作经验', '高中文凭'], jobIntention: "普工、物流分拣、保洁嘿嘿、家啊政、修车工" },
    ])

    const [sourceList, setSourceList] = useState(['全部来源', '抖音直播', '小红书', 'BOSS直聘', '微信私域', '58同城', 'BOSS直聘', '微信私域', '58同城']);
    const [sourceIndex, setSourceIndex] = useState(0);
    const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

    const [showSexPicker, setShowSexPicker] = useState(false);
    const [sexText, setSexText] = useState("不限性别");

    const [showAgePicker, setShowAgePicker] = useState(false);
    const [ageText, setAgeText] = useState("不限年龄");

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

    const sexPickerSelect = (e) => {
        console.log("sexPickerSelect", e);
        setSexText(e === "" ? "不限性别" : (e === 0 ? "男" : "女"));
    }

    const agePickerSelect = (e) => {
        console.log("agePickerSelect", e);
        setAgeText(e[0] + "-" + e[1]+'岁');
      }

    return (
        <View className='container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <Image className='back_icon' src={`${Taro.$cdnBackIcon}`}></Image>
                    <View className='search_wrap'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                        <Input className='search_input'
                            placeholder='搜索姓名或手机号'
                            confirmType='search'
                            placeholderStyle='color: #777777;'
                            onInput={(e) => { setSearchValue(e.detail.value) }}
                            onConfirm={(e) => {
                            }}
                            value={searchValue}></Input>
                    </View>
                    <Image className='add_icon' src={`${Taro.$cdnUrl}/index/index_icon3.webp`}></Image>
                </View>
            </View>

            <View className='search_wrapper'>
                <View className='filter_wrapper'>
                    <View className='filter_wrap_item' onClick={() => setShowSexPicker(true)}>
                        <View>{sexText}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                    <View className='filter_wrap_item' onClick={() => setShowAgePicker(true)}>
                        <View>{ageText}</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                    <View className='filter_wrap_item' onClick={()=>{
                        Taro.navigateTo({
                            url: "/pages/selectorPackage/jobChoose/index"
                        })
                    }}>
                        <View>全部工种</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
                </View>
            </View>

            {
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
                                <View className='talents_item' key={index}>
                                    <View className='talents_item_title'>
                                        <View className='talents_item_title_left'>
                                            <View className='talents_item_title_name'>{item.userName}</View>
                                            <View className='talents_item_title_detail'>{item.detail}</View>
                                        </View>
                                        <View className='talents_item_title_right'>
                                            <Image src={`${Taro.$cdnUrl}/mine/tel_icon.webp`}></Image>
                                            <View>{item.phone}</View>
                                        </View>
                                    </View>

                                    {
                                        item.labels.length > 0 &&
                                        <View className='talents_item_labels'>
                                            {
                                                item.labels.map((label, idx) => {
                                                    return (
                                                        <View key={idx} className='talents_item_label'>
                                                            {label}
                                                        </View>
                                                    )
                                                })
                                            }
                                        </View>
                                    }
                                    <View className='talents_item_jobIntention row-show-1'>求职意向：{item.jobIntention}</View>
                                    <View className='talents_item_line'></View>

                                    <View className='talents_item_bottom'>
                                        <View>求职历史</View>
                                        <View>安排面试</View>
                                    </View>

                                </View>
                            )
                        })
                    }

                    {
                        list.length >= 5 &&
                        <View className='loading_text'>
                            {
                                goonLoad ?
                                    <>
                                        <AtIcon value='loading-3' size='16' color='#8E8E93'></AtIcon>
                                        加载中
                                    </> :
                                    "数据已经到底了"
                            }
                        </View>
                    }
                    {
                        list.length === 0 &&
                        <View className='no_data'>
                            <View><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
                            <View>暂无相关数据~</View>
                        </View>
                    }
                </ScrollView>
            }

            <Block>
                <SexPicker showPicker={showSexPicker} onClose={() => { setShowSexPicker(false) }} onChange={sexPickerSelect}></SexPicker>
            </Block>

            <Block>
                <AgePicker showPicker={showAgePicker} onClose={() => { setShowAgePicker(false) }} onChange={agePickerSelect}></AgePicker>
            </Block>

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
