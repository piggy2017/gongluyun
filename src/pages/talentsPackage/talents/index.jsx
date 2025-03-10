/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-10 16:12:53
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'

import SexPicker from '@/components/sexPicker';
import AgePicker from '@/components/agePicker';
import TalentsItem from '@/components/items/talentsItem'

import {
    workbenchclueList
} from '@/util/api'

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, companyVerified, filterJobTypes, setFilterJobTypes },
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(52);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true)
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

    const [list, setList] = useState([]);

    const [showSexPicker, setShowSexPicker] = useState(false);
    const [sex, setSex] = useState(null);
    const [sexText, setSexText] = useState("不限性别");

    const [showAgePicker, setShowAgePicker] = useState(false);
    const [ageText, setAgeText] = useState("不限年龄");
    const [startAge, setStartAge] = useState(null);
    const [endAge, setEndAge] = useState(null);

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
    }, [isLogin, companyVerified])

    useEffect(() => {
        return () => {
            setFilterJobTypes([]);
        }
    }, [])

    useEffect(() => {
        // getList(1);
        console.log("route", route, requestState);
        const { searchValue } = route.params;
        if (searchValue && requestState === 0) {
            setSearchValue(searchValue);
            getList(1, searchValue);
        } else {
            getList(1);
        }
    }, [sex, startAge, endAge, filterJobTypes])

    const getList = async (_pageNo, _value) => {
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            searchInfo: _value ? _value : searchValue,
            sex,
            startAge,
            endAge,
            jobTypeIds: filterJobTypes.length === 0 ? [] : filterJobTypes.map(item => item.id)
        }
        const { code, data } = await workbenchclueList(params);
        console.log("getList", code, data);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            setList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
            setgoonLoad(true);
            setPageNo(data.pageNo);
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px)`;
    }

    const sexPickerSelect = (e) => {    // 选择性别的回调
        console.log("sexPickerSelect", e);
        setSex(e === '' ? null : e);
        setSexText(e === "" ? "不限性别" : (e === 0 ? "男" : "女"));
    }

    const agePickerSelect = (e) => {   // https://echarts.apache.org/examples/data/asset/geo/HK.json
        console.log("agePickerSelect", e);
        setAgeText(e[0] + "-" + e[1] + '岁');
        setStartAge(e[0]);
        setEndAge(e[1]);
    }

    return (
        <View className='container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <Image className='back_icon' src={`${Taro.$cdnBackIcon}`} onClick={() => Taro.navigateBack()}></Image>
                    <View className='search_wrap'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                        <Input className='search_input'
                            placeholder='搜索姓名或手机号'
                            confirmType='search'
                            placeholderStyle='color: #777777;'
                            onInput={(e) => { setSearchValue(e.detail.value) }}
                            onConfirm={(e) => {
                                getList(1);
                                setgoonLoad(true);
                            }}
                            value={searchValue}></Input>
                    </View>
                    <Image className='add_icon' onClick={() => Taro.navigateTo({ url: '/pages/newPackage/newWorker/index?entryChannel=TALENT_POOL' })} src={`${Taro.$cdnUrl}/index/index_icon3.webp`}></Image>
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
                    <View className='filter_wrap_item' onClick={() => {
                        Taro.navigateTo({
                            url: "/pages/selectorPackage/jobChoose/index"
                        })
                    }}>
                        <View>{filterJobTypes.length === 0 ? "全部工种" : filterJobTypes.length === 1 ? filterJobTypes[0].name : filterJobTypes[0].name + '等' + filterJobTypes.length + "个工种"}</View>
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
                            return <TalentsItem index={index} item={item}></TalentsItem>
                        })
                    }

                    {
                        list.length >= 8 &&
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
            }

            <Block>
                <SexPicker showPicker={showSexPicker} onClose={() => { setShowSexPicker(false) }} onChange={sexPickerSelect}></SexPicker>
            </Block>

            <Block>
                <AgePicker showPicker={showAgePicker} onClose={() => { setShowAgePicker(false) }} onChange={agePickerSelect}></AgePicker>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
