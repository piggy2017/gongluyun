/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-10 17:09:45
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
import WorkerInfo from '@/components/workerInfo';
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store
    const [type, setType] = useState('报名记录');
    const [signUpList, setSignUpList] = useState([
        {
            id: 1, time: "2024年5月16日", list: [
                { name: "龙泉驿区招物流分拣全职月结", price: "4500元/月", addr: "成都市武侯区 " }
            ]
        },
        {
            id: 2, time: "2024年4月16日", list: [
                { name: "龙泉驿区招物流分拣全职月结", price: "4500元/月", addr: "成都市武侯区 " },
                { name: "龙泉驿区招物流分拣全职月结", price: "4500元/月", addr: "成都市武侯区 " },
                { name: "龙泉驿区招物流分拣全职月结", price: "4500元/月", addr: "成都市武侯区 " }
            ]
        }
    ])

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.bottom_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
            }
        }, 0);
    }, [])

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='求职历史'></Navbar>

            <WorkerInfo></WorkerInfo>

            <View className='record_title flex-row-items'>
                <View onClick={() => setType('报名记录')} className={`record_title_item ${type === '报名记录' ? 'record_title_item_active' : ''}`}>报名记录</View>
                <View onClick={() => setType('入职记录')} className={`record_title_item ${type === '入职记录' ? 'record_title_item_active' : ''}`}>入职记录</View>
            </View>

            <View className='record_content'>
                {
                    signUpList.length > 0 && signUpList.map((item, index) => {
                        return (
                            <View className='record_item' key={index}>
                                <View className='record_item_title'>{item.time}</View>
                                <View className='record_item_list'>
                                    {
                                        item.list.map((child, idx) => {
                                            return (
                                                <View className='record_item_list_item' key={idx}>
                                                    <View className='record_item_names flex-row-between'>
                                                        <View className='record_item_list_item_name row-show-1'>{child.name}</View>
                                                        <View className='record_item_list_item_price'>
                                                            {child.price.split('元/')[0]}
                                                            {
                                                                child.price.split('元/')[1] && <Text>元/{child.price.split('元/')[1]}</Text>
                                                            }
                                                        </View>
                                                    </View>

                                                    <View className='record_item_list_item_addr flex-row-items'>
                                                        <Image src={`${Taro.$cdnUrl}/index/index_icon12.webp`}></Image>
                                                        <View>{child.addr}</View>
                                                    </View>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                            </View>
                        )
                    })
                }
            </View>

            <View style={`height:260rpx`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:16rpx`}></View>
                <View className='interview_btn'>安排面试</View>
                <View style={`height:${bottomSafeAreaHeight}px`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
