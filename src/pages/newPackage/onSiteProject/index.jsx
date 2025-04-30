/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-28 16:29:21
 * @Description:
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import Navbar from '@/components/navbar';
import './index.scss'
import { contractsList } from '@/util/api'


const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { onSiteProjectList, setOnSiteProjectList }
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(52);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 20;
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

    const [list, setList] = useState([]);
    const [choosedList, setChoosedList] = useState([]);

    useEffect(() => {
        console.log("onSiteProjectList", onSiteProjectList);
        if (onSiteProjectList.length > 0) {
            setChoosedList(onSiteProjectList);
        }
    }, [onSiteProjectList])

    useEffect(() => {
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
            searchInfo: searchValue,
            status: "PROCESSING"
        }
        const { code, data } = await contractsList(params);
        console.log("getClueList", code, data);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            for (let i = 0; i < data.responses.length; i++) {
                data.responses[i].selected = false;
            }
            let _chooseList = [];
            if (choosedList.length > 0) {
                _chooseList = choosedList;
            } else {
                _chooseList = onSiteProjectList;
            }

            if (_chooseList.length > 0) {
                for (let i = 0; i < data.responses.length; i++) {
                    for (let j = 0; j < _chooseList.length; j++) {
                        if (data.responses[i].serialCode === _chooseList[j]) {
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

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight + 10 + bottomSafeAreaHeight}px - 120rpx)`;
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
        if (obj.selected) {
            setChoosedList(choosedList => {
                let list = choosedList.filter(item => item !== obj.serialCode)
                return list
            })
        } else {
            setChoosedList(choosedList => {
                return [...choosedList, obj.serialCode]
            })
        }
        setList(list => {
            list[index].selected = !list[index].selected;
            return [...list];
        })
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
        const { type } = router.params;
        console.log("choosedList", choosedList);
        setOnSiteProjectList(choosedList);
        if (type == 1) {   // 新增驻场员工账号,选择岗位
            Taro.navigateBack({
                delta: 1
            });
        } else if (type == 2) {  // 总的签到码,选择岗位列表
            if (choosedList.length === 0) {
                return Taro.showToast({ title: '请选择项目', icon: 'none' });
            }
            let _list = list.filter(item => item.selected).map(item => {
                let obj = {
                    title: item.title,
                    recruitSerialCode: item.recruitSerialCode
                }
                return obj
            })
            console.log("选择的岗位列表", _list);
            // return
            Taro.redirectTo({
                url: `/pages/projectPackage/signinCode/index?isAll=1&list=${JSON.stringify(_list)}`
            })
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFF' title='添加项目'></Navbar>

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
                        return <View className='job_item' key={index} onClick={() => chooseItem(item, index)}>
                            <Image className='job_item_choose' src={`${Taro.$cdnUrl}/index/index_icon2${item.selected ? 7 : 8}.webp`}></Image>
                            <View className='job_item_content'>
                                <View className='job_item_name'>{item.title}</View>
                                <View className='job_item_num'>公司：{item.compony}</View>
                                <View className='job_item_num'>总需求：{item.numberRecruits}人</View>
                                <View className='job_item_time'>{item.createDate}发布</View>
                            </View>
                        </View>
                    })
                }
                {
                    list.length >= 7 &&
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
