/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-10 17:44:43
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
import Navbar from '@/components/navbar';
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(52);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);

    const [list, setList] = useState([
        { name: "龙泉驿区招物流分拣全职月结", id: 1, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 2, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 3, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 4, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 5, selected: false },
        { name: "龙泉驿区招物流分拣全职月结", id: 6, selected: false },
    ]);

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapp');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
    }, [])

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight + 10}px)`;
    }

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
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

    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFF' title='报名岗位'></Navbar>

            <View className='search_wrapp'>
                <View className='input_wrap flex-row-items'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                    <Input className='search_input'
                        placeholder='输入关键词搜索'
                        confirmType='search'
                        placeholderStyle='color: #777777;'
                        onInput={(e) => { setSearchValue(e.detail.value) }}
                        onConfirm={(e) => {
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
                            <View className='job_item_name row-show-1'>{item.name}</View>
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
