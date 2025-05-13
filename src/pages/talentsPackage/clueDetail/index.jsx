/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-13 15:15:54
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-13 18:06:09
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, getStatus, getColor } from '@/util/utils'
import Navbar from '@/components/navbar';
import WorkerInfo from '@/components/workerInfo';
import './index.scss'

import { cluegetUserInfo, clueReceive, clueStateFlow } from '@/util/api'


const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { myClientParams }
    } = store
    const [uuid, setUuid] = useState('');

    const [trackList, setTrackList] = useState([]);
    const [clientInfos, setClientInfos] = useState(null);

    useDidShow(() => {
        if (clientInfos && clientInfos.uuid) {
            getClientDetail(clientInfos.uuid, clientInfos.phone);
        }
    })

    useEffect(() => {
        const { uid, phone } = route.params;
        console.log("route.params", route.params);
        getClientDetail(uid, phone);
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
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const getClient = async () => {   // 领取客户
        Taro.showLoading({ title: '领取中...' });
        const { uid } = route.params;
        const { code, data, msg } = await clueReceive({ uuid: uid });
        console.log("getClient", code, data);
        Taro.hideLoading();
        if (code === 200) {
            Taro.showToast({ title: '领取成功', icon: 'none', duration: 2000 });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 });
            }, 1500)
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 });
            if (code === 8071) {   // 求职者已经被别人领取
                setTimeout(() => {
                    Taro.navigateBack({ delta: 1 });
                }, 1500)
            }
        }
    }

    
    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='客户详情'></Navbar>
            <WorkerInfo info={clientInfos} type={3} interview={true}></WorkerInfo>

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

            <View className='bottom_wrapper'>
                <View className='bottom_wrapper_con'>
                    <View className='' style={`height:16rpx`}></View>
                    <View className='get_btn' onClick={() => getClient()}>立即领取</View>
                    <View style={`height:${bottomSafeAreaHeight}px`}></View>
                </View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
