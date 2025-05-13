/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-13 15:15:54
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-13 14:54:51
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
import NewUpdateStatus from '@/components/newUpdateStatus';
import './index.scss'

import { cluegetUserInfo, updateInterviewer, clueStateFlow, unsuitable } from '@/util/api'


const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight, keyBoardHeight, setKeyBoardHeight },
        userStore: { myPermissions, role },
    } = store

    const [uuid, setUuid] = useState('');
    const [trackList, setTrackList] = useState([]);    // 用户轨迹历史记录

    const [clientInfos, setClientInfos] = useState(null);
    const [reason, setReason] = useState('');
    const [showReason, setShowReason] = useState(false);
    const [currentPattren, setCurrentPattren] = useState('');
    const [showPatternModel, setShowPatternModel] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCooperationModel, setCurrentCooperationModel] = useState('');
    const [showEditStatus, setShowEditStatus] = useState(false);

    useEffect(() => {
        const { uid, phone } = route.params;
        console.log("route.params", route.params);
        getClientDetail(uid, phone);
        getHistoryList(uid);
        setUuid(uid);
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
            if (data.cooperationModel) {
                setCurrentCooperationModel(data.cooperationModel);
            }
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

    const changeStatus = (e, _reason, date) => {
        console.log("changeStatus", e, _reason, date);
        Taro.showLoading({ title: '提交中...' });
        let params = {
            uuid: clientInfos.uuid,
            seekState: e
        }
        if (date) {
            if (e === 'EMPLOYED') {       // 已入职
                params.employedDate = date;
            } else if (e === 'RESIGN') {   // 已离职
                params.resignDate = date;
            }
        }
        if (_reason) {
            params.failReason = _reason;
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
        if (myPermissions.includes('14')) {
            setShowReason(true);
        } else {
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
        if (!myPermissions.includes('14')) {
            return Taro.showToast({ title: '暂无权限', icon: 'none' });
        }
        Taro.navigateTo({
            url: `/pages/talentsPackage/interview/index?uuid=${clientInfos.uuid}&phone=${clientInfos.phone}`
        })
    }

    const getChoosePattern = async (value) => {   // 选择合作模式的回调
        console.log("选择的模式", value);
        let params = {
            uuid: clientInfos.uuid,
            cooperationModel: value
        }
        Taro.showLoading({ title: '提交中...' });
        updateInterviewer(params).then(res => {
            Taro.hideLoading();
            if (res.code === 200) {
                Taro.showToast({ title: '更新成功', icon: 'none' })
                setClientInfos({ ...clientInfos, cooperationModel: value });
                setShowPatternModel(false);
                setShowEditModal(false);
                setCurrentCooperationModel(value);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none' });
            }
        })
    }

    const newEditStatusFunc = (status, failReason, date) => {
        console.log("newEditStatusFunc", status, failReason, date);
        changeStatus(status, failReason, date);
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
                <View className='client_status_item'>
                    <View className='client_status_item_label' >合作模式</View>
                    {
                        clientInfos && !clientInfos.cooperationModel &&
                        <View className='client_status_item_con' onClick={() => {
                            if (!clientInfos.cooperationModels || clientInfos.cooperationModels.length === 0) {
                                return Taro.showToast({ title: '当前项目暂无合作模式', icon: 'none' });
                            }
                            setShowPatternModel(true);
                        }}>请选择合作模式</View> ||
                        <View className='edit_cooperationModel'>
                            <View className='edit_cooperationModel_wrap' onClick={() => {
                                setShowEditModal(true);
                            }}>
                                <Image src={`${Taro.$cdnUrl}/supplier/supplier_89.webp`}></Image>
                                <View>编辑</View>
                            </View>
                            <View className='edit_cooperationModel_text'>{clientInfos?.cooperationModel}</View>
                        </View>
                    }
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

            <View style='height:200rpx;'></View>

            <View className='bottom_wrapper'>
                <View className='bottom_wrapper_con'>
                    <View className='' style='height:16rpx'></View>
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
                                if (!myPermissions.includes('14')) {
                                    return Taro.showToast({ title: '暂无权限', icon: 'none' });
                                } else {
                                    setShowEditStatus(true);
                                }
                            }}>修改状态</View>
                        </View>
                    }
                    <View style={`height:${bottomSafeAreaHeight}px`}></View>

                    <View className='options_x'></View>
                </View>
            </View>

            {/* 新的修改状态 */}
            <Block>
                <NewUpdateStatus showPicker={showEditStatus} currentStatus={clientInfos?.seekState} onClose={() => { setShowEditStatus(false) }} onChange={newEditStatusFunc}></NewUpdateStatus>
            </Block>

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

            <Block>
                {
                    showEditModal &&
                    <AtFloatLayout catchMove className='pattern_init_layout' isOpened={showEditModal} onClose={() => { setShowEditModal(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View>合作模式</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowEditModal(false) }}></AtIcon>
                                </View>
                                <View className='input_wrapper'>
                                    <Textarea count={false}
                                        className='float_input'
                                        auto-height
                                        confirmType='return'
                                        value={currentCooperationModel}
                                        onInput={(e) => setCurrentCooperationModel(e.detail.value)}
                                        adjustPosition={true} //键盘弹起时，是否自动上推页面
                                        show-confirm-bar
                                        maxlength={100}
                                        autoHeight
                                        placeholder={`请输入合作模式`}>
                                    </Textarea>
                                </View>
                                <View className='post_btn' onClick={() => getChoosePattern(currentCooperationModel)}>保存</View>
                                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                            </View>
                        </View>
                    </AtFloatLayout>
                }
            </Block>

            <Block>
                {
                    clientInfos?.cooperationModels?.length > 0 &&
                    <Taro.ChoosePattern initItem={currentPattren} list={clientInfos.cooperationModels} showPicker={showPatternModel} onClose={() => setShowPatternModel(false)} onchange={getChoosePattern}></Taro.ChoosePattern>
                }
            </Block>
        </View>
    )
})

export default inject('store')(Index)
