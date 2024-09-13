/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 16:43:35
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-13 15:47:02
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
import DatePicker from '@/components/datePicker'
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store

    const [formData, setFormData] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateText, setDateText] = useState("选择面试日期");

    const [trackList, setTrackList] = useState([
        { label: "8月4日 16:30 内部客服-小李", content: "上报线索" },
        { label: "8月5日 16:30 内部客服-小李", content: "为求职者安排了8月7日的面试" }
    ]);


    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.bottom_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
            }
        }, 0);
    }, [])

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        setDateText(e);
        setFormData({ ...formData, date: e });
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='客户详情'></Navbar>
            <WorkerInfo></WorkerInfo>

            <View className='client_status'>
                <View className='client_status_title'>
                    <View>当前状态</View>
                    <View className='client_status_title_status'>已约面</View>
                </View>
                <View className='client_status_item'>
                    <View className='client_status_item_label'>报名岗位</View>
                    <View className='client_status_item_con'>龙泉驿区招物流分拣招物流分拣全职月结</View>
                </View>
                <View className='client_status_item'>
                    <View className='client_status_item_label'>面试日期</View>
                    <View className='client_status_item_con'>2024年8月5日下午7:30</View>
                </View>
            </View>

            <View className='client_track'>
                <View className='client_track_title'>客户轨迹</View>
                {
                    trackList.length === 1 &&
                    <View className='client_track_item'>
                        <View className='client_track_dot'></View>
                        <View className='client_track_item_label'>{trackList[0].label}</View>
                        <View className='client_track_item_con'>{trackList[0].content}</View>
                    </View> ||
                    trackList.length > 1 && trackList.map((item, index) => {
                        return (
                            <View className='track_item' key={index}>
                                <View className='track_item_label'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon32.webp`}></Image>
                                    <View>{item.label}</View>
                                </View>
                                <View className='track_item_con'>{item.content}</View>
                            </View>
                        )
                    })
                }
            </View>

            <View className='bottom_wrapper'>
                <View style={`height:16rpx`}></View>
                <View className='interview_btn'>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
