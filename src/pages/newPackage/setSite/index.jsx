/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-10 14:35:24
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-24 17:05:31
 * @Description: 添加、修改账号,设置站点
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

import { getDepartment } from '@/util/api'

//
const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { siteObj, setSiteObj },
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
    const [choosedList, setChoosedList] = useState([]);

    useEffect(() => {
        console.log("siteObj", siteObj);
        if (siteObj.length > 0) {
            setChoosedList(siteObj);
        }
    }, [siteObj]);

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
            // searchInfo: searchValue,
            companySerialCode: companyInfo.companySerialCode
        }
        const { code, data } = await getDepartment(params);
        console.log("getClueList", code, data);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data?.length > 0) {
            for (let i = 0; i < data.length; i++) {
                data[i].selected = false;
                // if (siteObj.deptId && siteObj.deptId == data[i].deptId) {
                //     data[i].selected = true;
                // }
            }
            let _chooseList = choosedList.length > 0? choosedList : siteObj;

            if (_chooseList.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < _chooseList.length; j++) {
                        if (data[i].deptId === _chooseList[j]) {
                            data[i].selected = true;
                        }
                    }
                }
            }

            setList(_pageNo === 1 ? data : [...list, ...data]);
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
            // getList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
        getList(1);
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight + bottomSafeAreaHeight}px - 160rpx)`;
    }

    const chooseFunc = (obj, index) => {
        setList(list => {
            list[index].selected = !list[index].selected;
            return [...list];
        })
        if (obj.selected) {
            setChoosedList(choosedList => {
                let list = choosedList.filter(item => item !== obj.deptId)
                return list
            })
        } else {
            setChoosedList(choosedList => {
                return [...choosedList, obj.deptId]
            })
        }
    }

    const onCancel = () => {  // 取消
        setList(list => {
            let _list = list.map(item => {
                item.selected = false;
                return item;
            })
            return _list;
        })
        setChoosedList([]);
    }

    const onConfirm = () => {  // 确定
        console.log("choosedList", choosedList);
        setSiteObj(choosedList);
        Taro.navigateBack({
            delta: 1
        });
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='选择站点'></Navbar>
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
                            // <View key={index} className='list_item' onClick={() => chooseFunc(item, index)}>
                            //     <View className='list_item_name'>{item.deptName}</View>
                            //     {
                            //         item.selected ? <Image className='list_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image> : ''
                            //     }
                            // </View>
                            <View className='list_item' key={index} onClick={() => chooseFunc(item, index)}>
                                <Image className='job_item_choose' src={`${Taro.$cdnUrl}/index/index_icon2${item.selected ? 7 : 8}.webp`}></Image>
                                <View className='job_item_name'>{item.deptName}</View>
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

            <View className='job_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='job_bottom_btns'>
                    <View className='cancel_btn' onClick={() => { onCancel() }}>取消</View>
                    <View className='comfirm_btn' onClick={() => { onConfirm() }}>保存</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
