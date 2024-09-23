/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 16:43:35
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-23 11:57:03
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import WorkerInfo from '@/components/workerInfo';
import DatePicker from '@/components/datePicker'
import UpdateStatus from '@/components/updateStatus';
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store

    const [formData, setFormData] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateText, setDateText] = useState("选择面试日期");
    const [bottomHeight, setBottomHeight] = useState(90);

    const [trackList, setTrackList] = useState([
        { label: "8月4日 16:30 内部客服-小李", content: "上报线索" },
        { label: "8月5日 16:30 内部客服-小李", content: "为求职者安排了8月7日的面试" },
        { label: "8月9日 16:30 内部客服-小李", content: "为求职者安排了8月7日的面试" },
        { label: "8月11日 16:30 内部客服-小李", content: "为求职者安排了8月7日的面试" }
    ]);

    const [totalPerson, setTotalPerson] = useState(88);
    const [current, setCurrent] = useState(1);
    const [showbottomOptions, setShowbottomOptions] = useState(false);   // 是否显示地步的操作选项
    const [currentCliskstatus, setCurrentCliskstatus] = useState('面试失败');


    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.bottom_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
            }
        }, 0);
    }, [])

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
        if (type === "add") {
            if (current === totalPerson) return;
            setCurrent(current => current + 1);
        } else {
            if (current === 1) return;
            setCurrent(current => current - 1);
        }
    }

    const changeStatus = (e) => {
        console.log("changeStatus", e);
        setCurrentCliskstatus(e);
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='rgba(237,243,254)' title='客户详情'></Navbar>
            <WorkerInfo></WorkerInfo>

            <View className='client_status'>
                <View className='client_status_title'>
                    <View>当前状态</View>
                    <View className='client_status_title_status'>已约面</View>
                </View>
                <View className='client_status_item'>
                    <View className='client_status_item_label'>报名岗位</View>
                    <View className='client_status_item_con'>龙泉驿区招物流分拣招物流分拣全职月结</View>
                </View>
                <View className='client_status_item'>
                    <View className='client_status_item_label'>面试日期</View>
                    <View className='client_status_item_con'>2024年8月5日下午7:30</View>
                </View>
            </View>

            <View className='client_track'>
                <View className='client_track_title'>客户轨迹</View>
                {
                    trackList.length === 1 &&
                    <View className='client_track_item'>
                        <View className='client_track_dot'></View>
                        <View className='client_track_item_label'>{trackList[0].label}</View>
                        <View className='client_track_item_con'>{trackList[0].content}</View>
                    </View> ||
                    trackList.length > 1 && trackList.map((item, index) => {
                        return (
                            <View className='track_item' key={index}>
                                <View className='track_item_label'>
                                    <Image src={`${Taro.$cdnUrl}/index/index_icon32.webp`}></Image>
                                    <View>{item.label}</View>
                                </View>
                                <View className='track_item_con'>{item.content}</View>
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
                <UpdateStatus
                    onClose={() => setShowbottomOptions(false)}
                    showPicker={showbottomOptions}
                    currentStatus={currentCliskstatus}
                    bottomHeight={bottomHeight}
                    onChange={changeStatus}>

                </UpdateStatus>
            </Block>

            <View className='bottom_wrapper'>
                <View style={`height:16rpx`}></View>
                <View className='edit_wrap'>
                    <View className='edit_wrap_btn' onClick={() => setShowbottomOptions(!showbottomOptions)}>修改状态</View>
                    <View className='count_wrap'>
                        <AtIcon onClick={() => setCurrentIndex('reduce')} value='chevron-left' size='20' color={`${current === 1 ? '#999999' : '#333333'}`}></AtIcon>
                        <View className='count'>{current}/{totalPerson}</View>
                        <AtIcon onClick={() => setCurrentIndex('add')} value='chevron-right' size='20' color={`${current === totalPerson ? '#999999' : '#333333'}`}></AtIcon>
                    </View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
