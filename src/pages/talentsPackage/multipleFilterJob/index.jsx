/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-17 15:41:15
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, throttleCustom } from '@/util/utils'
import Navbar from '@/components/navbar';
import './index.scss'
import { contractsJobSelector } from '@/util/api'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { poorJobId, myClientJobId, setPoorJobId, setMyClientJobId, onSiteFilterJob, setOnSiteFilterJob }
    } = store
    const router = useRouter();

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(52);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 30;
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

    const [list, setList] = useState([]);
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        // type=1 线索-客户池筛选岗位   type=2 线索-我的客户筛选岗位   type=5 驻厂名单-选择岗位
        const { type, title } = router.params;
        console.log('type, title', type, title);
        setType(type);
        if (title) {
            setTitle(title);
        }
        getList(1);
    }, [])

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapp');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
    }, [])

    const getList = async (_pageNo) => {
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: _pageNo,
            pageSize,
            searchInfo: searchValue
        }

        const { code, data } = await contractsJobSelector(params);
        console.log("getClueList", code, data);
        Taro.hideLoading();
        setIsRefresh(false);
        console.log("router.params", router.params, poorJobId);
        if (code === 200 && data.responses?.length > 0) {
            for (let i = 0; i < data.responses.length; i++) {
                data.responses[i].selected = false;
            }
            if (router.params.type == 1 || router.params.type == 2 || router.params.type == 5) {
                if (_pageNo === 1) {
                    let obj = {
                        title: '全部岗位',
                        recruitSerialCode: '',
                        selected: false
                    }
                    data.responses.unshift(obj);
                }
            }

            for (let i = 0; i < data.responses.length; i++) {
                if (router.params.type == 1) {
                    if (poorJobId.length === 1 && poorJobId[0].recruitSerialCode === '') {
                        data.responses[i].selected = true;
                    } else {
                        for (let j = 0; j < poorJobId.length; j++) {
                            if (data.responses[i].recruitSerialCode == poorJobId[j].recruitSerialCode) {
                                data.responses[i].selected = true;
                            }
                        }
                    }
                } else if (router.params.type == 2) {
                    if (myClientJobId.length === 1 && myClientJobId[0].recruitSerialCode === '') {
                        data.responses[i].selected = true;
                    } else {
                        for (let j = 0; j < myClientJobId.length; j++) {
                            if (data.responses[i].recruitSerialCode == myClientJobId[j].recruitSerialCode) {
                                data.responses[i].selected = true;
                            }
                        }
                    }
                } else if (router.params.type == 5) {  // onSiteFilterJob
                    if (onSiteFilterJob.length === 1 && onSiteFilterJob[0].recruitSerialCode === '') {
                        data.responses[i].selected = true;
                    } else {
                        for (let j = 0; j < onSiteFilterJob.length; j++) {
                            if (data.responses[i].recruitSerialCode == onSiteFilterJob[j].recruitSerialCode) {
                                data.responses[i].selected = true;
                            }
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

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight + 10 + bottomSafeAreaHeight}px - 116rpx)`;
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

    const chooseItem = throttleCustom((obj, index) => {
        if (obj.recruitSerialCode === '') {
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
            Taro.showToast({ title: '请选择岗位', icon: 'none' });
            return;
        }
        let _hasAll = _filterList.filter(item => item.recruitSerialCode === '');

        if (type == 1) {
            setPoorJobId(_hasAll.length > 0 ? _hasAll : _filterList);
        } else if (type == 2) {
            setMyClientJobId(_hasAll.length > 0 ? _hasAll : _filterList);
        }else if(type == 5){
            setOnSiteFilterJob(_hasAll.length > 0 ? _hasAll : _filterList);
        }

        setTimeout(() => {
            Taro.navigateBack({ delta: 1 });
        }, 300);
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFF' title={title ? title : ''}></Navbar>

            <View className='search_wrapp'>
                <View className='input_wrap flex-row-items'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                    <Input className='search_input'
                        placeholder='输入关键词搜索'
                        confirmType='search'
                        placeholderStyle='color: #777777;'
                        onInput={(e) => { setSearchValue(e.detail.value) }}
                        onConfirm={(e) => {
                            getList(1);
                            setgoonLoad(true);
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
                        return <View className='job_item flex-row-between' key={index} onClick={() => chooseItem(item, index)}>

                            <View className='job_item_left'>
                                <View className='job_item_name row-show-1'>{item.title}</View>
                                {
                                    item.company && <View className='job_item_name row-show-1'>所属公司：{item.company}</View>
                                }
                                {
                                    item.status && <View className='job_item_name row-show-1'>项目状态：{item.status === 'PROCESSING' ? '招聘中' : item.status === 'COMPLETED' ? '暂停面试' : ''}</View>
                                }
                            </View>
                            {
                                item.selected && <Image src={`${Taro.$cdnUrl}/index/index_icon13.webp`}></Image>
                            }
                        </View>
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
