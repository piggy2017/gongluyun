/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-07-09 14:03:52
 * @LastEditors: 孙林
 * @LastEditTime: 2025-07-10 14:47:25
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { throttle } from '@/util/utils'

import Navbar from '@/components/navbar';
import WorkerJobType from '@/components/workerJobType';
import DatePicker from '@/components/datePicker'
import SourcePicker from '@/components/sourcePcker';
import ScanIdCard from '@/components/scanIdCard';

import { clueUpdate } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { workerSetCustomerInfo, editClientInfos, setEditClientInfos, sourceGroup, editRecommendInfo, setEditRecommendInfo },
        userStore: { userInfo: { userSerialCode }, role },
    } = store
    let [forceUpdate, refreshForceUpdate] = useReducer(x => x + 1, 0);
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

    useEffect(() => {
        if (editClientInfos) {
            setIsUpdate(true);
            setFormData({ ...editClientInfos });
            console.log("修改客户信息---", editClientInfos);
            
            if (editClientInfos.agentSerialCode) {
                setEditRecommendInfo({
                    agentName: editClientInfos.agentName,
                    agentSerialCode: editClientInfos.agentSerialCode,
                    init: true
                })
            }
        }
        return () => {
            setEditClientInfos(null);
        }
    }, [editClientInfos, sourceGroup]);

    useEffect(() => {
        if (editRecommendInfo.agentSerialCode && !editRecommendInfo.init) {
            setFormData({ ...formData, agentSerialCode: editRecommendInfo.agentSerialCode, agentName: editRecommendInfo.agentName });
        }
    }, [editRecommendInfo])

    useEffect(() => {
        if (workerSetCustomerInfo.name) {
            setFormData({ ...formData, service: workerSetCustomerInfo.name });
        }
        // if (addWorkerJobInfo.title) {
        //     setFormData({ ...formData, recruitSerialCode: addWorkerJobInfo.recruitSerialCode });
        // }
    }, [workerSetCustomerInfo])


    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        // setDateText(e);
        setFormData({ ...formData, contractExpiry: e })
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
            //interviewArranged: formData.interviewDate ? true : false  // route.params.entryChannel === 'TALENT_POOL' ? true : formData.interviewDate ? true : false
        }
        delete params.interviewDate;
        console.log("params", params);
        if ((!params.phone || params.phone.length != 11) && (!params.idCardNo || params.idCardNo.length != 18)) {
            Taro.showToast({ title: '请填写求职者手机号或身份证', icon: 'none', })
            return;
        }

        const { code, data, msg } = await clueUpdate(params);
        if (code === 200) {
            Taro.showToast({ title: `${isUpdate ? '修改成功' : '录入成功'}`, icon: 'none', });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 });
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none', });
        }
    }, 200)

    const stick = (type) => {
        Taro.getClipboardData({
            success: function (res) {
                console.log('res', res);
                setFormData(formData => {
                    return {
                        ...formData,
                        [type]: res.data
                    }
                })
                refreshForceUpdate();
            }
        })
    }

    const setIdcardSrc = (src, type) => {
        console.log("身份证上传成功的设置src的回调函数", src, type);
        if (type === 1) {
            setFormData({
                ...formData,
                frontUrl: src
            });
        } else {
            setFormData({
                ...formData,
                backUrl: src
            });
        }
    }

    const setScanInfos = (obj) => {
        console.log("身份证上传成功后识别成功的回调函数", obj);
        setFormData({
            ...formData,
            ...obj
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='编辑信息'></Navbar>

            <View className='project_group'>
                {/* <View className='project_item'>
                    <View className='project_item_label project_item_label_required'>客服</View>
                    <View className='project_item_right'>
                        <View className={`option_item ${formData.agentSerialCode === userSerialCode ? 'option_item_active' : ''}`}>我</View>
                        <View className={`option_item ${formData.agentSerialCode === '' ? 'option_item_active' : ''}`}>公海</View>
                    </View>
                </View> */}
                <View className='project_item'>
                    <View className='project_item_label'>推荐人</View>
                    <View className='project_item_right' onClick={() => {
                        if (role === 'ADMIN' || role === 'CHANNEL') {
                            Taro.navigateTo({
                                url: `/pages/talentsPackage/chooseRecomment/index`
                            })
                        }
                    }}>
                        <Text className={`${formData.agentName ? 'project_item_text_active' : 'project_item_text'}`}>{formData.agentName ? formData.agentName : '选择推荐人'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
            </View>

            <View className='project_group'>
                <View className='project_item'>
                    <View className='project_item_label'>手机号码</View>
                    <View className='project_item_right'>
                        <Input
                            // disabled
                            // type='number'
                            maxlength='11'
                            className='new_input'
                            placeholder='输入求职者的手机号'
                            placeholderStyle='color: #777777;'
                            value={formData.phone}
                            onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
                        ></Input>
                        <View className='paste_btn' onClick={() => stick('phone')}>粘贴</View>
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
                            // type='number'
                            // maxlength='18'
                            className='new_input'
                            placeholder='请输入用户年龄'
                            placeholderStyle='color: #777777;'
                            value={formData.age}
                            onInput={(e) => setFormData({ ...formData, age: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <ScanIdCard
                    initfrontUrl={formData?.frontUrl}
                    initbackUrl={formData?.backUrl}
                    issueDate={formData?.issueDate}
                    expirationDate={formData?.expirationDate}
                    setIdcardSrc={setIdcardSrc}
                    setScanInfos={setScanInfos}
                ></ScanIdCard>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>身份证号</View>
                    <View className='project_item_right'>
                        <Input
                            // type='idcard'
                            maxlength='18'
                            className='new_input'
                            placeholder='输入真实身份证号'
                            placeholderStyle='color: #777777;'
                            value={formData.idCardNo}
                            onInput={(e) => setFormData({ ...formData, idCardNo: e.detail.value })}
                        ></Input>
                        <View className='paste_btn' onClick={() => stick('idCardNo')}>粘贴</View>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>银行卡号</View>
                    <View className='project_item_right'>
                        <Input
                            // type='idcard'
                            maxlength='20'
                            className='new_input'
                            placeholder='输入银行卡号'
                            placeholderStyle='color: #777777;'
                            value={formData.bankCard}
                            onInput={(e) => setFormData({ ...formData, bankCard: e.detail.value })}
                        ></Input>
                        <View className='paste_btn' onClick={() => stick('bankCard')}>粘贴</View>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>民族</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入用户民族'
                            placeholderStyle='color: #777777;'
                            value={formData.ethnicity}
                            onInput={(e) => setFormData({ ...formData, ethnicity: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>学历</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入用户学历'
                            placeholderStyle='color: #777777;'
                            value={formData.education}
                            onInput={(e) => setFormData({ ...formData, education: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>专业</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入用户专业'
                            placeholderStyle='color: #777777;'
                            value={formData.major}
                            onInput={(e) => setFormData({ ...formData, major: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>部门</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入部门'
                            placeholderStyle='color: #777777;'
                            value={formData.deptName}
                            onInput={(e) => setFormData({ ...formData, deptName: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>紧急联系人</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入紧急联系人'
                            placeholderStyle='color: #777777;'
                            value={formData.emergencyContact}
                            onInput={(e) => setFormData({ ...formData, emergencyContact: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>紧急联系人电话</View>
                    <View className='project_item_right'>
                        <Input
                            maxlength='11'
                            className='new_input'
                            placeholder='请输入紧急联系人电话'
                            placeholderStyle='color: #777777;'
                            value={formData.emergencyPhoneNo}
                            onInput={(e) => setFormData({ ...formData, emergencyPhoneNo: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>项目经理</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入项目经理'
                            placeholderStyle='color: #777777;'
                            value={formData.projectManager}
                            onInput={(e) => setFormData({ ...formData, projectManager: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>招聘负责人</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入招聘负责人'
                            placeholderStyle='color: #777777;'
                            value={formData.recruitmentOfficer}
                            onInput={(e) => setFormData({ ...formData, recruitmentOfficer: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>结算专员</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入结算专员'
                            placeholderStyle='color: #777777;'
                            value={formData.settlementOfficer}
                            onInput={(e) => setFormData({ ...formData, settlementOfficer: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>是否签署合同</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, contractState: 'SIGNED' })} className={`option_item ${formData.contractState === 'SIGNED' ? 'option_item_active' : ''}`}>已签</View>
                        <View onClick={() => setFormData({ ...formData, contractState: 'UNSIGNED' })} className={`option_item ${formData.contractState === 'UNSIGNED' ? 'option_item_active' : ''}`}>未签</View>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>合同到期日期</View>
                    <View className='project_item_right' onClick={() => {
                        setShowDatePicker(true);
                    }}>
                        <Text className={`${formData.contractExpiry ? 'project_item_text_active' : 'project_item_text'}`}>{formData.contractExpiry ? formData.contractExpiry : '合同到期日期'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>

                    {/* <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入合同到期日期'
                            placeholderStyle='color: #777777;'
                            value={formData.contractExpiry}
                            onInput={(e) => setFormData({ ...formData, contractExpiry: e.detail.value })}
                        ></Input>
                    </View> */}
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>是否购买意外险</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, accidentInsurance: true })} className={`option_item ${formData.accidentInsurance === true ? 'option_item_active' : ''}`}>是</View>
                        <View onClick={() => setFormData({ ...formData, accidentInsurance: false })} className={`option_item ${formData.accidentInsurance === false ? 'option_item_active' : ''}`}>否</View>
                    </View>
                </View>

                {/* <View className='project_item project_item_border'>
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
                <View className='project_item project_item_border' onClick={() => setChooseJob(true)}>
                    <View className='project_item_label'>岗位偏好</View>
                    <View className='project_item_right' >
                        <Text className={`${jobTypes.length > 0 ? 'project_item_text_active' : 'project_item_text'}`}>{jobTypes.length > 0 ? jobTypeNames : '选择求职意向'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View> */}
            </View>
            <View className='project_group'>
                {/* <View className='project_item project_item_border' onClick={() => {
                    Taro.navigateTo({
                        url: `/pages/talentsPackage/filterJob/index?type=3&title=选择报名岗位`
                    })
                }}>
                    <View className='project_item_label'>报名岗位</View>
                    <View className='project_item_right' >
                        <Text className={`${formData.recruitSerialCode ? 'project_item_text_active' : 'project_item_text'}`}>{formData.recruitSerialCode ? addWorkerJobInfo.title : '选择求职者报名的岗位'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View> */}



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


                {/* <View className='project_item project_item_border'>
                    <View className='project_item_label'>已安排面试</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, interviewArranged: true })} className={`option_item ${formData.interviewArranged === true ? 'option_item_active' : ''}`}>是</View>
                        <View onClick={() => setFormData({ ...formData, interviewArranged: false })} className={`option_item ${formData.interviewArranged === false ? 'option_item_active' : ''}`}>否</View>
                    </View>
                </View> */}
                {/* <View className='project_item project_item_border'>
                    <View className='project_item_label'>面试日期</View>
                    <View className='project_item_right' onClick={() => {
                        if (isUpdate) return;
                        setShowDatePicker(true)
                    }}>
                        <Text className={`${formData.interviewDate ? 'project_item_text_active' : 'project_item_text'}`}>{formData.interviewDate ? formData.interviewDate : '请选择面试日期'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
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
                <View onClick={saveWorker} className={`post_btn post_btn_active`}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                {/* <WorkerJobType isShow={chooseJob}
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
                ></WorkerJobType> */}
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
