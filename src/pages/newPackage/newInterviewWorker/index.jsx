/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-11-04 11:09:47
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-12 14:48:24
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';

import Navbar from '@/components/navbar';
import WorkerJobType from '@/components/workerJobType';
import DatePicker from '@/components/datePicker'

import { batchInsert, parsePerson } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const route = useRouter();
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { userInfo: { userSerialCode } },
        businessStore: { addWorkerJobInfo, setAddWorkerJobInfo }
    } = store

    const [chooseJob, setChooseJob] = useState(false);  // 选择岗位类型的弹窗

    const [showDatePicker, setShowDatePicker] = useState(false);

    // const [jobTypeNames, setJobTypeNames] = useState('');
    const [jobTypes, setJobTypes] = useState([]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [interviewDate, setInterviewDate] = useState('');
    const interViewTemplate = {
        name: '',
        sex: '',
        phone: '',
        idCardNo: '',
        jobTypeIds: [],
        jobTypeNames: "",
        recruitSerialCode: '',
        jobTypes: [],
        isOpen: true,
        interviewArranged: true,
        agentSerialCode: userSerialCode
    }
    const [arrangList, setArrangList] = useState([{ ...interViewTemplate }]); //安排列表
    const [allOpen, setAllOpen] = useState(true);

    const [aiRecognize, setAiRecognize] = useState('');  // AI识别内容

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
        setInterviewDate(e);
        setArrangList(arrangList => {
            arrangList.forEach(item => {
                item.interviewDate = e;
            })
            console.log("arrangList", arrangList)
            return arrangList
        })
    }

    const addWorker = () => {
        // const { recruitSerialCode } = route.params;
        let list = arrangList.map(item => {
            item.recruitSerialCode = addWorkerJobInfo.recruitSerialCode;
            item.interviewDate = interviewDate;
            item.interviewArranged = true;
            item.agentSerialCode = userSerialCode;
            item.source = 'GLPK';
            return item;
        })
        console.log("list", list);
        for (let i = 0; i < list.length; i++) {
            if (!list[i].interviewDate) {
                Taro.showToast({ title: '请选择面试日期', icon: 'none', })
                return;
            } else if (!list[i].name) {
                Taro.showToast({ title: `请填写第${i + 1}位求职者姓名`, icon: 'none', })
                return;
            } else if (list[i].sex === '') {
                Taro.showToast({ title: `请选择第${i + 1}位求职者性别`, icon: 'none', })
                return;
            } else if (!list[i].phone || list[i].phone.length != 11) {
                Taro.showToast({ title: `请填写第${i + 1}位求职者手机号`, icon: 'none', })
                return;
            } else if (list[i].idCardNo && list[i].idCardNo.length != 18) {
                Taro.showToast({ title: `请填写第${i + 1}位求职者18位身份证号`, icon: 'none', })
            }
        }

        if (arrangList.length >= 15) {
            return Taro.showToast({ title: '一次最多安排15位求职者的面试', icon: 'none', })
        }
        let _par = {
            ...interViewTemplate,
            interviewDate
        }
        setArrangList([...arrangList, { ..._par }])
    }

    const setFormListData = (index, type, value) => {
        console.log("setFormListData", index, type, value);
        setArrangList(arrangList => {
            arrangList[index][type] = value
            return arrangList
        })
        forceUpdate();
    }

    const allOpenFunc = () => {
        setAllOpen(!allOpen);
        setArrangList(arrangList => {
            arrangList.forEach(item => {
                item.isOpen = !allOpen
            })
            return arrangList
        })
        forceUpdate();
    }

    const openItemFunc = (index) => {
        setArrangList(arrangList => {
            arrangList[index].isOpen = !arrangList[index].isOpen
            return arrangList
        })
        forceUpdate();
    }

    const deleteItemFunc = (index) => {
        setArrangList(arrangList => {
            arrangList.splice(index, 1)
            return arrangList
        })
        forceUpdate();
    }

    const saveWorker = async () => {
        // const { recruitSerialCode } = route.params;
        let list = arrangList.map(item => {
            item.recruitSerialCode = addWorkerJobInfo.recruitSerialCode;
            item.interviewDate = interviewDate;
            item.interviewArranged = true;
            item.agentSerialCode = userSerialCode;
            item.source = 'GLPK';
            return item;
        })
        console.log("list", list);
        for (let i = 0; i < list.length; i++) {
            if (!list[i].interviewDate) {
                Taro.showToast({ title: '请选择面试日期', icon: 'none', })
                return;
            } else if (!list[i].name) {
                Taro.showToast({ title: `请填写第${i + 1}位求职者姓名`, icon: 'none', })
                return;
            } else if (list[i].sex === '') {
                Taro.showToast({ title: `请选择第${i + 1}位求职者性别`, icon: 'none', })
                return;
            } else if (!list[i].phone || list[i].phone.length != 11) {
                Taro.showToast({ title: `请填写第${i + 1}位求职者手机号`, icon: 'none', })
                return;
            } else if (list[i].idCardNo && list[i].idCardNo.length != 18) {
                Taro.showToast({ title: `请填写第${i + 1}位求职者18位身份证号`, icon: 'none', })
            }
        }
        console.log("list", list);
        Taro.showLoading({ title: '提交中...' });
        const { code, data, msg } = await batchInsert(list);
        Taro.hideLoading();
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none', });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 });
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none', })
        }
    }

    const stick = (index) => {
        Taro.getClipboardData({
            success: function (res) {
                console.log('res')
                setFormListData(index, 'phone', res.data);
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
                let _list = [];
                for (let i = 0; i < data.length; i++) {
                    _list.push({
                        ...interViewTemplate,
                        name: data[i].name,
                        age: data[i].age,
                        phone: data[i].phone,
                        sex: data[i].gender === '男' ? 0 : data[i].gender === '女' ? 1 : '',
                        idCardNo: data[i].id,
                    })
                }
                console.log('   处理后的数据:', _list);
                if (arrangList.length === 1) {
                    if (arrangList[0].name && arrangList[0].phone) {
                        setArrangList([...arrangList, ..._list]);
                    } else {
                        setArrangList(_list);
                    }
                } else {
                    setArrangList([...arrangList, ..._list]);
                }
            }
        } else {
            Taro.showToast({ title: msg, icon: 'none', });
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='录入面试信息'></Navbar>

            <View className='project_title'>面试信息</View>
            <View className='project_group'>
                <View className='project_item project_item_border' onClick={() => {
                    Taro.navigateTo({
                        url: `/pages/talentsPackage/filterJob/index?type=3&title=选择报名岗位`
                    })
                }}>
                    <View className='project_item_label project_item_label_required'>岗位</View>
                    <View className='project_item_right' >
                        <Text className={`${addWorkerJobInfo.title ? 'project_item_text_active' : 'project_item_text'}`}>{addWorkerJobInfo.title ? addWorkerJobInfo.title : '选择求职者报名的岗位'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>

                <View className='project_item project_item_border'>
                    <View className='project_item_label project_item_label_required'>面试日期</View>
                    <View className='project_item_right' onClick={() => {
                        setShowDatePicker(true)
                    }}>
                        <Text className={`${interviewDate ? 'project_item_text_active' : 'project_item_text'}`}>{interviewDate ? interviewDate : '请选择面试日期'}</Text>
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

            <View className='project_title_2'>
                <View>求职者信息</View>
                <View className='project_title_2_right'>
                    <View className='project_title_2_right_item' onClick={addWorker}>
                        <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_2.webp`}></Image>
                        <View>添加</View>
                    </View>
                    <View className='project_title_2_right_item' onClick={allOpenFunc}>
                        <Image className={`${allOpen ? 'eidt_icon' : ''}`} src={`${Taro.$cdnUrl}/newIndex/newIndex_3.webp`}></Image>
                        <View>{allOpen ? '收起' : '展开'}</View>
                    </View>
                </View>
            </View>

            {
                arrangList.map((item, index) => {
                    return (
                        <View className='project_group' key={index}>
                            <View className='project_group_sort'>
                                <View className='project_group_sort_left'>{index >= 9 ? index + 1 : '0' + (index + 1)}</View>

                                <View className='project_group_sort_rightWrap'>
                                    {
                                        index != 0 && <View className='project_group_sort_delete' onClick={() => deleteItemFunc(index)}>删除</View>
                                    }
                                    <View className='project_group_sort_right' onClick={() => openItemFunc(index)}>
                                        <Image className={`${arrangList[index].isOpen ? 'eidt_icon' : ''}`} src={`${Taro.$cdnUrl}/newIndex/newIndex_4.webp`}></Image>
                                        <View>{arrangList[index].isOpen ? '收起' : '展开'}</View>
                                    </View>
                                </View>

                            </View>
                            {
                                item.isOpen &&
                                <>
                                    <View className='project_item project_item_border'>
                                        <View className='project_item_label project_item_label_required'>姓名</View>
                                        <View className='project_item_right'>
                                            <Input
                                                className='new_input'
                                                placeholder='请输入真实姓名(必填）'
                                                placeholderStyle='color: #777777;'
                                                value={arrangList[index].name}
                                                onInput={(e) => setFormListData(index, 'name', e.detail.value)}
                                            ></Input>
                                        </View>
                                    </View>
                                    <View className='project_item project_item_border'>
                                        <View className='project_item_label project_item_label_required'>性别</View>
                                        <View className='project_item_right'>
                                            <View onClick={() => setFormListData(index, 'sex', 0)} className={`option_item ${arrangList[index].sex === 0 ? 'option_item_active' : ''}`}>男</View>
                                            <View onClick={() => setFormListData(index, 'sex', 1)} className={`option_item ${arrangList[index].sex === 1 ? 'option_item_active' : ''}`}>女</View>
                                        </View>
                                    </View>
                                    <View className='project_item'>
                                        <View className='project_item_label project_item_label_required'>手机号码</View>
                                        <View className='project_item_right'>
                                            <Input
                                                style={`width:400rpx;`}
                                                type='number'
                                                className='new_input'
                                                maxlength='11'
                                                placeholder='输入求职者的手机号(必填）'
                                                placeholderStyle='color: #777777;'
                                                value={arrangList[index].phone}
                                                onInput={(e) => setFormListData(index, 'phone', e.detail.value)}
                                            ></Input>
                                            <View className='project_item_right_stick' onClick={() => stick(index)}>粘贴</View>
                                        </View>
                                    </View>
                                    <View className='project_item project_item_border' onClick={() => {
                                        setActiveIndex(index);
                                        setChooseJob(true);
                                    }}>
                                        <View className='project_item_label'>意向工种</View>
                                        <View className='project_item_right' >
                                            <Text className={`${arrangList[index].jobTypeNames ? 'project_item_text_active' : 'project_item_text'}`}>{arrangList[index].jobTypeNames ? arrangList[index].jobTypeNames : '输入求职者的意向工种(选填）'}</Text>
                                            <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                                        </View>
                                    </View>
                                    <View className='project_item project_item_border'>
                                        <View className='project_item_label'>身份证号</View>
                                        <View className='project_item_right'>
                                            <Input
                                                type='idcard'
                                                maxlength='18'
                                                className='new_input'
                                                placeholder='输入真实身份证号(选填）'
                                                placeholderStyle='color: #777777;'
                                                value={arrangList[index].idCardNo}
                                                onInput={(e) => setFormListData(index, 'idCardNo', e.detail.value)}
                                            ></Input>
                                        </View>
                                    </View>
                                    <View className='project_item project_item_border'>
                                        <View className='project_item_label'>年龄</View>
                                        <View className='project_item_right'>
                                            <Input
                                                type='number'
                                                // maxlength='18'
                                                className='new_input'
                                                placeholder='输入用户年龄'
                                                placeholderStyle='color: #777777;'
                                                value={arrangList[index].age}
                                                onInput={(e) => setFormListData(index, 'age', e.detail.value)}
                                            ></Input>
                                        </View>
                                    </View>
                                    <View className='project_item project_item_border'>
                                        <View className='project_item_label'>联系地址</View>
                                        <View className='project_item_right'>
                                            <Input
                                                // type='idcard'
                                                // maxlength='18'
                                                className='new_input'
                                                placeholder='输入用户联系地址'
                                                placeholderStyle='color: #777777;'
                                                value={arrangList[index].address}
                                                onInput={(e) => setFormListData(index, 'address', e.detail.value)}
                                            ></Input>
                                        </View>
                                    </View>
                                    <View className='project_item project_item_border'>
                                        <View className='project_item_label'>民族</View>
                                        <View className='project_item_right'>
                                            <Input
                                                className='new_input'
                                                placeholder='输入用户民族'
                                                placeholderStyle='color: #777777;'
                                                value={arrangList[index].ethnicity}
                                                onInput={(e) => setFormListData(index, 'ethnicity', e.detail.value)}
                                            ></Input>
                                        </View>
                                    </View>

                                    <View className='project_group_2 project_item_border'>
                                        <View className='project_item_textarea'>
                                            <View className='project_item_textarea_title'>
                                                <View className='project_item_textarea_title_left'>备注</View>
                                                {/* <View className='project_item_stick' onClick={() => readClipData()}>粘贴</View> */}
                                            </View>
                                            <View className='input_box'>
                                                <Textarea
                                                    count={false}
                                                    className='input_text'
                                                    auto-height
                                                    confirmType='return'
                                                    value={arrangList[index].remark}
                                                    onInput={(e) => setFormListData(index, 'remark', e.detail.value)}
                                                    adjustPosition={true} //键盘弹起时，是否自动上推页面
                                                    show-confirm-bar
                                                    maxlength={1000}
                                                    autoHeight
                                                    placeholder={`点击输入备注...`}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </> ||
                                <View className='show_close_info'>{arrangList[index].name ? arrangList[index].name : '-'} {arrangList[index].phone ? arrangList[index].phone : '-'}</View>
                            }
                            {
                                (index === (arrangList.length - 1)) &&
                                <View className='add_btn' onClick={addWorker}>
                                    <View className='add_btn_content'>
                                        <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_5.webp`}></Image>
                                        <View>添加求职者</View>
                                    </View>
                                </View>
                            }
                        </View>
                    )
                })
            }

            <View style={`height:300rpx;`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View onClick={saveWorker} className={`post_btn ${(interviewDate && arrangList[0].name && arrangList[0].phone && (arrangList[0].sex === 0 || arrangList[0].sex === 1)) ? 'post_btn_active' : ''}`}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <WorkerJobType isShow={chooseJob}
                    initData={(arrangList[activeIndex].jobTypes && arrangList[activeIndex].jobTypes.length > 0) ? arrangList[activeIndex].jobTypes : []}
                    multiple={true}
                    onClose={(e) => {
                        if (e && e.length) {
                            console.log(e, "activeIndex:", activeIndex);
                            setJobTypes(e);
                            const ids = e.map(item => item.id);
                            const names = e.map(item => item.name);
                            // setJobTypeNames(names.join('/'))
                            // setFormData({
                            //     ...formData,
                            //     jobTypeIds: ids,
                            // })

                            setArrangList(arrangList => {
                                arrangList[activeIndex].jobTypes = e;
                                arrangList[activeIndex].jobTypeIds = ids;
                                arrangList[activeIndex].jobTypeNames = names.join('/');
                                return arrangList
                            })
                            forceUpdate();
                        }
                        setChooseJob(false);
                    }}
                ></WorkerJobType>
            </Block>

            <Block>
                <DatePicker type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>
            </Block>

        </View>
    )
})

export default inject('store')(Index)
