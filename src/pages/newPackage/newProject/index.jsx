/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-11 13:53:55
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { reverseGeocoder } from '@/util/getLocation';

import Navbar from '@/components/navbar';
import ChooseJobType from '@/components/chooseJobType';
import DatePicker from '@/components/datePicker'
import { contractsCreate, updateContracts } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { onSiteInfo, setOnSiteInfo, editProjectInfo, setEditProjectInfo },
    } = store
    const [formData, setFormData] = useState({});

    const [chooseJob, setChooseJob] = useState(false);  // 选择岗位类型的弹窗
    const [chooseAddr, setChooseAddr] = useState({})

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
        if (editProjectInfo) {
            console.log("修改项目信息---editProjectInfo", editProjectInfo);
            setIsUpdate(true);
            setFormData({
                ...editProjectInfo,
                interviewContactInfo: editProjectInfo.interviewContactId
            });
        }
        return () => {
            setEditProjectInfo(null);
        }
    }, [editProjectInfo])

    useEffect(() => {
        if (onSiteInfo.phone) {
            setFormData({ ...formData, interviewContactInfo: onSiteInfo.userSerialCode, interviewContactName: onSiteInfo.name, interviewContactPhone: onSiteInfo.phone });
        }
    }, [onSiteInfo]);

    const getMyAddress = async () => {
        try {
            const res = await Taro.chooseLocation();
            // 获取到用户选择的位置信息
            const { latitude, longitude, name, address } = res;
            console.log('选择的位置：', latitude, longitude, name, address);
            let addr = await reverseGeocoder(latitude, longitude);
            console.log("addraddraddr", addr);
            setChooseAddr({ ...addr, latitude, longitude })
            setFormData({ ...formData, areaName: addr.city + addr.district, areaCode: addr.adcode })
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

    const postProject = async () => {
        let params = {
            ...formData,
            addressDetail: formData.areaName + formData.addressDetail,
        }
        params.numberRecruits = Number(params.numberRecruits);
        console.log("params", params);
        const errorMessages = [
            !params.title && '岗位标题不能为空',
            !params.company && '企业名称不能为空',
            !params.numberRecruits && '招聘人数不能为空',
            !params.jobTypeId && '岗位类型不能为空',
            !params.introduction && '岗位描述不能为空',
        ].filter(Boolean);

        if (errorMessages.length > 0) {
            return Taro.showToast({
                title: errorMessages[0],
                icon: 'none',
            })
        }
        Taro.showLoading({ title: '提交中...', mask: true });
        const { code, data, msg } = await (isUpdate ? updateContracts(params) : contractsCreate(params));
        console.log("contractsCreate", code, data);
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setTimeout(() => {
                if(isUpdate){
                    Taro.navigateBack({ delta: 1 })
                }else{
                    Taro.redirectTo({ url: `/pages/newPackage/newProjectSuccess/index?serialCode=${data.serialCode}` });
                }
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
        Taro.hideLoading();
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='完善项目信息'></Navbar>

            <View className='project_group'>
                <View className='project_item'>
                    <View className='project_item_label project_item_label_required'>岗位标题</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入岗位标题(必填)'
                            placeholderStyle='color: #777777;'
                            value={formData.title}
                            onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>岗位类型</View>
                    <View className='project_item_right' onClick={() => setChooseJob(true)}>
                        <Text className={`${formData.jobTypeId ? 'project_item_text_active' : 'project_item_text'}`}>{formData.jobTypeId ? formData.jobTypeName : '请选择岗位类型(必填)'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>企业名称</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入企业名称(必填)'
                            placeholderStyle='color: #777777;'
                            value={formData.company}
                            onInput={(e) => setFormData({ ...formData, company: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>需求人数</View>
                    <View className='project_item_right'>
                        <Input
                            type='number'
                            className='new_input'
                            placeholder='请输入所需的总人数'
                            placeholderStyle='color: #777777;'
                            value={formData.numberRecruits}
                            onInput={(e) => setFormData({ ...formData, numberRecruits: e.detail.value })}
                        ></Input>
                    </View>
                </View>
            </View>

            <View className='project_group_2'>
                <View className='project_item_textarea'>
                    <View className='project_item_textarea_title'>
                        <View className='project_item_textarea_title_left project_item_label_required'>招聘简章</View>
                        <View className='project_item_stick'>粘贴</View>
                    </View>
                    <View className='input_box'>
                        <Textarea
                            count={false}
                            className='input_text'
                            auto-height
                            confirmType='return'
                            value={formData.introduction}
                            onInput={(e) => setFormData({ ...formData, introduction: e.detail.value })}
                            adjustPosition={false} //键盘弹起时，是否自动上推页面 
                            show-confirm-bar
                            maxlength={500}
                            autoHeight
                            placeholder={`点击输入招工信息...`}
                        />
                    </View>
                </View>
            </View>

            {/* <View className='pay_setting'>
                <View className='pay_setting_title'>
                    <View>岗位薪资</View>
                </View>
                <View className='pay_input_wrap'>
                    <View className='pay_input_item'>
                        <Input
                            type='number'
                            className='pay_input'
                            placeholder='请输入'
                            placeholderStyle='color: #999999;'
                            value={formData.priceOne}
                            onInput={(e) => setFormData({ ...formData, priceOne: e.detail.value })}
                        ></Input>
                    </View>
                    <View className='pay_input_hr'></View>
                    <View className='pay_input_item'>
                        <Input
                            type='number'
                            className='pay_input'
                            placeholder='请输入'
                            placeholderStyle='color: #999999;'
                            value={formData.priceTwo}
                            onInput={(e) => setFormData({ ...formData, priceTwo: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='pay_setting_btns'>
                    <View className={`pay_btn pay_btn_active`}>元/小时</View>
                    <View className={`pay_btn `}>元/天</View>
                    <View className={`pay_btn `}>元/月</View>
                </View>
            </View> */}

            <View className='project_group '>
                <View className='project_item' onClick={() => { Taro.navigateTo({ url: `/pages/newPackage/setOnsite/index?code=${formData.interviewContactInfo ? formData.interviewContactInfo : ''}` }) }}>
                    <View className='project_item_label '>驻场人员</View>
                    {/* 姓名+手机号 */}
                    <View className='project_item_right'>
                        <Text className={`${formData.interviewContactInfo ? 'project_item_text_active' : 'project_item_text'}`}>{formData.interviewContactInfo ? formData.interviewContactName : '驻场人员或者面试联系人'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label '>面试地点</View>
                    <View className='project_item_right' onClick={() => getMyAddress()}>
                        <Text className={`${formData.areaName ? 'project_item_text_active' : 'project_item_text'}`}>{formData.areaName ? formData.areaName : '选择面试地点'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='project_item_2 project_item_border'>
                    <View className='project_item_label '>详细地址</View>
                    <View className='project_item_right'>
                        <Textarea
                            className='new_input_2'
                            count={false}
                            placeholder='请输入详细地址'
                            placeholderStyle='color: #777777;'
                            value={formData.addressDetail}
                            auto-height
                            show-confirm-bar
                            autoHeight
                            confirmType='return'
                            onInput={(e) => setFormData({ ...formData, addressDetail: e.detail.value })}
                        ></Textarea>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>面试日期</View>
                    <View className='project_item_right' onClick={() => setShowDatePicker(true)}>
                        <Text className={`${formData.interviewDate ? 'project_item_text_active' : 'project_item_text'}`}>{formData.interviewDate ? formData.interviewDate : '请选择面试日期'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>

                <View className='project_item_textarea project_item_border'>
                    <View className='project_item_textarea_title'>
                        <View className='project_item_textarea_title_left'>注意事项</View>
                        <View className='project_item_stick'>粘贴</View>
                    </View>
                    <View className='input_box'>
                        <Textarea
                            count={false}
                            className='input_text input_text_2'
                            auto-height
                            confirmType='return'
                            value={formData.interviewPrecautions}
                            onInput={(e) => setFormData({ ...formData, interviewPrecautions: e.detail.value })}
                            adjustPosition={false} //键盘弹起时，是否自动上推页面 
                            show-confirm-bar
                            maxlength={500}
                            autoHeight
                            placeholder={`其他注意事项`}
                        />
                    </View>
                </View>
            </View>

            <View style={`height:300rpx;`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View onClick={postProject} className={`post_btn ${(formData.title && formData.jobTypeId && formData.company && formData.numberRecruits && formData.introduction) ? 'post_btn_active' : ''}`}>{isUpdate ? '保存' : '发布'}项目</View>
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


        </View>
    )
})

export default inject('store')(Index)
