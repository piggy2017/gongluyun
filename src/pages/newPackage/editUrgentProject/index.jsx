/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2025-07-31 15:44:47
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, Block, Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, throttleCustom, throttle } from '@/util/utils'
import { reverseGeocoder } from '@/util/getLocation';
import { AtIcon, AtFloatLayout, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/action-sheet.scss";

import Base64 from '@/util/base64';
import crypto from 'crypto-js';

import Navbar from '@/components/navbar';
import ChooseJobType from '@/components/chooseJobType';
import DatePicker from '@/components/datePicker'
import { contractsCreate, updateContracts, fetchOssConfig, getRecruitCompany } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { editUrgentProjectInfo, setEditUrgentProjectInfo },
    } = store
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const [formData, setFormData] = useState({});

    const [chooseJob, setChooseJob] = useState(false);     // 选择岗位类型的弹窗
    const [chooseType, setChooseType] = useState(false);   // 选择工作类型的弹窗   全职-兼职
    const [typeInfo, setTypeInfo] = useState({
        name: "", salaryType: ''
    });
    const [chooseAddr, setChooseAddr] = useState({})

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [types, setTypes] = useState([
        { name: "全职", salaryType: 'FIXED' },
        { name: "兼职", salaryType: 'DAY' },
        { name: "全职/兼职", salaryType: 'ALL' }
    ])

    const [selector, setSelector] = useState(["月", "周", "天", "小时"]);
    const [selectorIndex, setSelectorIndex] = useState(0);
    const [selectorCodes, setSelectorCodes] = useState(['MONTH', 'WEEK', 'DAY', 'HOUR']);

    const [xzType, setxzType] = useState(1);           // 1 固定工资  2 范围工资
    const [rangeLeft, setRangeLeft] = useState('');
    const [rangeRight, setRangeRight] = useState('');

    const [openAction, setOpenAction] = useState(false);           // 是否打开选择照片弹窗
    const [images, setImages] = useState([]);                      // 选择的照片
    const [searchlist, setSearchlist] = useState([]);              // 搜索公司名称


    useEffect(() => {
        if (editUrgentProjectInfo) {
            console.log("修改项目信息---editUrgentProjectInfo", editUrgentProjectInfo);
            let _editProjectInfo = JSON.parse(JSON.stringify(editUrgentProjectInfo));

            setFormData({
                ..._editProjectInfo,
            });
            forceUpdate();
        }
        return () => {
            setEditUrgentProjectInfo(null);
        }
    }, [editUrgentProjectInfo]);

    const postProject = throttle(async () => {
        let params = {
            ...formData,
        }
        params.numberRecruits = Number(params.numberRecruits);
        const errorMessages = [
            !params.title && '岗位标题不能为空',
            !params.projectName && '项目名称不能为空',
            !params.numberRecruits && '招聘人数不能为空',
            !params.recManager && '请填写负责人',
            !params.interviewDate && '请填写面试时间',
        ].filter(Boolean);

        if (errorMessages.length > 0) {
            return Taro.showToast({
                title: errorMessages[0],
                icon: 'none',
            })
        }
        console.log("params", params);
        Taro.showLoading({ title: '提交中...', mask: true });
        const { code, data, msg } = await updateContracts(params);
        console.log("contractsCreate", code, data);
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 })
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
        Taro.hideLoading();
    }, 200)


    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='编辑'></Navbar>

            <View className='project_group'>
                <View className='project_item '>
                    <View className='project_item_label project_item_label_required'>项目名称</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入项目名称(必填)'
                            placeholderStyle='color: #999999;'
                            value={formData.projectName}
                            confirmType='search'
                            onInput={(e) => setFormData({ ...formData, projectName: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>岗位标题</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入岗位标题(必填)'
                            placeholderStyle='color: #999999;'
                            value={formData.title}
                            onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>招聘紧急度</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, urgent: true })} className={`traffic_item ${formData.urgent ? 'traffic_item_active' : ''}`}>紧急</View>
                        <View onClick={() => setFormData({ ...formData, urgent: false })} className={`traffic_item ${formData.urgent === false ? 'traffic_item_active' : ''}`}>非紧急</View>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>需求人数</View>
                    <View className='project_item_right'>
                        <Input
                            type='number'
                            className='new_input'
                            placeholder='请输入所需的总人数(必填)'
                            placeholderStyle='color: #999999;'
                            value={formData.numberRecruits}
                            onInput={(e) => setFormData({ ...formData, numberRecruits: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>负责人</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入负责人(必填)'
                            placeholderStyle='color: #999999;'
                            value={formData.recManager}
                            confirmType='search'
                            onInput={(e) => setFormData({ ...formData, recManager: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>面试时间</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入面试时间(必填)'
                            placeholderStyle='color: #999999;'
                            value={formData.interviewDate}
                            confirmType='search'
                            onInput={(e) => setFormData({ ...formData, interviewDate: e.detail.value })}
                        ></Input>
                    </View>
                </View>
            </View>

            <View style={`height:300rpx;`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View onClick={postProject} className={`post_btn ${(formData.projectName && formData.title && formData.urgent !== null && formData.numberRecruits && formData.recManager && formData.interviewDate) ? 'post_btn_active' : ''}`}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
