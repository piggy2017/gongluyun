/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-11 16:52:29
 * @Description: 
 */
/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-11 16:44:22
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import { reverseGeocoder } from '@/util/getLocation';
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'

import ChooseJobType from '@/components/chooseJobType';
import DatePicker from '@/components/datePicker'
import SourcePicker from '@/components/sourcePcker';


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store
    const [formData, setFormData] = useState({});

    const [chooseJob, setChooseJob] = useState(false);  // 选择岗位类型的弹窗
    const [chooseAddr, setChooseAddr] = useState({})

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showSourcePicker, setShowSourcePicker] = useState(false);

    const getMyAddress = async () => {
        try {
            const res = await Taro.chooseLocation();
            // 获取到用户选择的位置信息
            const { latitude, longitude, name, address } = res;
            console.log('选择的位置：', latitude, longitude, name, address);
            let addr = await reverseGeocoder(latitude, longitude)
            setChooseAddr({ ...addr, latitude, longitude })
            setFormData({ ...formData, areaName: addr.city + addr.district })
            // onPost()
        } catch (error) {
            console.log('选择位置失败：', error);
            if (error.errMsg == "getLocation:fail auth deny") {
                Taro.openSetting({
                    success: (res) => {
                        // 授权弹窗点击确定
                        if (res.authSetting['scope.userLocation']) {
                            // 用户同意了位置授权
                            // 执行相关逻辑
                        } else {
                            // 用户仍然拒绝了位置授权
                            // 可以提示用户或执行其他操作
                        }
                    }
                });
            }
        }
    }

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        // setDateText(e);
        setFormData({ ...formData, interviewDate: e })
    }

    const sourcePickerSelect=(e)=>{
        console.log("source", e);
        setFormData({ ...formData, source: e })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='录入求职者信息'></Navbar>

            <View className='project_group'>
                <View className='project_item'>
                    <View className='project_item_label project_item_label_required'>来源</View>
                    <View className='project_item_right' onClick={() => setShowSourcePicker(true)}>
                        <Text className={`${formData.source ? 'project_item_text_active' : 'project_item_text'}`}>{formData.source ? formData.source : '选择求职者来源(必填)'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>客服</View>
                    <View className='project_item_right' >
                        <Text className={`${formData.service ? 'project_item_text_active' : 'project_item_text'}`}>{formData.service ? formData.service : '选择跟进的客服(必填)'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>

            </View>

            <View className='project_group'>
                <View className='project_item'>
                    <View className='project_item_label project_item_label_required'>手机号码</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='输入求职者的手机号'
                            placeholderStyle='color: #777777;'
                            value={formData.phone}
                            onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>姓名</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入真实姓名'
                            placeholderStyle='color: #777777;'
                            value={formData.name}
                            onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>性别</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, sex: 0 })} className={`option_item ${formData.sex === 0 ? 'option_item_active' : ''}`}>男</View>
                        <View onClick={() => setFormData({ ...formData, sex: 1 })} className={`option_item ${formData.sex === 1 ? 'option_item_active' : ''}`}>女</View>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>身份证号</View>
                    <View className='project_item_right'>
                        <Input
                            type='idcard'
                            className='new_input'
                            placeholder='输入真实身份证号(选填)'
                            placeholderStyle='color: #777777;'
                            value={formData.idCardNo}
                            onInput={(e) => setFormData({ ...formData, idCardNo: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>报名岗位</View>
                    <View className='project_item_right' >
                        <Text className={`${formData.jobName ? 'project_item_text_active' : 'project_item_text'}`}>{formData.jobName ? formData.jobName : '选择求职者报名的岗位(必填)'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>已安排面试</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, isInterview: 1 })} className={`option_item ${formData.isInterview === 1 ? 'option_item_active' : ''}`}>是</View>
                        <View onClick={() => setFormData({ ...formData, isInterview: 0 })} className={`option_item ${formData.isInterview === 0 ? 'option_item_active' : ''}`}>否</View>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>面试日期</View>
                    <View className='project_item_right' onClick={() => setShowDatePicker(true)}>
                        <Text className={`${formData.interviewDate ? 'project_item_text_active' : 'project_item_text'}`}>{formData.interviewDate ? formData.interviewDate : '请选择面试日期'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
            </View>

            <View className='project_group_2'>
                <View className='project_item_textarea'>
                    <View className='project_item_textarea_title'>
                        <View className='project_item_textarea_title_left'>备注</View>
                        {/* <View className='project_item_stick'>粘贴</View> */}
                    </View>
                    <View className='input_box'>
                        <Textarea
                            count={false}
                            className='input_text'
                            auto-height
                            confirmType='return'
                            value={formData.remark}
                            onInput={(e) => setFormData({ ...formData, remark: e.detail.value })}
                            adjustPosition={false} //键盘弹起时，是否自动上推页面 
                            show-confirm-bar
                            maxlength={500}
                            autoHeight
                            placeholder={`其他备注内容（选填）`}
                        />
                    </View>
                </View>
            </View>

            <View style={`height:300rpx;`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn'>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <ChooseJobType isShow={chooseJob}
                    initData={formData.jobTypeId ? [{ id: formData.jobTypeId, name: formData.jobTypeName }] : []}
                    onClose={(e) => {
                        if (e && e.length) {
                            console.log(e);
                            setFormData({
                                ...formData,
                                jobTypeId: e[0].id,
                                jobTypeName: e[0].name
                            })
                        }
                        setChooseJob(false);
                    }}
                ></ChooseJobType>
            </Block>

            <Block>
                <DatePicker type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>
            </Block>

            <Block>
                <SourcePicker showPicker={showSourcePicker} onClose={() => { setShowSourcePicker(false) }} onChange={sourcePickerSelect}></SourcePicker>
            </Block>

        </View>
    )
})

export default inject('store')(Index)
