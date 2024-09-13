/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 16:00:56
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
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='安排面试'></Navbar>
            <WorkerInfo></WorkerInfo>

            <View className='choose_wrapper'>
                <View className='choose_item flex-col-between'>
                    <View className='choose_item_left flex-row-items'>
                        <View className='choose_item_left_dot'></View>
                        <View>姓名</View>
                    </View>
                    <View className='choose_item_right flex-row-items'>
                        <Input
                            className='info_item_input'
                            placeholder='输入真实姓名'
                            value={formData.name}
                            placeholderStyle='color: #777777;'
                            onInput={(e) => setFormData({ ...formData, name: e.target.value })}></Input>
                    </View>
                </View>
                <View className='choose_item flex-col-between'>
                    <View className='choose_item_left flex-row-items'>
                        <View className='choose_item_left_dot'></View>
                        <View>性别</View>
                    </View>
                    <View className='choose_item_right flex-row-items'>
                        <View onClick={() => setFormData({ ...formData, sex: 0 })} className={`sex_item ${formData.sex === 0 ? 'sex_item_active' : ''}`}>男</View>
                        <View onClick={() => setFormData({ ...formData, sex: 1 })} className={`sex_item ${formData.sex === 1 ? 'sex_item_active' : ''}`}>女</View>
                    </View>
                </View>
                <View className='choose_item flex-col-between'>
                    <View className='choose_item_left flex-row-items'>
                        <View className='choose_item_left_dot'></View>
                        <View>报名岗位</View>
                    </View>
                    <View className='choose_item_right flex-row-items'>
                        <View className={`${!formData.jobName ? 'choose_item_right_text_gray' : 'choose_item_right_text'} row-show-1`}>{formData.jobName ? formData.jobName : '选择求职者报名的岗位(必填)'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='choose_item flex-col-between'>
                    <View className='choose_item_left flex-row-items'>
                        <View className='choose_item_left_dot'></View>
                        <View>面试日期</View>
                    </View>
                    <View className='choose_item_right flex-row-items' onClick={() => { setShowDatePicker(true) }}>
                        <View className={`${!formData.dateText ? 'choose_item_right_text_gray' : 'choose_item_right_text'} row-show-1`}>{formData.dateText ? formData.dateText : '选择面试日期'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='choose_item flex-col-between'>
                    <View className='choose_item_left flex-row-items'>
                        <View className='choose_item_left_dot_1'></View>
                        <View>身份证号</View>
                    </View>
                    <View className='choose_item_right flex-row-items'>
                        <Input
                            type='idcard'
                            className='info_item_input'
                            placeholder='输入真实身份证号(选填)'
                            placeholderStyle='color: #777777;'
                            value={formData.idCardNo}
                            onInput={(e) => setFormData({ ...formData, idCardNo: e.detail.value })}
                        ></Input>
                    </View>
                </View>
            </View>

            <Block>
                <DatePicker type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>
            </Block>

            <View className='bottom_wrapper'>
                <View style={`height:16rpx`}></View>
                <View className='interview_btn'>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
