/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-10 14:35:24
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-10 14:54:05
 * @Description: 
 */
/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-23 11:05:02
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

import Navbar from '@/components/navbar';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [searchHeight, setSearchHeight] = useState(43);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [title, setTitle] = useState('龙泉驿区招物流分拣全职月结');

    const [list, setList] = useState([
        { isChoosed: false, name: "全部" },
        { isChoosed: false, name: "供应商-成都西红人力资源" },
        { isChoosed: false, name: "供应商-张三" },
        { isChoosed: false, name: "供应商-张三" },
        { isChoosed: false, name: "供应商-张三" },
        { isChoosed: false, name: "供应商-张三" },
    ])

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
    }, [])

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + searchHeight}px - 32rpx)`;
    }

    const chooseFunc = (obj, index) => {
        setList(list => {
            let _list = list.map((item, i) => {
                item.isChoosed = i === index ? true : false;
                return item
            })
            return _list
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='选择供应商'></Navbar>
            <View className='search_wrapper'>
                <View style={`height: 18rpx;`}></View>
                <View className='search_content'>
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
                        return (
                            <View key={index} className='list_item' onClick={() => chooseFunc(item, index)}>
                                <View className='list_item_name'>{item.name}</View>
                                {
                                    item.isChoosed ? <Image className='list_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image> : ''
                                }
                            </View>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
})

export default inject('store')(Index)
