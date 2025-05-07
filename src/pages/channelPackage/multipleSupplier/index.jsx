/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-10 14:35:24
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-06 15:34:54
 * @Description:
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import { selectorQueryDomInfo, debounce, throttleCustom } from '@/util/utils'
import Navbar from '@/components/navbar';
import './index.scss'

import { mySupplierList } from '@/util/api'

const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { channelFilterSupplier, setChannelFilterSupplier, channelListSupplier, setChannelListSupplier },
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
        console.log("choose-channelFilterSupplier", channelFilterSupplier);
    }, [channelFilterSupplier])

    useEffect(() => {
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
            companySerialCode: companyInfo.companySerialCode,
            supplierSerialCode: '',
            searchInfo: searchValue,
        }
        const { code, data } = await mySupplierList(params);
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
                    supplierSerialCode: '',
                    selected: false
                }
                data.responses.unshift(obj);
            }
            for (let i = 0; i < data.responses.length; i++) {
                if (channelListSupplier.length === 1 && channelListSupplier[0].supplierSerialCode === '') {
                    data.responses[i].selected = true;
                } else {
                    for (let j = 0; j < channelListSupplier.length; j++) {
                        if (data.responses[i].supplierSerialCode == channelListSupplier[j].supplierSerialCode) {
                            data.responses[i].selected = true;
                        }
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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight + 10 + bottomSafeAreaHeight}px - 116rpx)`;
    }

    const chooseFunc = throttleCustom((obj, index) => {
        if (obj.supplierSerialCode === '') {
            setList(list.map(item => {
                return {
                    ...item,
                    selected: obj.selected === true ? false : true
                }
            }))
        } else {
            setList(list => {
                let _list = JSON.parse(JSON.stringify(list));
                _list[index].selected = obj.selected === true ? false : true;
                let _filterList = _list.filter(item => item.selected);
                console.log("_filterList.length:", _filterList.length, "_list.length:", _list.length)
                if (obj.selected) {
                    _list[0].selected = false;
                }
                return _list;
            })
        }
    }, 500)

    const postDataFunc = () => {
        let _filterList = list.filter(item => item.selected);
        if (_filterList.length === 0) {
            Taro.showToast({ title: '请选择供应商', icon: 'none' });
            return;
        }
        let _hasAll = _filterList.filter(item => item.supplierSerialCode === '');
        console.log("_filterList:", _filterList, "_hasAll:", _hasAll);

        setChannelListSupplier(_hasAll.length > 0 ? _hasAll : _filterList);
        setTimeout(() => {
            Taro.navigateBack({ delta: 1 });
        }, 300);
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='选择供应商'></Navbar>
            <View className='search_wrapper'>
                <View style={`height: 18rpx;`}></View>
                <View className='search_content'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                    <Input className='search_input'
                        placeholder='输入关键词搜索供应商'
                        confirmType='search'
                        placeholderStyle='color: #777777;'
                        onInput={(e) => { setSearchValue(e.detail.value) }}
                        onConfirm={(e) => {
                            setgoonLoad(true);
                            getList(1);
                        }}
                        value={searchValue}></Input>
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
                    <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                }
                {
                    list.length === 0 && requestState === 3 &&
                    <Taro.NoData></Taro.NoData>
                }
            </ScrollView>

            <View className='page_bottom'>
                <View style='height:20rpx;'></View>
                <View className='post_btn' onClick={postDataFunc}>确定</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
