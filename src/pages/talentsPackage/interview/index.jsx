/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-18 11:36:31
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
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

import { cluegetUserInfo, arrangeInterview } from '@/util/api'


const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { interviewJobInfo, setInterviewJobInfo }
    } = store

    const [formData, setFormData] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateText, setDateText] = useState("选择面试日期");
    const [clientInfos, setClientInfos] = useState(null);


    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.bottom_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
            }
        }, 0);
        getClientDetail();
        return () => {
            setInterviewJobInfo({
                title: '',
                recruitSerialCode: '',
                selected: false,
                init: false,
            })
        }
    }, [])

    useEffect(() => {
        if (interviewJobInfo && interviewJobInfo.title && !interviewJobInfo.init) {
            setFormData({ ...formData, recruitSerialCode: interviewJobInfo.recruitSerialCode, recruitTitle: interviewJobInfo.title });
        }
    }, [interviewJobInfo])

    const getClientDetail = async () => {
        const { uuid, phone } = route.params;
        const { code, data, msg } = await cluegetUserInfo({ uuid, phone });
        console.log("code", code, "data", data, "msg", msg);
        if (code === 200) {
            setClientInfos(data);
            setFormData({ ...formData, ...data });
            if (data.recruitTitle) {
                setInterviewJobInfo({ title: data.recruitTitle, recruitSerialCode: data.recruitSerialCode, selected: true, init: true, })
            }
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        setDateText(e);
        setFormData({ ...formData, interviewDate: e });
    }

    const submitFunc = async () => {
        const { uuid } = route.params;
        let params = {
            ...formData,
            uuid
        }

        console.log("params", params);
        const errorMessages = [
            !params.name && '请输入求职者真实姓名',
            !(params.sex === 0 || params.sex === 1) && '请选择求职者性别',
            !params.recruitSerialCode && '请选择岗位',
            !params.interviewDate && '请选择面试日期',
        ].filter(Boolean);

        if (errorMessages.length > 0) {
            return Taro.showToast({
                title: errorMessages[0],
                icon: 'none',
            })
        }
        Taro.showLoading({ title: '提交中...' });
        const { code, data, msg } = await arrangeInterview(params);
        Taro.hideLoading();
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 })
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='安排面试'></Navbar>
            <WorkerInfo info={clientInfos} interview={true}></WorkerInfo>

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
                    <View className='choose_item_right flex-row-items' onClick={() => {
                        Taro.navigateTo({
                            url: `/pages/talentsPackage/filterJob/index?type=4&title=报名岗位`
                        })
                    }}>
                        <View className={`${!formData.recruitTitle ? 'choose_item_right_text_gray' : 'choose_item_right_text'} row-show-1`}>{formData.recruitTitle ? formData.recruitTitle : '选择岗位(必填)'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='choose_item flex-col-between'>
                    <View className='choose_item_left flex-row-items'>
                        <View className='choose_item_left_dot'></View>
                        <View>面试日期</View>
                    </View>
                    <View className='choose_item_right flex-row-items' onClick={() => { setShowDatePicker(true) }}>
                        <View className={`${!formData.interviewDate ? 'choose_item_right_text_gray' : 'choose_item_right_text'} row-show-1`}>{formData.interviewDate ? formData.interviewDate : '请选择面试日期'}</View>
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
                            maxlength='18'
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
                <View onClick={() => { submitFunc() }} className={`interview_btn ${formData.name && (formData.sex === 0 || formData.sex === 1) && formData.interviewDate && formData.recruitSerialCode ? 'interview_btn_active' : ''}`}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
