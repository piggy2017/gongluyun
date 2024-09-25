/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-25 14:28:02
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
import { View, Image, Input, ScrollView, Text, Block, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';
import Navbar from '@/components/navbar';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import ClueItem from '@/components/items/clueItem'
import UpdateStatus from '@/components/updateStatus';

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
    } = store
    const [type, setType] = useState('客户池');

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(175);
    const [bottomHeight, setBottomHeight] = useState(90);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [title, setTitle] = useState('龙泉驿区招物流分拣全职月结');

    const [list, setList] = useState([
        { userName: "高小光", isChoosed: false, showOptions: false, status: 1, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", isChoosed: false, showOptions: false, status: 2, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", isChoosed: false, showOptions: false, status: 3, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", isChoosed: false, showOptions: false, status: 4, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { userName: "高小光", isChoosed: false, showOptions: false, status: 5, phone: '177 6548 0923', detail: "45岁·男", jobName: "成都龙泉驿京西仓库分拣", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    ])

    const [sourceList, setSourceList] = useState(['全部来源', '抖音直播', '小红书', 'BOSS直聘', '微信私域', '58同城', 'BOSS直聘', '微信私域', '58同城']);
    const [sourceIndex, setSourceIndex] = useState(0);
    const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

    const [tabList, setTabList] = useState(['待到面', '已到面', '面试通过', '已入职', '已离职']);
    const [currentTab, setCurrentTab] = useState('待到面');

    const [currentCliskstatus, setCurrentCliskstatus] = useState('');
    const [batchOperations, setBatchOperations] = useState(false);       // 是否进行批量操作
    const [chooseAll, setChooseAll] = useState(false);                   // 全选反选
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示地步的操作选项

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

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - ${batchOperations ? bottomHeight : 0}px)`;
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

    const OptionItem1 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已到面')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon38.webp`}></Image>
                    <View className='option_item_text1'>已到面</View>
                </View>
                {
                    currentCliskstatus === '已到面' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
    }

    const OptionItem2 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试通过')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                    <View className='option_item_text2'>面试通过</View>
                </View>
                {
                    currentCliskstatus === '面试通过' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
    }

    const OptionItem3 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已入职')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon36.webp`}></Image>
                    <View className='option_item_text3'>已入职</View>
                </View>
                {
                    currentCliskstatus === '已入职' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
    }

    const OptionItem4 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已离职')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon39.webp`}></Image>
                    <View className='option_item_text4'>已离职</View>
                </View>
                {
                    currentCliskstatus === '已离职' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
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
            <Navbar fixed placeholder bgColor='transparent' title='名单反馈'></Navbar>
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
                    <View className='filter_wrap_item'>
                        <View>全部岗位</View>
                        <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                    </View>
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
                    {
                        batchOperations ?
                            <View className='search_total_right_t' onClick={() => setBatchOperations(false)}>完成</View> :
                            <View className='search_total_right' onClick={() => setBatchOperations(true)}>
                                <View>批量操作</View>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon33.webp`}></Image>
                            </View>
                    }
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
                            <View className='roster_item' key={index} style={`padding-left:${batchOperations ? '120rpx' : '56rpx'}`}>
                                <View className='roster_item_title'>
                                    <View className='item_title_index'>{index + 1}</View>
                                    <View className='item_title_left'>
                                        <View className='item_title_name'>{item.userName}</View>
                                        <View>{item.detail}</View>
                                    </View>
                                    {
                                        item.status === 1 &&
                                        <>
                                            <View className='item_status_item item_waitInterview' onClick={() => showOptionFunc(item, index)}>
                                                <View>待到面</View>
                                                <Image src={`${Taro.$cdnUrl}/index/index_icon35.webp`}></Image>
                                            </View>
                                            {
                                                item.showOptions &&
                                                <View className='item_status_options'>
                                                    {/* <OptionItem1></OptionItem1>
                                                    <OptionItem2></OptionItem2>
                                                    <OptionItem3></OptionItem3>
                                                    <OptionItem4></OptionItem4> */}
                                                    <UpdateStatus
                                                        onClose={() => setShowbottomOptions(false)}
                                                        showPicker={true}
                                                        currentStatus={currentCliskstatus}
                                                        // bottomHeight={bottomHeight}
                                                        onChange={changeStatus}>

                                                    </UpdateStatus>
                                                </View>
                                            }
                                        </> ||
                                        item.status === 2 &&
                                        <>
                                            <View className='item_status_item item_hasInterview' onClick={() => showOptionFunc(item, index)}>
                                                <View>已到面</View>
                                                <Image src={`${Taro.$cdnUrl}/index/index_icon35.webp`}></Image>
                                            </View>
                                            {
                                                item.showOptions &&
                                                <View className='item_status_options'>
                                                    <UpdateStatus
                                                        onClose={() => setShowbottomOptions(false)}
                                                        showPicker={true}
                                                        currentStatus={currentCliskstatus}
                                                        // bottomHeight={bottomHeight}
                                                        onChange={changeStatus}>

                                                    </UpdateStatus>
                                                </View>
                                            }
                                        </> ||
                                        item.status === 3 &&
                                        <>
                                            <View className='item_status_item item_passInterview' onClick={() => showOptionFunc(item, index)}>
                                                <View>面试通过</View>
                                                <Image src={`${Taro.$cdnUrl}/index/index_icon35.webp`}></Image>
                                            </View>
                                            {
                                                item.showOptions &&
                                                <View className='item_status_options'>
                                                    <UpdateStatus
                                                        onClose={() => setShowbottomOptions(false)}
                                                        showPicker={true}
                                                        currentStatus={currentCliskstatus}
                                                        // bottomHeight={bottomHeight}
                                                        onChange={changeStatus}>

                                                    </UpdateStatus>
                                                </View>
                                            }
                                        </> ||
                                        item.status === 4 &&
                                        <>
                                            <View className='item_status_item item_signup' onClick={() => showOptionFunc(item, index)}>
                                                <View>已入职</View>
                                                <Image src={`${Taro.$cdnUrl}/index/index_icon35.webp`}></Image>
                                            </View>
                                            {
                                                item.showOptions &&
                                                <View className='item_status_options'>
                                                    {/* <OptionItem4></OptionItem4> */}
                                                    <UpdateStatus
                                                        onClose={() => setShowbottomOptions(false)}
                                                        showPicker={true}
                                                        currentStatus={currentCliskstatus}
                                                        // bottomHeight={bottomHeight}
                                                        onChange={changeStatus}>

                                                    </UpdateStatus>
                                                </View>
                                            }
                                        </> ||
                                        item.status === 5 &&
                                        <>
                                            <View className='item_status_item item_dimission' onClick={() => showOptionFunc(item, index)}>
                                                <View>已离职</View>
                                            </View>
                                        </>
                                    }
                                </View>

                                <View className='roster_item_phone'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                    <View>{item.phone}</View>
                                </View>
                                <View className='roster_item_source'><Text>来源：</Text>{item.source}</View>
                                <View className='roster_item_source'><Text>报名岗位：</Text>{item.jobName}</View>
                                <View className='roster_item_hr'></View>
                                <View className='roster_item_time'>面试时间：{item.interviewTime}</View>

                                {
                                    batchOperations && <Image className='roster_item_choose' src={`${Taro.$cdnUrl}/index/index_icon2${item.isChoosed ? 7 : 8}.webp`}></Image>
                                }
                            </View>
                        )
                    })
                }
            </ScrollView>

            {/* 底部操作栏 */}
            <Block>
                {
                    batchOperations &&
                    <View className='footer_wrapper'>
                        <View className='footer_wrapper_top' style={`height:16rpx;`}>
                            <View className='footer_wrapper_top_position'>
                                <UpdateStatus
                                    onClose={() => setShowbottomOptions(false)}
                                    showPicker={showbottomOptions}
                                    currentStatus={currentCliskstatus}
                                    bottomHeight={bottomHeight}
                                    onChange={changeStatus}>

                                </UpdateStatus>
                            </View>

                        </View>
                        <View className='footer_wrapper_content'>
                            <View className='footer_wrapper_left' onClick={() => chooeAllFunc()}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon2${chooseAll ? 7 : 8}.webp`}></Image>
                                <View>全选</View>
                            </View>
                            <View className='footer_btn' onClick={() => setShowbottomOptions(!showbottomOptions)}>修改状态</View>
                        </View>
                        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                    </View>
                }
                {/* {
                    batchOperations && showbottomOptions &&
                    <View className='footer_wrapper_options' style={`bottom:${bottomHeight + 9}px;`}>
                        <OptionItem1></OptionItem1>
                        <OptionItem2></OptionItem2>
                        <OptionItem3></OptionItem3>
                        <OptionItem4></OptionItem4>
                    </View>
                } */}
            </Block>

            {/* 线索来源 */}
            <AtFloatLayout catchMove className='source_init_layout' isOpened={showSourceModel} onClose={() => setShowSourceModel(false)}>
                <View className='filter_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View>按来源筛选</View>
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
