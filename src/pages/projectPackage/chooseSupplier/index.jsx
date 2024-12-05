/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-10 14:35:24
 * @LastEditors: 孙林
 * @LastEditTime: 2024-12-04 14:58:45
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import Navbar from '@/components/navbar';
import './index.scss'

import { getFeedbackObjectsByCustomer } from '@/util/api'

// type = 1 ,来自岗位名单(花名册)的供应商筛选; type = 2 ,来自驻场的名单中供应商筛选
const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { onSiteFilterSUPPLIER, setOnSiteFilterSUPPLIER, rosterFilterSupplier, setRosterFilterSupplier },
        userStore: { companyInfo },
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(43);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 20;
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

    const [list, setList] = useState([]);

    useEffect(() => {
        //   type = 1 ,来自岗位名单(花名册)的供应商筛选; type = 2 ,来自驻场的名单中供应商筛选
        const { type } = router.params;
        console.log('type', type);
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
        getList(1);
    }, [])

    const getList = async (_pageNo) => {
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            searchInfo: searchValue,
            companySerialCode: companyInfo.companySerialCode
        }
        const { code, data } = await getFeedbackObjectsByCustomer(params);
        console.log("getClueList", code, data);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            for (let i = 0; i < data.responses.length; i++) {
                data.responses[i].selected = false;
            }
            if (_pageNo === 1) {
                let obj = {
                    name: '全部供应商',
                    userSerialCode: '',
                    selected: false
                }
                data.responses.unshift(obj);
            }
            const { type } = router.params;
            console.log('router.params_type', type);
            for (let i = 0; i < data.responses.length; i++) {
                if (type == 2) {
                    if (data.responses[i].userSerialCode == onSiteFilterSUPPLIER.userSerialCode) {
                        data.responses[i].selected = true;
                    }
                } else if (type == 1) {
                    if (data.responses[i].userSerialCode == rosterFilterSupplier.userSerialCode) {
                        data.responses[i].selected = true;
                    }
                }
            }
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - 32rpx)`;
    }

    const chooseFunc = (obj, index) => {
        setList(list => {
            let _list = list.map((item, i) => {
                item.selected = i === index ? true : false;
                return item
            })
            return _list
        })
        const { type } = router.params;
        if (type == 1) {
            setRosterFilterSupplier(obj);
        } else if (type == 2) {
            setOnSiteFilterSUPPLIER(obj);
        }

        setTimeout(() => {
            Taro.navigateBack({ delta: 1 });
        }, 300);
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='选择供应商'></Navbar>
            <View className='search_wrapper'>
                <View style={`height: 18rpx;`}></View>
                {/* <View className='search_content'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                    <Input className='search_input'
                        placeholder='输入关键词搜索'
                        confirmType='search'
                        placeholderStyle='color: #777777;'
                        onInput={(e) => { setSearchValue(e.detail.value) }}
                        onConfirm={(e) => {
                            getList(1);
                        }}
                        value={searchValue}></Input>
                </View> */}
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
                            <View key={index} className='list_item' onClick={() => chooseFunc(item, index)}>
                                <View className='list_item_name'>{item.name}</View>
                                {
                                    item.selected ? <Image className='list_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image> : ''
                                }
                            </View>
                        )
                    })
                }
                {
                    list.length >= 14 &&
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
