/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-24 13:57:59
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Textarea, Input, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import JoinSupplier from '@/components/joinSupplier';
import ChoosePattern from '@/components/choosePattern';
import './index.scss'

import { } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
        userStore: { companyInfo }
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [isOpen, setIsOpen] = useState(false);
    const [patternList, setPatternList] = useState([
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 1 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 2 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 3 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 4 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 5 },
    ])

    const [showJoinModel, setShowJoinModel] = useState(false);
    const [showPatternModel, setShowPatternModel] = useState(false);

    const getJoinSupplier = (e) => {
        console.log("   申请加入供应商", e);
    }

    const getChoosePattern=(e)=>{
        console.log("   选择合作模式", e);
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='项目详情'></Navbar>

            <View className='project_info'>
                <View className='project_info_title'>
                    <View className='project_info_tag'>接单项目</View>
                    <View className='project_info_name'>龙泉驿区招物流分拣全职月结</View>
                </View>
                <View className='project_info_detail'>龙泉驿·普工·50人</View>
                <View className='project_info_compony'>
                    <View className='project_info_compony_avatar'></View>
                    <View className='project_info_compony_info'>
                        <View>成都市爱发单人力有限公司</View>
                        <View className='project_info_compony_info_time'>5月6日发布</View>
                    </View>
                </View>
            </View>

            <View className='project_desc'>
                <View className='project_desc_title'>
                    <View>招聘简章</View>
                    <View className='project_desc_title_right' onClick={() => {
                        setIsOpen(!isOpen);
                    }}>
                        <View>展开</View>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_${isOpen ? 9 : 8}.webp`}></Image>
                    </View>
                </View>
                <View className={`project_desc_content ${isOpen ? 'project_desc_content_open' : 'project_desc_content_close'}`}>自媒体上，杨同牛开始有点流量，但他被更多人知道是始于官媒报道。今年2月14日，《邵阳日报》以《徒步3000多公里！邵阳一对夫妻花200多天到达西藏……》为题，报道杨同牛携爱妻徒步去西藏旅游的报道，报道穿插着杨同牛塑料壳般“嘎蹦脆”的普通话</View>
            </View>

            <View className='project_pattern'>
                <View className='project_pattern_title'>合作模式</View>
                {
                    patternList.length > 0 && patternList.map((item, index) => {
                        return (
                            <View className='project_pattern_item' key={index}>
                                <View className='project_pattern_item_title'>模式{index + 1}:</View>
                                <View className='project_pattern_item_content'>{item.content}</View>
                            </View>
                        )
                    })
                }
            </View>

            <View className='project_pattern project_pattern_1'>
                <View className='project_pattern_title'>合作模式</View>
                <View className='project_pattern_rule'>多地警方通过政务平台发布“家庭摄像头使用风险提示”，建议居民谨慎安装家用监控设备。这一建议迅速引发热议——在智能安防普及率超67%的今天，曾被奉为“家庭守护神”的摄像头 </View>
            </View>

            <View style={`height:90px;`}></View>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='jion_btn' onClick={() => {
                    setShowPatternModel(true);
                }}>加入项目</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <JoinSupplier showPicker={showJoinModel} onClose={() => setShowJoinModel(false)} onchange={getJoinSupplier}></JoinSupplier>
            </Block>

            <Block>
                <ChoosePattern showPicker={showPatternModel} onClick={() => setShowPatternModel(false)} onchange={getChoosePattern}></ChoosePattern>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
