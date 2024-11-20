/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-20 17:46:50
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
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import './index.scss'
import { contractsgetRoster } from '@/util/api'
import Navbar from '@/components/navbar';

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, companyVerified }
    } = store;
    const filterList = [                 // 时间筛选列表
        { text: "今日", code: "TODAY" },
        { text: "昨日", code: "YESTERDAY" },
        { text: "本周", code: "THIS_WEEK" },
        { text: "上周", code: "LAST_WEEK" },
        { text: "本月", code: "THIS_MONTH" },
        { text: "上月", code: "LAST_MONTH" },
    ];
    const route = useRouter();
    const [infoHeight, setInfoHeight] = useState(94);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [totalCount, setTotalCount] = useState(0);
    const [title, setTitle] = useState('');

    const [list, setList] = useState([])
    const [source, setSource] = useState('');

    useEffect(() => {
        console.log("route", route);
        const { title, sourceName, dateRange, startDate, endDate } = route.params;
        console.log('title', decodeURIComponent(title))
        setTitle(decodeURIComponent(title));
        setSource(decodeURIComponent(sourceName));

        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.export_infos');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setInfoHeight(_query.height)
            }
        }, 0);

        getList(1);
    }, [])

    const getList = async (_pageNo) => {    // 获取名单列表
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            ...route.params,
            pageNo: _pageNo * 1,
            pageSize
        }
        // delete params.title;
        console.log('params', params);
        const { code, data } = await contractsgetRoster(params);
        console.log("获取名单列表", code, data);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + infoHeight}px)`;
    }

    const callUser = (e, obj) => {
        e.stopPropagation();
        Taro.makePhoneCall({
            phoneNumber: obj.phone
        })
    }

    const getDate = (_code) => {
        if (_code) {
            let _item = filterList.filter(item => item.code === _code);
            return _item[0].text;
        }
    }

    return (
        <View className='container'>
            <Navbar fixed back={false} placeholder bgColor='transparent' title='名单反馈'></Navbar>

            <View className='export_infos'>
                <View className='export_infos_name'>岗位：{title}</View>
                <View className='export_infos_name'>来源：{source}</View>
                <View className='export_infos_time'>时间：{route.params.dateRange ? getDate(route.params.dateRange) : route.params.startDate + '-' + route.params.endDate}</View>
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
                            <View className='roster_item' key={index} style={`padding:30rpx 40rpx 30rpx 68rpx;`}>
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
                                    <View className='roster_item_detail_status' style={{ color: getColor(item.seekState) }}>
                                        <View>{getStatus(item.seekState)}</View>
                                        {/* <AtIcon value='chevron-down' size='14' color={getColor(item.status)}></AtIcon> */}
                                    </View>
                                </View>
                                <View className='roster_item_time'>面试时间：{item.interviewDate}</View>
                            </View>
                        )
                    })
                }

                {
                    list.length >= 7 &&
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
                    list.length === 0 && requestState === 3 &&
                    <View className='no_data'>
                        <View><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
                        <View>暂无相关数据~</View>
                    </View>
                }
            </ScrollView>
        </View>
    )
})

export default inject('store')(Index)
