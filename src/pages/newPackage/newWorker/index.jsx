/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-11 10:44:27
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { reverseGeocoder } from '@/util/getLocation';
import { throttle } from '@/util/utils'

import Navbar from '@/components/navbar';
import WorkerJobType from '@/components/workerJobType';
import DatePicker from '@/components/datePicker'
import SourcePicker from '@/components/sourcePcker';

import { clueInsert, clueUpdate, parsePerson } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { workerSetCustomerInfo, setAddWorkerJobInfo, editClientInfos, setEditClientInfos, sourceGroup },
        userStore: { role, userInfo: { userSerialCode } },
    } = store
    const [formData, setFormData] = useState({});

    const [chooseJob, setChooseJob] = useState(false);  // 选择岗位类型的弹窗
    const [chooseAddr, setChooseAddr] = useState({})

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showSourcePicker, setShowSourcePicker] = useState(false);

    const [sourceObj, setSourceObj] = useState({    // 筛选来源
        name: '', source: '', value: ''
    })

    const [jobTypeNames, setJobTypeNames] = useState('');
    const [jobTypes, setJobTypes] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);

    const [aiRecognize, setAiRecognize] = useState('');  // AI识别内容

    useEffect(() => {
        if (editClientInfos) {
            setIsUpdate(true);
            setFormData({ ...editClientInfos });
            console.log("修改客户信息---", editClientInfos);
            if (sourceGroup.length > 0) {
                let _obj = sourceGroup.find(item => item.value === editClientInfos.source);
                console.log("_obj", _obj);
                _obj.source = _obj.value;
                setSourceObj(_obj);
            }

            if (editClientInfos.recruitTitle) {
                setAddWorkerJobInfo({
                    title: editClientInfos.recruitTitle, recruitSerialCode: editClientInfos.recruitSerialCode, selected: true, init: true,
                })
            }

            if (editClientInfos.jobTypes && editClientInfos.jobTypes.length > 0) {
                setJobTypes(editClientInfos.jobTypes);

                let _ids = editClientInfos.jobTypes.map(item => item.id);
                let _names = editClientInfos.jobTypes.map(item => item.name);
                setJobTypeNames(_names.join('/'))
                setFormData({
                    ...editClientInfos,
                    jobTypeIds: _ids,
                })
            }
        }
        return () => {
            setEditClientInfos(null);
        }
    }, [editClientInfos, sourceGroup]);

    useEffect(() => {
        if (workerSetCustomerInfo.name) {
            setFormData({ ...formData, service: workerSetCustomerInfo.name });
        }
    }, [workerSetCustomerInfo])

    useEffect(() => {
        return () => {
            setAddWorkerJobInfo({
                title: '',
                recruitSerialCode: '',
                selected: false,
                init: false,
            })
        }
    }, [])

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        // setDateText(e);
        setFormData({ ...formData, interviewDate: e })
    }

    const sourcePickerSelect = (e) => {
        console.log("source", e);
        setSourceObj(e);
        setFormData({ ...formData, source: e.source });
    }

    const saveWorker = throttle(async () => {
        console.log("isUpdateisUpdateisUpdate", isUpdate);

        
        let params = {
            ...formData,
            entryChannel: route.params.entryChannel,
            interviewArranged: formData.interviewDate ? true : false  // route.params.entryChannel === 'TALENT_POOL' ? true : formData.interviewDate ? true : false
        }
        console.log("params", params);
        const errorMessages = [
            !params.source && '请选择求职者来源',
            // !(params.agentSerialCode || params.agentSerialCode === '') && '请为求职者分配跟进人',
            (!params.phone || (params.phone && params.phone.length != 11)) && '请输入11位手机号码',
            (params.idCardNo && params.idCardNo.length != 18) && '请输入18位身份证号码',
        ].filter(Boolean);

        if (errorMessages.length > 0) {
            return Taro.showToast({
                title: errorMessages[0],
                icon: 'none',
            })
        }

        if (route.params.onSite && !isUpdate) {   // 来自于驻场的录入
            formData.agentSerialCode = '';
            if (!formData.recruitSerialCode) {
                return Taro.showToast({ title: '请选择报名岗位', icon: 'none', })
            }
        }else if(!route.params.onSite && !isUpdate){
            if(!(params.agentSerialCode || params.agentSerialCode === '')){
                return Taro.showToast({ title: '请为求职者分配跟进人', icon: 'none', })
            }
            if (formData.agentSerialCode === '') {   // 公海线索 不能设置面试时间
                formData.interviewDate = null;
            }
        }

        // if (!isUpdate && formData.agentSerialCode === userSerialCode && role === 'ON_SITE') { // 驻场角色 录入求职者页面，当客户来源选择了我后，报名岗位+面试日期必填
        //     if (!formData.recruitSerialCode) {
        //         return Taro.showToast({ title: '请选择报名岗位', icon: 'none', })
        //     }
        //     if (!formData.interviewDate) {
        //         return Taro.showToast({ title: '请选择面试日期', icon: 'none', })
        //     }
        // }


        if (formData.interviewDate && !formData.recruitSerialCode && formData.agentSerialCode === userSerialCode) {
            return Taro.showToast({ title: '请选择报名岗位', icon: 'none', })
        }
        if (!isUpdate) {
            Taro.showLoading({ title: '提交中...', mask: true });
        }
        console.log("params_params", params);

        const { code, data, msg } = await (isUpdate ? clueUpdate(params) : clueInsert(params));
        Taro.hideLoading();
        if (code === 200) {
            Taro.showToast({ title: `${isUpdate ? '修改成功' : '录入成功'}`, icon: 'none', });
            setTimeout(() => {
                Taro.navigateBack({
                    delta: (isUpdate && params.agentSerialCode === '') ? 2 : 1
                });
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none', });
        }
    }, 200)

    const stick = (type) => {    // 执行粘贴操作
        Taro.getClipboardData({
            success: function (res) {
                setFormData({ ...formData, phone: res.data });
            }
        })
    }

    const perseInfoFunc = async () => {
        if (!aiRecognize) {
            return Taro.showToast({ title: '请输入或先粘贴识别内容', icon: 'none', });
        }
        Taro.showLoading({ title: '识别中...', mask: true });
        const { code, data, msg } = await parsePerson({ text: aiRecognize });
        Taro.hideLoading();
        console.log("识别", code, data, msg);
        if (code === 200) {
            if (data?.length > 0) {
                setFormData({
                    ...formData,
                    name: data[0].name,
                    age: data[0].age,
                    phone: data[0].phone,
                    sex: data[0].gender === '男' ? 0 : data[0].gender === '女' ? 1 : '',
                    idCardNo: data[0].id,
                })
            }
        } else {
            Taro.showToast({ title: msg, icon: 'none', });
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='录入求职者信息'></Navbar>

            <View className='project_group'>
                {
                    route.params.onSite &&
                    <></> ||
                    <View className='project_item'>
                        <View className='project_item_label project_item_label_required'>客服</View>
                        <View className='project_item_right'>
                            <View onClick={() => setFormData({ ...formData, agentSerialCode: userSerialCode })} className={`option_item ${formData.agentSerialCode === userSerialCode ? 'option_item_active' : ''}`}>我</View>
                            <View onClick={() => setFormData({ ...formData, agentSerialCode: '' })} className={`option_item ${formData.agentSerialCode === '' ? 'option_item_active' : ''}`}>公海</View>
                        </View>
                    </View>
                }

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>来源</View>
                    <View className='project_item_right' onClick={() => setShowSourcePicker(true)}>
                        <Text className={`${formData.source ? 'project_item_text_active' : 'project_item_text'}`}>{formData.source ? sourceObj.name : '选择求职者来源(必填)'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
            </View>

            <View className='ai_recognize'>
                <View className='ai_recognize_title'>示例：某某某,136XXXXXXXX,男，510XXXXXXXXXXX...</View>
                <View className='ai_recognize_content'>
                    <View className='ai_recognize_content_wrap'>
                        <Textarea count={false}
                            className='ai_recognize_input'
                            confirmType='return'
                            value={aiRecognize}
                            onInput={(e) => setAiRecognize(e.detail.value)}
                            adjustPosition={true} // 键盘弹起时，是否自动上推页面 
                            show-confirm-bar
                            placeholder={`粘贴识别或输入文本智能拆分求职者基本信息`}></Textarea>
                        {
                            aiRecognize && <Image src={`${Taro.$cdnUrl}/supplier/supplier_48.webp`} onClick={() => setAiRecognize('')}></Image>
                        }
                    </View>
                    <View className='ai_recognize_btn' onClick={perseInfoFunc}>识别</View>
                </View>
            </View>

            <View className='project_group_l'>基本信息</View>
            <View className='project_group project_group2'>
                <View className='project_item project_item_stick'>
                    <View className='project_item_label project_item_label_required'>手机号码</View>
                    <View className='project_item_right'>
                        <Input
                            type='number'
                            disabled={isUpdate ? true : false}
                            maxlength='11'
                            className='new_input new_input_phone'
                            placeholder='输入求职者的手机号'
                            placeholderStyle='color: #777777;'
                            value={formData.phone}
                            onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
                        ></Input>
                        <View className='project_item_right_stick' onClick={() => stick()}>粘贴</View>
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
                    <View className='project_item_label'>年龄</View>
                    <View className='project_item_right'>
                        <Input
                            type='number'
                            // maxlength='18'
                            className='new_input'
                            placeholder='请输入用户年龄'
                            placeholderStyle='color: #777777;'
                            value={formData.age}
                            onInput={(e) => setFormData({ ...formData, age: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>联系地址</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入用户联系地址'
                            placeholderStyle='color: #777777;'
                            value={formData.address}
                            onInput={(e) => setFormData({ ...formData, address: e.detail.value })}
                        ></Input>
                    </View>
                </View>
            </View>
            <View className='project_group'>
                {
                    route.params.onSite &&   // 驻场角色
                    <>
                        <View className='project_item project_item_border' onClick={() => {
                            Taro.navigateTo({
                                url: `/pages/talentsPackage/filterJob/index?type=3&title=选择报名岗位`
                            })
                        }}>
                            <View className='project_item_label project_item_label_required'>报名岗位</View>
                            <View className='project_item_right' >
                                <Text className={`${formData.recruitSerialCode ? 'project_item_text_active' : 'project_item_text'}`}>{formData.recruitSerialCode ? formData.recruitTitle : '选择求职者报名的岗位'}</Text>
                                <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                            </View>
                        </View>
                        <View className='project_item project_item_border'>
                            <View className='project_item_label'>面试日期</View>
                            <View className='project_item_right' onClick={() => {
                                setShowDatePicker(true)
                            }}>
                                <Text className={`${formData.interviewDate ? 'project_item_text_active' : 'project_item_text'}`}>{formData.interviewDate ? formData.interviewDate : '请选择面试日期'}</Text>
                                <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                            </View>
                        </View>
                    </>
                }

                <View className='project_item project_item_border' onClick={() => setChooseJob(true)}>
                    <View className='project_item_label'>岗位偏好</View>
                    <View className='project_item_right' >
                        <Text className={`${jobTypes.length > 0 ? 'project_item_text_active' : 'project_item_text'}`}>{jobTypes.length > 0 ? jobTypeNames : '选择求职意向'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                {/* <View className='project_item_job project_item_border'>
                    <View className='project_item_label'>求职意向</View>
                    <Textarea
                        count={false}
                        className='job_type_input'
                        confirmType='return'
                        value={formData.jobTypeName}
                        onInput={(e) => setFormData({ ...formData, jobTypeName: e.detail.value })}
                        adjustPosition={true} //键盘弹起时，是否自动上推页面 
                        show-confirm-bar
                        autoHeight
                        placeholder={`输入求职者的求职意向`}>

                    </Textarea>
                </View> */}

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>身份证号</View>
                    <View className='project_item_right'>
                        <Input
                            type='idcard'
                            maxlength='18'
                            className='new_input'
                            placeholder='输入真实身份证号'
                            placeholderStyle='color: #777777;'
                            value={formData.idCardNo}
                            onInput={(e) => setFormData({ ...formData, idCardNo: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                {/* <View className='project_item project_item_border'>
                    <View className='project_item_label'>已安排面试</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, interviewArranged: true })} className={`option_item ${formData.interviewArranged === true ? 'option_item_active' : ''}`}>是</View>
                        <View onClick={() => setFormData({ ...formData, interviewArranged: false })} className={`option_item ${formData.interviewArranged === false ? 'option_item_active' : ''}`}>否</View>
                    </View>
                </View> */}

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
                            adjustPosition={true} //键盘弹起时，是否自动上推页面 
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
                <View onClick={saveWorker} className={`post_btn ${(formData.source && formData.phone) ? 'post_btn_active' : ''}`}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <WorkerJobType isShow={chooseJob}
                    initData={(jobTypes && jobTypes.length > 0) ? jobTypes : []}
                    multiple={true}
                    onClose={(e) => {
                        if (e && e.length) {
                            console.log(e);
                            setJobTypes(e);
                            const ids = e.map(item => item.id);
                            const names = e.map(item => item.name);
                            setJobTypeNames(names.join('/'))
                            setFormData({
                                ...formData,
                                jobTypeIds: ids,
                                // jobTypeName: e[0].name
                            })
                        }
                        setChooseJob(false);
                    }}
                ></WorkerJobType>
            </Block>

            <Block>
                <DatePicker type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>
            </Block>

            <Block>
                <SourcePicker initData={sourceObj} type='1' showPicker={showSourcePicker} onClose={() => { setShowSourcePicker(false) }} onChange={sourcePickerSelect}></SourcePicker>
            </Block>

        </View>
    )
})

export default inject('store')(Index)
