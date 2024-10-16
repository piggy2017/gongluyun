/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-16 15:44:28
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import Navbar from '@/components/navbar';
import './index.scss'
import { contractsJobSelector } from '@/util/api'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        businessStore: { poorJobId, myClientJobId, setPoorJobId, setMyClientJobId }
    } = store
    const router = useRouter();

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(52);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 20;
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

    const [list, setList] = useState([
        { name: "龙泉驿区招物流分拣全职月结", id: 1, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 2, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 3, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 4, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 5, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 6, selected: false },
    ]);
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        // type=1 客户池筛选岗位 type=2 我的客户筛选岗位
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
        if (code === 200 && data.responses?.length > 0) {
            for (let i = 0; i < data.responses.length; i++) {
                data.responses[i].selected = false;
            }
            console.log("type", type);
            if (router.params.type == 1 || router.params.type == 2) {
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
                    if (data.responses[i].recruitSerialCode == poorJobId.recruitSerialCode) {
                        data.responses[i].selected = true;
                    }
                }else if (router.params.type == 2) {
                    if (data.responses[i].recruitSerialCode == myClientJobId.recruitSerialCode) {
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

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight + 10}px)`;
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

    const chooseItem = (obj, index) => {
        // 点击选中当前项,取消其他项的选中
        setList(list => {
            let _list = list.map((item, i) => {
                item.selected = false;
                return item
            })
            _list[index].selected = true
            return _list
        })
        if (type == 1) {
            setPoorJobId(obj);
        } else if (type == 2) {
            setMyClientJobId(obj);
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
                            <View className='job_item_name row-show-1'>{item.title}</View>
                            {
                                item.selected && <Image src={`${Taro.$cdnUrl}/index/index_icon13.webp`}></Image>
                            }
                        </View>
                    })
                }
            </ScrollView>
        </View>
    )
})

export default inject('store')(Index)
