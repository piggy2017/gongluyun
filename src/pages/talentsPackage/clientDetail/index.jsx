/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-13 15:15:54
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-17 11:00:03
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Textarea, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import WorkerInfo from '@/components/workerInfo';
import DatePicker from '@/components/datePicker'
import UpdateStatus from '@/components/updateStatus';
import './index.scss'

import { cluegetUserInfo, updateInterviewer, clueStateFlow, cluemyClients, contractsgetRoster, unsuitable } from '@/util/api'


const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight, keyBoardHeight, setKeyBoardHeight },
        businessStore: { myClientParams },
        userStore: { myPermissions, role },
    } = store

    const [formData, setFormData] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateText, setDateText] = useState("选择面试日期");
    const [bottomHeight, setBottomHeight] = useState(90);
    const [uuid, setUuid] = useState('');

    const [trackList, setTrackList] = useState([]);

    const [totalPerson, setTotalPerson] = useState(1);
    const [current, setCurrent] = useState(1);
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示地步的操作选项
    const [currentCliskstatus, setCurrentCliskstatus] = useState('面试失败');
    const [clientInfos, setClientInfos] = useState(null);
    const [reason, setReason] = useState('');
    const [showReason, setShowReason] = useState(false);

    useDidShow(() => {
        if (clientInfos && clientInfos.uuid) {
            getClientDetail(clientInfos.uuid, clientInfos.phone);
            getHistoryList(clientInfos.uuid);
        }
    })

    useEffect(() => {
        const { uid, myClientCount, index, phone } = route.params;
        console.log("route.params", route.params);
        getClientDetail(uid, phone);
        getHistoryList(uid);
        setUuid(uid);
        setCurrent(index * 1);
        setTotalPerson(myClientCount * 1);
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.bottom_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
            }
        }, 0);
    }, [])

    const getClientDetail = async (_uuid, _phone) => {
        const { code, data, msg } = await cluegetUserInfo({ uuid: _uuid, phone: _phone });
        console.log("code", code, "data", data, "msg", msg);
        if (code === 200) {
            setClientInfos(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const getHistoryList = async (_uuid) => {
        const { code, data, msg } = await clueStateFlow({ uuid: _uuid });
        console.log("getHistoryList_code", code, "data", data, "msg", msg);
        if (code === 200 && data?.length > 0) {
            setTrackList(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        setDateText(e);
        setFormData({ ...formData, date: e });
    }

    const OptionItem1 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已到面')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon38.webp`}></Image>
                    <View className='option_item_text1'>已到面</View>
                </View>
                {
                    currentCliskstatus === '已到面' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
    }

    const OptionItem2 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('面试通过')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                    <View className='option_item_text2'>面试通过</View>
                </View>
                {
                    currentCliskstatus === '面试通过' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
    }

    const OptionItem3 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已入职')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon36.webp`}></Image>
                    <View className='option_item_text3'>已入职</View>
                </View>
                {
                    currentCliskstatus === '已入职' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
    }

    const OptionItem4 = () => {
        return (
            <View className='item_status_option_item' onClick={() => setCurrentCliskstatus('已离职')}>
                <View className='option_item_icon'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon39.webp`}></Image>
                    <View className='option_item_text4'>已离职</View>
                </View>
                {
                    currentCliskstatus === '已离职' &&
                    <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                }
            </View>
        )
    }

    const setCurrentIndex = (type) => {
        setShowbottomOptions(false);
        if (type === "add") {
            if (current === totalPerson) return;
            // setCurrent(current => current + 1);
            getOherClient(current * 1 + 1);
        } else {
            if (current === 1) return;
            // setCurrent(current => current - 1);
            getOherClient(current * 1 - 1);
        }
    }

    
    const getOherClient = async (_current) => {
        const { type } = route.params;   // type=1 驻场-名单进入
        let _params = {
            ...myClientParams,
            pageNo: _current,
            pageSize: 1
        }
        const { code, data, msg } = await (type ? contractsgetRoster(_params) : cluemyClients(_params));// cluemyClients(_params);
        console.log("code_getOherClient", code, "data", data, "msg", msg);
        if (code === 200 && data?.responses?.length > 0) {
            setCurrent(_current);
            setClientInfos(data.responses[0]);
            getHistoryList(data.responses[0].uuid);
            setUuid(data.responses[0].uuid);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const changeStatus = (e, reason) => {
        console.log("changeStatus", e, reason);
        setCurrentCliskstatus(e);
        Taro.showLoading({ title: '提交中...' });
        let params = {
            uuid: clientInfos.uuid,
            seekState: e
        }
        if (reason) {
            if (e === 'INTERVIEW_FAILED') {
                params.failReason = reason;
            } else if (e === 'RESIGN') {
                params.resignReason = reason;
            }
        }
        updateInterviewer(params).then(res => {
            Taro.hideLoading();
            if (res.code === 200) {
                Taro.showToast({ title: '更新成功', icon: 'none' })
                setClientInfos({ ...clientInfos, seekState: e });
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' });
            }
        })
    }

    const unsuitableFunc = async () => {
        if(myPermissions.includes('14')){
            setShowReason(true);
        }else{
            return Taro.showToast({ title: '暂无权限', icon: 'none' });
        }
    }

    const saveReasonFunc = async () => {
        if (!reason) {
            return Taro.showToast({ title: '请输入不合适原因', icon: 'none' });
        }
        Taro.showLoading({ title: '提交中...', mask: true });
        const { code, data, msg } = await unsuitable({ uuid: clientInfos.uuid, unsuitableReason: reason });
        Taro.hideLoading();
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setShowReason(false);
            getClientDetail(clientInfos.uuid, clientInfos.phone);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const goInterview = () => {
        if(!myPermissions.includes('14')){
            return Taro.showToast({ title: '暂无权限', icon: 'none' });
        }
        Taro.navigateTo({
            url: `/pages/talentsPackage/interview/index?uuid=${clientInfos.uuid}&phone=${clientInfos.phone}`
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='客户详情'></Navbar>
            <WorkerInfo info={clientInfos} type={1}></WorkerInfo>

            <View className='client_status'>
                <View className='client_status_title'>
                    <View>当前状态</View>
                    {
                        (clientInfos && (clientInfos.seekState === 'PENDING' || clientInfos.seekState === 'UNSUITABLE')) &&
                        <View className='client_status_title_right'>
                            <View>待安排面试</View>
                            {/* <AtIcon value='chevron-right' size='16' color='#1678FF'></AtIcon> */}
                        </View> ||
                        (clientInfos && clientInfos.seekState != 'PENDING') &&
                        <View className='client_status_title_status' style={`color:${getColor(clientInfos.seekState)}`}>{getStatus(clientInfos.seekState)}</View>
                    }
                </View>
                <View className='client_status_item'>
                    <View className='client_status_item_label'>报名岗位</View>
                    <View className='client_status_item_con'>{clientInfos && clientInfos.recruitTitle ? clientInfos.recruitTitle : '暂无'}</View>
                </View>
                <View className='client_status_item'>
                    <View className='client_status_item_label'>面试日期</View>
                    <View className='client_status_item_con'>{clientInfos && clientInfos.interviewDate ? clientInfos.interviewDate : '暂无'}</View>
                </View>
            </View>

            <View className='client_track'>
                <View className='client_track_title'>客户轨迹</View>
                {
                    trackList.length === 1 &&
                    <View className='client_track_item'>
                        <View className='client_track_dot'></View>
                        <View className='client_track_item_label'>{trackList[0].date} {trackList[0].source}</View>
                        <View className='client_track_item_con'>{trackList[0].description}</View>
                    </View> ||
                    trackList.length > 1 && trackList.map((item, index) => {
                        return (
                            <View className='track_item' key={index}>
                                <View className='track_item_label'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon32.webp`}></Image>
                                    <View>{item.date} {item.source}</View>
                                </View>
                                <View className='track_item_con'>{item.description}</View>
                            </View>
                        )
                    })
                }
            </View>

            <View style={`height:200rpx;`}></View>

            <Block>
                {
                    // showbottomOptions &&
                    // <View className='footer_wrapper_options' style={`bottom:${bottomHeight}px;`}>
                    //     <OptionItem1></OptionItem1>
                    //     <OptionItem2></OptionItem2>
                    //     <OptionItem3></OptionItem3>
                    //     <OptionItem4></OptionItem4>
                    // </View>
                }
            </Block>

            <Block>
                {/* <View className='footer_options' style={`bottom:${bottomHeight}px;`}>
                    <View className='footer_options_item' onClick={() => setCurrentCliskstatus('未到面')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon42.webp`}></Image>
                            <View>未到面</View>
                        </View>
                        {
                            currentCliskstatus === '未到面' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => setCurrentCliskstatus('已到面')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                            <View style={{ color: '#1678FF' }}>已到面</View>
                        </View>
                        {
                            currentCliskstatus === '已到面' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={() => setCurrentCliskstatus('面试失败')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                            <View style={{ color: '#F00000' }}>面试失败</View>
                        </View>
                        {
                            currentCliskstatus === '面试失败' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => setCurrentCliskstatus('面试通过')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                            <View style={{ color: '#FF6B17' }}>面试通过</View>
                        </View>
                        {
                            currentCliskstatus === '面试通过' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={() => setCurrentCliskstatus('已离职')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon39.webp`}></Image>
                            <View>已离职</View>
                        </View>
                        {
                            currentCliskstatus === '已离职' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => setCurrentCliskstatus('已入职')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon36.webp`}></Image>
                            <View style={{ color: '#04B400' }}>已入职</View>
                        </View>
                        {
                            currentCliskstatus === '已入职' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                </View> */}
            </Block>

            <View className='bottom_wrapper'>
                <View className='bottom_wrapper_con'>
                    <View className='' style={`height:16rpx`}></View>
                    {
                        (clientInfos && (clientInfos.seekState === 'PENDING' || clientInfos.seekState === 'CONTACT')) &&
                        <View className='create_interview_pedding'>
                            <View className='inappropriate' onClick={unsuitableFunc}>不合适</View>
                            <View className='create_interview_btn' onClick={() => goInterview()}>安排面试</View>
                        </View> ||
                        (clientInfos && clientInfos.seekState === 'UNSUITABLE') &&
                        <View className='go_interview_btn' onClick={() => goInterview()}>安排面试</View> ||
                        <View className='edit_wrap'>
                            <View className='edit_wrap_btn' onClick={() => {
                                if(!myPermissions.includes('14')){
                                    return Taro.showToast({ title: '暂无权限', icon: 'none' });
                                }else{
                                    setShowbottomOptions(!showbottomOptions)
                                }
                            }}>修改状态</View>
                            <View className='count_wrap'>
                                <AtIcon onClick={() => setCurrentIndex('reduce')} value='chevron-left' size='20' color={`${current === 1 ? '#999999' : '#333333'}`}></AtIcon>
                                <View className='count'>{current}/{totalPerson}</View>
                                <AtIcon onClick={() => setCurrentIndex('add')} value='chevron-right' size='20' color={`${current === totalPerson ? '#999999' : '#333333'}`}></AtIcon>
                            </View>
                        </View>
                    }
                    <View style={`height:${bottomSafeAreaHeight}px`}></View>

                    <View className='options_x'>
                        {
                            clientInfos &&
                            <UpdateStatus
                                onClose={() => setShowbottomOptions(false)}
                                showPicker={showbottomOptions}
                                currentStatus={clientInfos.seekState}
                                bottomHeight={bottomHeight}
                                onChange={changeStatus}>
                            </UpdateStatus>
                        }
                    </View>
                </View>
            </View>

            <Block>
                {
                    showReason &&
                    <AtFloatLayout catchMove className='role_init_layout' isOpened={showReason} onClose={() => { setShowReason(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View></View>
                                    <View>反馈不合适原因</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowReason(false) }}></AtIcon>
                                </View>
                                <View className='input_wrapper'>
                                    <Textarea count={false}
                                        focus={true}
                                        className='float_input'
                                        auto-height
                                        confirmType='return'
                                        value={reason}
                                        onInput={(e) => setReason(e.detail.value)}
                                        adjustPosition={true} //键盘弹起时，是否自动上推页面 
                                        showConfirmBar={false}
                                        maxlength={50}
                                        autoHeight
                                        placeholder={`请描述具体原因...（必填）`}
                                        onKeyboardHeightChange={(e) => {
                                            let currHeight = e.detail.height;
                                            console.log('currHeight', currHeight)
                                            if (currHeight > 0) {
                                                setKeyBoardHeight(currHeight);
                                            }
                                        }}
                                    >
                                    </Textarea>
                                    <View className='input_number'><Text>{reason.length}</Text>/50</View>
                                </View>
                                <View style={`background:${reason.length > 0 ? '#0483FF' : '#CDE1FF'}`} className='post_btn' onClick={saveReasonFunc}>提交</View>
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
