/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-11-04 11:09:47
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-06 13:40:00
 * @Description:
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, Textarea, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import WorkerJobType from '@/components/workerJobType';
import DatePicker from '@/components/datePicker'
import { debounce } from '@/util/utils'
import { batchInsert, parsePerson, mySupplierList, getContractsBySupplierAndCompany, contractsList } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const route = useRouter();
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { userInfo: { userSerialCode }, companyInfo },
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
        supplierSerialCode: '',
        recruitSerialCode: '',
        jobTypes: [],
        isOpen: true,
        interviewArranged: true,
        agentSerialCode: userSerialCode
    }
    const [arrangList, setArrangList] = useState([{ ...interViewTemplate }]);    // 安排列表
    const [allOpen, setAllOpen] = useState(true);

    const [aiRecognize, setAiRecognize] = useState('');                           // AI识别内容
    const [showSupplierModel, setShowSupplierModel] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);

    const [goonLoad, setgoonLoad] = useState(true)
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 20
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [list, setList] = useState([]);
    const [supplierInfo, setSupplierInfo] = useState({});

    const [showJobModel, setShowJobModel] = useState(false);
    const [isRefresh2, setIsRefresh2] = useState(false);
    const [goonLoad2, setGoonLoad2] = useState(true);
    const [pageNo2, setPageNo2] = useState(1)
    const [requestStateJob, setRequestStateJob] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [jobList, setJobList] = useState([]);
    const [jobInfo, setJobInfo] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const [jobValue, setJobValue] = useState('');

    useEffect(() => {
        getSupplierList(1);
        getJobList(1);
    }, [])

    useEffect(() => {
        if (supplierInfo.supplierSerialCode) {
            // getJobList(1);
            // setJobInfo({});
        }
    }, [supplierInfo])

    const getSupplierList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
            companySerialCode: companyInfo.companySerialCode,
            supplierSerialCode: '',
            searchInfo: searchValue,
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await mySupplierList(params);
        Taro.hideLoading();
        console.log("code, data", code, data);
        setIsRefresh(false);
        if (code === 200 && data?.responses?.length > 0) {
            data.responses.forEach(item => {
                item.selected = false;
                if (item.supplierSerialCode === supplierInfo.supplierSerialCode) {
                    item.selected = true;
                }
            })
            setList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
            setgoonLoad(true);
            setPageNo(data.pageNo);
            setRequestState(2);
        } else {
            setgoonLoad(false);
            setRequestState(3);
            if (_pageNo === 1) {
                setList([]);
            }
        }
    }

    const getJobList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
            searchInfo: jobValue,
            status: "PROCESSING",
            // supplierSerialCode: supplierInfo.supplierSerialCode,
            // userSerialCode,
            // companySerialCode: companyInfo.companySerialCode,
        }
        setRequestStateJob(1);
        Taro.showLoading({ title: '加载中', mask: true });
        const { code, data } = await contractsList(params);
        Taro.hideLoading();
        console.log("getJobList", code, data);
        setIsRefresh2(false);
        if (code === 200 && data?.responses?.length > 0) {
            data.responses.forEach(item => {
                item.selected = false;
                if (item.recruitSerialCode === jobInfo.recruitSerialCode) {
                    item.selected = true;
                }
            })
            setJobList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
            setGoonLoad2(true);
            setPageNo2(data.pageNo);
            setRequestStateJob(2);
        } else {
            setGoonLoad2(false);
            setRequestStateJob(3);
            if (_pageNo === 1) {
                setJobList([]);
            }
        }
    }


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
            item.interviewDate = interviewDate;
            item.interviewArranged = true;
            item.agentSerialCode = userSerialCode;
            item.source = 'GLPK';
            return item;
        })
        console.log("list", list);
        for (let i = 0; i < list.length; i++) {
            if (!interviewDate) {
                Taro.showToast({ title: '请选择面试日期', icon: 'none', })
                return;
            } else if (!list[i].name) {
                Taro.showToast({ title: '请填写求职者姓名', icon: 'none', })
                return;
            } else if (list[i].sex === '') {
                Taro.showToast({ title: '请选择求职者性别', icon: 'none', })
                return;
            } else if (!list[i].phone || list[i].phone.length != 11) {
                Taro.showToast({ title: '请填写求职者手机号', icon: 'none', })
                return;
            } else if (list[i].idCardNo && list[i].idCardNo.length != 18) {
                Taro.showToast({ title: '请填写18位身份证号', icon: 'none', })
            }
        }

        if (arrangList.length == 4) {
            return Taro.showToast({ title: '一次最多安排4位求职者的面试', icon: 'none', })
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
            item.recruitSerialCode = jobInfo.recruitSerialCode ? jobInfo.recruitSerialCode : '';
            item.supplierSerialCode = supplierInfo.supplierSerialCode ? supplierInfo.supplierSerialCode : '';
            item.interviewDate = interviewDate;
            item.interviewArranged = true;
            item.agentSerialCode = userSerialCode;
            item.source = 'GLPK';
            return item;
        })
        console.log("list", list);
        if (!jobInfo.recruitSerialCode || !supplierInfo.supplierSerialCode) {
            Taro.showToast({ title: '请先选择供应商和岗位', icon: 'none', })
            return;
        }
        for (let i = 0; i < list.length; i++) {
            if (!list[i].interviewDate) {
                Taro.showToast({ title: '请选择面试日期', icon: 'none', })
                return;
            } else if (!list[i].name) {
                Taro.showToast({ title: '请填写求职者姓名', icon: 'none', })
                return;
            } else if (list[i].sex === '') {
                Taro.showToast({ title: '请选择求职者性别', icon: 'none', })
                return;
            }
            // else if (list[i].phone && list[i].phone.length != 11) {
            //     Taro.showToast({ title: '请填写11位求职者手机号', icon: 'none', })
            //     return;
            // } else if (list[i].idCardNo && list[i].idCardNo.length != 18) {
            //     Taro.showToast({ title: '请填写18位身份证号', icon: 'none', })
            //     return;
            // }

            if ((!list[i].phone || list[i].phone.length != 11) && (!list[i].idCardNo || list[i].idCardNo.length != 18)) {
                Taro.showToast({ title: '请填写求职者手机号或身份证', icon: 'none', })
                return;
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

    const handleScrollToLower = debounce(() => {    // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        if (goonLoad) {
            getSupplierList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {    // 滑动到最顶部,触发下拉刷新
        setIsRefresh(true);
        getSupplierList(1);
    }, 200);

    const handleScrollToLowerJob = debounce(() => {    // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        if (goonLoad2) {
            getJobList(pageNo2 + 1);
        }
    }, 500);

    const handleScrollToUpperJob = debounce(() => {    // 滑动到最顶部,触发下拉刷新
        setIsRefresh2(true);
        getJobList(1);
    }, 200);

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#F4F4F4' title='录入面试信息'></Navbar>

            <View className='project_title'>面试信息</View>
            <View className='project_group'>
                <View className='project_item project_item_border' onClick={() => {
                    setShowSupplierModel(true);
                }}>
                    <View className='project_item_label project_item_label_required'>供应商</View>
                    <View className='project_item_right' >
                        <Text className={`${supplierInfo.supplierSerialCode ? 'project_item_text_active' : 'project_item_text'}`}>{supplierInfo.supplierSerialCode ? supplierInfo.name : '选择供应商'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='project_item project_item_border' onClick={() => {
                    // if (!supplierInfo.supplierSerialCode) {
                    //     Taro.showToast({ title: '请先选择供应商', icon: 'none', })
                    //     return;
                    // }
                    setShowJobModel(true);
                }}>
                    <View className='project_item_label project_item_label_required'>岗位</View>
                    <View className='project_item_right' >
                        <Text className={`${jobInfo.title ? 'project_item_text_active' : 'project_item_text'}`}>{jobInfo.title ? jobInfo.title : '选择报名的岗位'}</Text>
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
                                        <View className='project_item_label'>手机号码</View>
                                        <View className='project_item_right'>
                                            <Input
                                                style={`width:400rpx;`}
                                                type='number'
                                                className='new_input'
                                                maxlength='11'
                                                placeholder='输入求职者的手机号'
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
                <View onClick={saveWorker} className={`post_btn ${(supplierInfo.supplierSerialCode && jobInfo.recruitSerialCode && interviewDate && arrangList[0].name && arrangList[0].phone && (arrangList[0].sex === 0 || arrangList[0].sex === 1)) ? 'post_btn_active' : ''}`}>保存</View>
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

            {/* 选择供应商 */}
            <Block>
                {
                    showSupplierModel &&
                    <AtFloatLayout catchMove className='supplier_init_layout' isOpened={showSupplierModel} onClose={() => { setShowSupplierModel(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View>选择供应商</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowSupplierModel(false) }}></AtIcon>
                                </View>
                                <View className='search_content'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                                    <Input className='search_input'
                                        // disabled={(!isLogin || (role === 'SEEK' && !companyVerified)) ? true : false}
                                        placeholder='搜索供应商'
                                        confirmType='search'
                                        placeholderStyle='color: #777777;'
                                        onInput={(e) => { setSearchValue(e.detail.value) }}
                                        onConfirm={() => {
                                            setgoonLoad(true);
                                            getSupplierList(1);
                                        }}
                                        value={searchValue}></Input>
                                </View>
                                <ScrollView scrollY
                                    className='sup_scrollWrapper'
                                    scrollWithAnimation
                                    showScrollbar={false}
                                    enablePassive
                                    refresherEnabled
                                    refresherTriggered={isRefresh}
                                    onScrollToLower={handleScrollToLower}
                                    onRefresherRefresh={handleScrollToUpper}
                                    lowerThreshold={300}>
                                    {
                                        list.length > 0 && list.map((item, index) => {
                                            return (
                                                <View onClick={() => {
                                                    setSupplierInfo(item);
                                                    setList(list => {
                                                        list.forEach(i => {
                                                            i.selected = false
                                                        })
                                                        list[index].selected = true
                                                        return list;
                                                    })
                                                    setTimeout(() => {
                                                        setShowSupplierModel(false);
                                                    }, 200);
                                                }} className={`sup_item ${item.selected ? 'sup_item_active' : ''}`} key={index}>
                                                    {item.name}
                                                </View>
                                            )
                                        })
                                    }
                                    {
                                        list.length >= 7 &&
                                        <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                                    }
                                    {
                                        list.length === 0 && requestState === 3 &&
                                        <Taro.NoData></Taro.NoData>
                                    }
                                </ScrollView>

                                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                            </View>
                        </View>
                    </AtFloatLayout>
                }
            </Block>

            {/* 选择供应商下面的岗位 */}
            <Block>
                {
                    showJobModel &&
                    <AtFloatLayout catchMove className='supplier_init_layout' isOpened={showJobModel} onClose={() => { setShowJobModel(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View>选择岗位</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowJobModel(false) }}></AtIcon>
                                </View>
                                <View className='search_content'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                                    <Input className='search_input'
                                        // disabled={(!isLogin || (role === 'SEEK' && !companyVerified)) ? true : false}
                                        placeholder='搜索岗位'
                                        confirmType='search'
                                        placeholderStyle='color: #777777;'
                                        onInput={(e) => { setJobValue(e.detail.value) }}
                                        onConfirm={() => {
                                            setGoonLoad2(true);
                                            getJobList(1);
                                        }}
                                        value={jobValue}></Input>
                                </View>
                                <ScrollView scrollY
                                    className='sup_scrollWrapper'
                                    scrollWithAnimation
                                    showScrollbar={false}
                                    enablePassive
                                    refresherEnabled
                                    refresherTriggered={isRefresh2}
                                    onScrollToLower={handleScrollToLowerJob}
                                    onRefresherRefresh={handleScrollToUpperJob}
                                    lowerThreshold={300}>
                                    {
                                        jobList.length > 0 && jobList.map((item, index) => {
                                            return (
                                                <View onClick={() => {
                                                    setJobInfo(item);
                                                    setJobList(jobList => {
                                                        jobList.forEach(i => {
                                                            i.selected = false
                                                        })
                                                        jobList[index].selected = true
                                                        return jobList;
                                                    })
                                                    setTimeout(() => {
                                                        setShowJobModel(false);
                                                    }, 200);
                                                }} className={`sup_item ${item.selected ? 'sup_item_active' : ''}`} key={index}>
                                                    {item.title}
                                                </View>
                                            )
                                        })
                                    }
                                    {
                                        jobList.length >= 7 &&
                                        <Taro.LoadMore goonLoad={goonLoad2}></Taro.LoadMore>
                                    }
                                    {
                                        jobList.length === 0 && requestStateJob === 3 &&
                                        <Taro.NoData></Taro.NoData>
                                    }
                                </ScrollView>

                                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                            </View>
                        </View>
                    </AtFloatLayout>
                }
            </Block>
        </View>
    )
})

export default inject('store')(Index)
