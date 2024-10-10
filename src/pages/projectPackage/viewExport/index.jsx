/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-10 16:18:39
 * @Description: 
 */
/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:48:48
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 10:53:33
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss'

import Navbar from '@/components/navbar';

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, authentication }
    } = store
    const [infoHeight, setInfoHeight] = useState(94);

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [title, setTitle] = useState('龙泉驿区招物流分拣全职月结');

    const [list, setList] = useState([
        { id: 1, userName: "高小光", status: 1, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 2, userName: "高小光", status: 2, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 3, userName: "高小光", status: 3, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 4, userName: "高小光", status: 4, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 5, userName: "高小光", status: 5, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
        { id: 6, userName: "高小光", status: 6, isChoosed: false, showOptions: false, phone: '177 6548 0923', detail: "45岁·男", source: "供应商-成都西红人力资源", interviewTime: "7月25日" },
    ])

    useEffect(() => {
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.export_infos');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setInfoHeight(_query.height)
            }
        }, 0);
    }, [])

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + infoHeight}px)`;
    }

    const getStatus = (status) => {
        switch (status) {
            case 1:
                return '已约面';
            case 2:
                return '已到面';
            case 3:
                return '面试通过';
            case 4:
                return '面试失败';
            case 5:
                return '已入职';
            case 6:
                return '已离职';
        }
    }

    const getColor = (status) => {
        switch (status) {
            case 1:
                return '#08B5FF';
            case 2:
                return '#1678FF';
            case 3:
                return '#FF7C32';
            case 4:
                return '#F00000';
            case 5:
                return '#04B400';
            case 6:
                return '#666666';
        }
    }
    const callUser = (e, obj) => {
        e.stopPropagation();
        Taro.makePhoneCall({
            phoneNumber: obj.phone
        })
    }

    return (
        <View className='container'>
            <Navbar fixed back={false} placeholder bgColor='transparent' title='名单反馈'></Navbar>

            <View className='export_infos'>
                <View className='export_infos_name'>岗位：龙泉驿区招物流分拣全职月结</View>
                <View className='export_infos_name'>供应商-成都西红人力资源</View>
                <View className='export_infos_time'>时间：7.6日-7.7日</View>
            </View>

            <ScrollView
                scrollY
                className='scrollWrapper'
                style={{ height: getHeight() }}
                scrollWithAnimation
                showScrollbar={false}
                enablePassive
                refresherEnabled
                refresherTriggered={isRefresh}
                onScrollToLower={handleScrollToLower}
                onRefresherRefresh={handleScrollToUpper}
                lowerThreshold={300}
            >
                {
                    list.length > 0 && list.map((item, index) => {
                        return (
                            <View className='roster_item' key={index} style={`padding:30rpx 40rpx 30rpx 68rpx;`}>
                                <View className='roster_item_title'>
                                    <View className='item_title_index'>{index + 1}</View>
                                    <View className='item_title_left'>
                                        <View className='item_title_name'>{item.userName}</View>
                                        <Image src={`${Taro.$cdnUrl}/index/index_icon29.webp`}></Image>
                                        <View className='item_title_phone' onClick={(e) => callUser(e, item)}>{item.phone}</View>
                                    </View>
                                </View>
                                <View className='roster_item_detail'>
                                    <View className='roster_item_detail_content'>{item.detail}</View>
                                    <View className='roster_item_detail_status' style={{ color: getColor(item.status) }}>
                                        <View>{getStatus(item.status)}</View>
                                        <AtIcon value='chevron-down' size='14' color={getColor(item.status)}></AtIcon>
                                    </View>
                                </View>
                                <View className='roster_item_time'>面试时间：{item.interviewTime}</View>
                            </View>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
})

export default inject('store')(Index)
