/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2025-07-21 15:06:11
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
        businessStore: { editProjectInfo, setEditProjectInfo, jobFilterAddress, setJobFilterAddress, addProjectInterviewInfo, setAddProjectInterviewInfo },
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
        console.log("jobFilterAddress", formData, jobFilterAddress);
        if (jobFilterAddress.province && !jobFilterAddress.init) {
            setFormData({
                ...formData,
                areaCode: jobFilterAddress.adcode,
                areaName: jobFilterAddress.province + '·' + jobFilterAddress.city + '·' + jobFilterAddress.district
            })
            forceUpdate();
        }
    }, [jobFilterAddress]);

    useEffect(() => {    // 面试联系人信息
        if (Object.keys(addProjectInterviewInfo).length > 0 && !addProjectInterviewInfo.isEdit) {
            console.log("被修改000")
            setFormData({
                ...formData,
                interviewInfo: JSON.parse(JSON.stringify(addProjectInterviewInfo)),
            })
        }
    }, [addProjectInterviewInfo])

    useEffect(() => {
        if (editProjectInfo) {
            console.log("修改项目信息---editProjectInfo", editProjectInfo);
            let _editProjectInfo = JSON.parse(JSON.stringify(editProjectInfo));
            setIsUpdate(_editProjectInfo.fromCopy ? false : true);  // 是否来自于复制项目

            if (_editProjectInfo.jobImages) {
                setImages(_editProjectInfo.jobImages);
            }

            if (_editProjectInfo.salaryType) {
                let _jobTypeText = _editProjectInfo.salaryType === 'FIXED' ? '全职' : _editProjectInfo.salaryType === 'DAY' ? '兼职' : '全职/兼职';
                setTypeInfo({ name: _jobTypeText, salaryType: _editProjectInfo.salaryType });
                _editProjectInfo.jobTypeText = _jobTypeText;
            }
            _editProjectInfo.salaryRange = _editProjectInfo.salaryRange.split("元")[0];
            if (_editProjectInfo.salaryRange.includes("-")) {
                setRangeLeft(_editProjectInfo.salaryRange.split("-")[0]);
                setRangeRight(_editProjectInfo.salaryRange.split("-")[1]);
                setxzType(2);
            }
            if (_editProjectInfo.salaryUnit) {
                setSelectorIndex(selectorCodes.indexOf(_editProjectInfo.salaryUnit));
            }
            if (_editProjectInfo.areaName) {
                let _areaName = _editProjectInfo.areaName.split("·");
                setJobFilterAddress({
                    init: true,
                    adcode: _editProjectInfo.areaCode,
                    city: _areaName[1],
                    district: _areaName[2],
                    province: _areaName[0],
                })
            }
            if (_editProjectInfo.interviewInfo) {
                console.log(11123456789)
                console.log("_editProjectInfo.interviewInfo", _editProjectInfo.interviewInfo);
                setAddProjectInterviewInfo({ ..._editProjectInfo.interviewInfo, isEdit: true })
            }
            setFormData({
                ..._editProjectInfo,
            });
            forceUpdate();

        } else {
            setFormData({
                ...formData,
                settlementType: 'MONTH',
                salaryUnit: 'MONTH',
            })
        }
        return () => {
            setEditProjectInfo(null);
            setJobFilterAddress({
                init: false,
                adcode: '',
                city: '',
                district: '',
                province: '',
            })
            setAddProjectInterviewInfo({})
        }
    }, [editProjectInfo]);

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

    const getSearchList = throttleCustom(async (value) => {
        const { code, data, msg } = await getRecruitCompany({ company: value });
        console.log("getRecruitCompany", code, data, msg);
        if (code === 200 && data?.length > 0) {
            setSearchlist(data);
        } else {
            setSearchlist([]);
            Taro.showToast({ title: '未找到相关企业', icon: 'none' });
        }
    }, 300)

    const handlePhotoClick = async (type) => {
        let sourceType = {
            1: 'album',
            2: 'camera'
        }
        // 用户同意授权
        try {
            Taro.chooseImage({
                count: 6 - images.length, // 最多可选择的图片数量
                sourceType: [sourceType[type]], // 图片来源，可选值：album（相册），camera（相机）
                sizeType: ['original', 'compressed'], // 图片尺寸类型，可选值：original（原图），compressed（压缩图）
                success(res) {
                    setOpenAction(false);
                    // 获取到用户选择的照片信息
                    console.log('选择的照片路径：', res);
                    const { tempFilePaths } = res;
                    getOssSrc(tempFilePaths);
                },
            });
        } catch (err) {
            console.log('选择照片失败：', err);
        }
    }

    const getOssSrc = async (arr) => {
        Taro.showLoading({
            title: '上传中',
            mask: true
        })
        try {
            const result = await fetchOssConfig({ type: "AVATAR", bucket: 'apu-mini' });
            console.log(result, "result")
            if (result.code === 200) {
                let { ossServiceDomain, accessKeyId, urlPath, accessKeySecret, securityToken } = result.data;
                const date = new Date();
                date.setHours(date.getHours() + 1);
                const policyText = {
                    expiration: date.toISOString(),
                    conditions: [
                        ["content-length-range", 0, 1024 * 1024 * 1024],
                    ],
                };
                const policy = Base64.encode(JSON.stringify(policyText));
                const signature = computeSignature(accessKeySecret, policy);

                console.log("arrarrarrarr", arr);
                // 返回 Promise 对象
                const uploadPromises = arr.map(r => {
                    const params = {
                        'key': `${urlPath}${Date.now()}-${Math.random() * 1000000}.jpg`,
                        'policy': policy,
                        'OSSAccessKeyId': accessKeyId,
                        'success_action_status': '200',
                        'Signature': signature,
                        'x-oss-security-token': securityToken,
                    };

                    // 返回 Promise 对象
                    return new Promise((resolve, reject) => {
                        Taro.uploadFile({
                            url: ossServiceDomain,
                            filePath: r,
                            name: 'file',
                            formData: params,
                            success(res) {
                                let imgUrl = ossServiceDomain + '/' + params.key;
                                resolve(imgUrl);
                            },
                            fail(err) {
                                reject(err);
                            }
                        });
                    });
                });

                // 等待所有异步操作完成
                Promise.all(uploadPromises)
                    .then(results => {
                        Taro.hideLoading();
                        setImages([...images, ...results]);
                    })
                    .catch(error => {
                        Taro.hideLoading();
                        console.error(error);
                    });
            } else {
                Taro.hideLoading();
            }
        } catch (e) {
        }
    }

    const computeSignature = (accessKeySecret, canonicalString) => {
        return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
    }

    const deleteImg = (index) => {
        setImages([...images.slice(0, index), ...images.slice(index + 1)])
    }

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        setFormData({ ...formData, interviewDate: e })
    }

    const postProject = throttle(async () => {
        let params = {
            ...formData,
            jobImages: images,
            // addressDetail: formData.areaName + formData.addressDetail,
        }
        params.numberRecruits = Number(params.numberRecruits);
        const errorMessages = [
            // !params.title && '岗位标题不能为空',
            !params.jobTypeId && '岗位类型不能为空',
            !params.salaryType && '工作类型不能为空',
            !params.company && '企业名称不能为空',
            !params.numberRecruits && '招聘人数不能为空',
            !params.areaCode && '工作地区不能为空',
            !params.addressDetail && '工作详细地址不能为空',
            !params.introduction && '岗位描述不能为空',
            !params.interviewInfo && '面试联系人不能为空',
        ].filter(Boolean);

        if (errorMessages.length > 0) {
            return Taro.showToast({
                title: errorMessages[0],
                icon: 'none',
            })
        }

        if (xzType === 1 && !params.salaryRange) {
            return Taro.showToast({ title: '薪资不能为空', icon: 'none', })
        } else if (xzType === 2 && (!rangeLeft || !rangeRight)) {
            return Taro.showToast({ title: '薪资范围不能为空', icon: 'none', })
        }
        if (xzType === 2 && rangeLeft && rangeRight) {
            params.salaryRange = `${rangeLeft}-${rangeRight}`
        }

        console.log("params", params);
        Taro.showLoading({ title: '提交中...', mask: true });
        if (!isUpdate) {
            if (params.serialCode) {
                delete params.recruitserialCode;
                delete params.serialCode;
            }
        }
        const { code, data, msg } = await (isUpdate ? updateContracts(params) : contractsCreate(params));
        console.log("contractsCreate", code, data);
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setTimeout(() => {
                if (isUpdate) {
                    Taro.navigateBack({ delta: 1 })
                } else {
                    Taro.redirectTo({ url: `/pages/newPackage/newProjectSuccess/index?serialCode=${data.serialCode}` });
                }
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
        Taro.hideLoading();
    }, 200)

    const chooseTypeFunc = (name, salaryType) => {
        setChooseType(false);
        setTypeInfo({ name, salaryType });
        setFormData({ ...formData, salaryType, jobTypeText: name });
    }

    const onCustomChange = (e) => {
        console.log("onCustomChange", e);
        let _index = e.detail.value * 1;
        setSelectorIndex(_index);
        setFormData({ ...formData, salaryUnit: selectorCodes[_index] });
    }

    const setxzTypeFunc = (type) => {
        setxzType(type);
        if (type === 1 && formData.salaryRange.includes("-")) {
            setFormData({ ...formData, salaryRange: formData.salaryRange.split('-')[0] });
        }
    }

    const readClipData = () => {  // 读取剪切板 粘贴
        Taro.getClipboardData({
            success: function (res) {
                setFormData({ ...formData, introduction: res.data })
            }
        })
    }

    const previewImg = (imgSrc) => {
        Taro.previewImage({
            current: imgSrc,            // 当前显示图片的链接
            urls: images          // 需要预览的图片列表
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='完善项目信息'></Navbar>

            <View className='project_group'>
                {/* <View className='project_item'>
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
                </View> */}
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>岗位类型</View>
                    <View className='project_item_right' onClick={() => setChooseJob(true)}>
                        <Text className={`${formData.jobTypeId ? 'project_item_text_active' : 'project_item_text'}`}>{formData.jobTypeId ? formData.jobTypeName : '请选择岗位类型(必填)'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>工作类型</View>
                    <View className='project_item_right' onClick={() => setChooseType(true)}>
                        <Text className={`${formData.salaryType ? 'project_item_text_active' : 'project_item_text'}`}>{formData.salaryType ? formData.jobTypeText : '请选择工作类型(必填)'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>流量类型</View>
                    <View className='project_item_right'>
                        <View onClick={() => setFormData({ ...formData, trafficType: 'PUBLIC' })} className={`traffic_item ${formData.trafficType === 'PUBLIC' ? 'traffic_item_active' : ''}`}>公有流量</View>
                        <View onClick={() => setFormData({ ...formData, trafficType: 'PRIVATE' })} className={`traffic_item ${formData.trafficType === 'PRIVATE' ? 'traffic_item_active' : ''}`}>私有流量</View>
                    </View>
                </View>


                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>企业名称</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入企业名称(必填)'
                            placeholderStyle='color: #999999;'
                            value={formData.company}
                            confirmType='search'
                            onInput={(e) => setFormData({ ...formData, company: e.detail.value })}
                            onConfirm={(e) => {
                                if (e.detail.value.length < 2) {
                                    return Taro.showToast({ title: '请输入至少2个字符搜索', icon: 'none' })
                                }
                                getSearchList(e.detail.value);
                            }}
                        ></Input>
                        {
                            formData.company &&
                            <Image onClick={() => setFormData({ ...formData, company: '' })} className='close_img' src={`${Taro.$cdnUrl}/supplier/supplier_88.webp`}></Image>
                        }
                    </View>
                    {
                        searchlist.length > 0 &&
                        <View className='searchlist_wrapper'>
                            {
                                searchlist.map((item, index) => {
                                    return (
                                        <View className={`searchlist_item ${item === formData.company ? 'searchlist_item_active' : ''}`} key={index} onClick={() => {
                                            setFormData({ ...formData, company: item });
                                            setSearchlist([]);
                                        }}>
                                            {item}
                                        </View>
                                    )
                                })
                            }
                        </View>
                    }
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>公司简称</View>
                    <View className='project_item_right'>
                        <Input
                            type='text'
                            className='new_input'
                            placeholder='请输入公司简称'
                            placeholderStyle='color: #999999;'
                            value={formData.companyShortName}
                            onInput={(e) => setFormData({ ...formData, companyShortName: e.detail.value })}
                        ></Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label'>绩效管理</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入内部绩效'
                            placeholderStyle='color: #999999;'
                            value={formData.internalPerformance}
                            onInput={(e) => setFormData({ ...formData, internalPerformance: e.detail.value })}
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
                            placeholderStyle='color: #999999;'
                            value={formData.numberRecruits}
                            onInput={(e) => setFormData({ ...formData, numberRecruits: e.detail.value })}
                        ></Input>
                    </View>
                </View>
                <View className='project_item_address project_item_border'>
                    <View className='project_item_label project_item_label_required'>工作地址</View>
                    <View className='item_address_wrap'>
                        <View className='item_address_wrap_left' onClick={() => {
                            Taro.navigateTo({
                                url: `/pages/selectorPackage/areaChoose/index`
                            })
                        }}>
                            <View className='item_address_text'>{jobFilterAddress.district ? jobFilterAddress.city + "·" + jobFilterAddress.district : '选择地区'}</View>
                            <AtIcon value='chevron-down' size='14' color='#333'></AtIcon>
                        </View>
                        <Input
                            className='new_input_3'
                            placeholder='输入岗详细地址(必填)'
                            placeholderStyle='color: #999999;'
                            value={formData.addressDetail}
                            onInput={(e) => setFormData({ ...formData, addressDetail: e.detail.value })}>
                        </Input>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>面试联系人</View>
                    <View className='project_item_right' onClick={() => {
                        Taro.navigateTo({
                            url: `/pages/newPackage/chooseInterview/index`
                        })
                    }}>
                        <Text className={`${formData.interviewInfo ? 'project_item_text_active' : 'project_item_text'}`}>{formData.interviewInfo ? formData.interviewInfo.interviewContactName : '请选择面试联系人(必填)'}</Text>

                    </View>
                </View>
                <View className='project_item project_item_border'>
                    <View className='project_item_label'>电话号码</View>
                    <View className='project_item_right'>
                        <Input
                            className='new_input'
                            placeholder='请输入企业电话号码'
                            placeholderStyle='color: #999999;'
                            value={formData.recruitPhone}
                            onInput={(e) => setFormData({ ...formData, recruitPhone: e.detail.value })}
                        ></Input>
                    </View>
                </View>
            </View>

            <View className='project_group_2'>
                <View className='unit_title_wraper'>
                    <View onClick={() => setxzTypeFunc(1)} className={`unit_title_item ${xzType === 1 ? 'unit_title_item_active' : ''} `}>固定工资</View>
                    <View onClick={() => setxzTypeFunc(2)} className={`unit_title_item ${xzType === 2 ? 'unit_title_item_active' : ''} `}>范围工资</View>
                </View>
                <View className='unit_content'>
                    <View className='unit_content_left'>
                        {
                            xzType === 1 &&
                            <Input
                                type='number'
                                className='salary_input'
                                placeholder='请输入固定工资(必填)'
                                placeholderStyle='color: #999999;'
                                value={formData.salaryRange}
                                onInput={(e) => setFormData({ ...formData, salaryRange: e.detail.value })}></Input> ||

                            xzType === 2 &&
                            <>
                                <Input
                                    type='number'
                                    className='salary_input_2'
                                    placeholder='最低'
                                    placeholderStyle='color: #999999;'
                                    value={rangeLeft}
                                    onInput={(e) => setRangeLeft(e.detail.value)}></Input>
                                <View className='salary_input_hr'>至</View>
                                <Input
                                    type='number'
                                    className='salary_input_3'
                                    placeholder='最高'
                                    placeholderStyle='color: #999999;'
                                    value={rangeRight}
                                    onInput={(e) => setRangeRight(e.detail.value)}></Input>
                            </>
                        }
                    </View>


                    <Picker mode='selector' range={selector} onChange={onCustomChange}>
                        {/* <View className={`picker ${startDate ? 'picker_active' : ''}}`}>
                            {startDate ? startDate + '开始' : '开始日期'}
                        </View> */}
                        <View className='unit_content_right'>
                            <View className='unit_content_right_text'>元/{selector[selectorIndex]}</View>
                            <AtIcon value='chevron-down' size='20' color='#888888;'></AtIcon>
                        </View>
                    </Picker>
                </View>

                <View className='settle_wrapper'>
                    <View onClick={() => setFormData({ ...formData, settlementType: 'DAY' })} className={`settle_item ${formData.settlementType === 'DAY' ? 'settle_item_active' : ''}`}>日结</View>
                    <View onClick={() => setFormData({ ...formData, settlementType: 'WEEK' })} className={`settle_item ${formData.settlementType === 'WEEK' ? 'settle_item_active' : ''}`}>周结</View>
                    <View onClick={() => setFormData({ ...formData, settlementType: 'MONTH' })} className={`settle_item ${formData.settlementType === 'MONTH' ? 'settle_item_active' : ''}`}>月结</View>
                </View>
            </View>

            <View className='project_group_2'>
                <View className='project_item_textarea'>
                    <View className='project_item_textarea_title'>
                        <View className='project_item_textarea_title_left project_item_label_required'>招聘简章</View>
                        <View className='project_item_stick' onClick={() => readClipData()}>粘贴</View>
                    </View>
                    <View className='input_box'>
                        <Textarea
                            count={false}
                            className='input_text'
                            auto-height
                            confirmType='return'
                            value={formData.introduction}
                            onInput={(e) => setFormData({ ...formData, introduction: e.detail.value })}
                            adjustPosition={true} //键盘弹起时，是否自动上推页面
                            show-confirm-bar
                            maxlength={1000}
                            autoHeight
                            placeholder={`点击输入招工信息...`}
                        />
                    </View>
                </View>
            </View>

            <View className='project_group_2'>
                <View className='project_item_textarea'>
                    <View className='project_item_textarea_title'>
                        <View className='project_item_textarea_title_left'>岗位详情</View>
                        <View className='project_item_stick' onClick={() => readClipData()}>粘贴</View>
                    </View>
                    <View className='input_box'>
                        <Textarea
                            count={false}
                            className='input_text'
                            auto-height
                            confirmType='return'
                            value={formData.privateIntroduction}
                            onInput={(e) => setFormData({ ...formData, privateIntroduction: e.detail.value })}
                            adjustPosition={true} //键盘弹起时，是否自动上推页面
                            show-confirm-bar
                            maxlength={1000}
                            autoHeight
                            placeholder={`点击输入岗位详情...`}
                        />
                    </View>
                </View>
            </View>

            {/* <View className='project_group_imgs'>
                <View className='project_group_imgs_title'>上传厂区照片（{images.length}/6）</View>
                <View className='project_group_imgs_wrap'>
                    {
                        images.length < 6 &&
                        <View className='add_img' onClick={() => {
                            setOpenAction(true);
                        }}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon14.webp`}></Image>
                        </View>
                    }
                    {
                        images.length > 0 && images.map((item, index) => {
                            return <View className='add_img_wrap' key={index}>
                                <Image src={item} className='add_img_item' onClick={() => previewImg(item)}></Image>
                                <Image onClick={() => deleteImg(index)} src={`${Taro.$cdnUrl}/index/index_icon15.webp`} className='add_img_delete'></Image>
                            </View>
                        })
                    }
                </View>
            </View> */}

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

            {/* <View className='project_group '>
                <View className='project_item' onClick={() => { Taro.navigateTo({ url: `/pages/newPackage/setOnsite/index?code=${formData.interviewContactInfo ? formData.interviewContactInfo : ''}` }) }}>
                    <View className='project_item_label '>驻场人员</View>
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
                            placeholderStyle='color: #999999;'
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
            </View> */}

            <View style={`height:300rpx;`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View onClick={postProject} className={`post_btn ${(formData.jobTypeId && formData.salaryType && formData.company && formData.numberRecruits && formData.interviewInfo && formData.addressDetail && formData.introduction) ? 'post_btn_active' : ''}`}>{isUpdate ? '修改' : '发布'}项目</View>
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
                <AtFloatLayout catchMove className='role_init_layout' isOpened={chooseType} onClose={() => { setChooseType(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>请选择工作类型</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setChooseType(false) }}></AtIcon>
                            </View>
                            <View className='type_wrapper'>
                                <View onClick={() => chooseTypeFunc('全职', 'FIXED')} className={`type_item ${typeInfo.name === '全职' ? 'type_item_active' : ''}`}>全职</View>
                                <View onClick={() => chooseTypeFunc('兼职', 'DAY')} className={`type_item ${typeInfo.name === '兼职' ? 'type_item_active' : ''}`}>兼职</View>
                                <View onClick={() => chooseTypeFunc('全职/兼职', 'ALL')} className={`type_item ${typeInfo.name === '全职/兼职' ? 'type_item_active' : ''}`}>全职/兼职</View>
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>

            <Block>
                <AtActionSheet isOpened={openAction} cancelText='取消' onCancel={() => setOpenAction(false)} onClose={() => setOpenAction(false)}>
                    <AtActionSheetItem onClick={() => handlePhotoClick(1)}>
                        选择照片
                    </AtActionSheetItem>
                    <AtActionSheetItem onClick={() => handlePhotoClick(2)}>
                        相机拍照
                    </AtActionSheetItem>
                </AtActionSheet>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
