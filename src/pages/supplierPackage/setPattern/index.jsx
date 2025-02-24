/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-20 16:43:06
 * @Description: 设置合作模式
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Button, Text, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
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
    const [requestState, setRequestState] = useState(0);    // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [patternList, setPatternList] = useState([        // 合作模式列表
        { content: '' }
    ]);

    const [rules, setRules] = useState('');    

    const stick = (index) => {
        Taro.getClipboardData({
            success: function (res) {
                console.log('res')
                setPatternList(prev => {
                    prev[index].content = res.data;
                    return [...prev]
                })
            }
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#fff' title='合作模式'></Navbar>
            <View className='project_wrapper'>
                <View className='project_label'>项目名称</View>
                <View className='project_name'>
                    <View>龙泉驿区招物流分拣全职月结龙泉驿区招物流分拣全职月结</View>
                </View>
            </View>

            <View className='pattern_title'>
                <View>合作模式</View>
                <View className='pattern_title_right' onClick={() => {
                    setPatternList(prev => [...prev, { content: '' }])
                }}>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_6.webp`}></Image>
                    <View>增加模式</View>
                </View>
            </View>
            <View className='pattern_list'>
                {
                    patternList.map((item, index) => {
                        return (
                            <>
                                {
                                    patternList.length > 1 && index >= 1 &&
                                    <View className='top_hr'></View>
                                }
                                <View className='pattern_item' key={index}>

                                    <View className='pattern_item_title'>
                                        <View>模式{index + 1}:</View>
                                        <View className='pattern_item_title_right' onClick={() => stick(index)}>粘贴</View>
                                    </View>
                                    <Textarea count={false}
                                        className='pattern_item_input'
                                        confirmType='return'
                                        value={patternList[index].content}
                                        onInput={(e) => {
                                            setPatternList(prev => {
                                                prev[index].content = e.detail.value
                                                return [...prev]
                                            })
                                        }}
                                        adjustPosition={true} //键盘弹起时，是否自动上推页面 
                                        showConfirmBar={false}
                                        autoHeight
                                        placeholderStyle='color: #B6B6B6;'
                                        placeholder={`点击输入，例如：打卡7天300`}>

                                    </Textarea>
                                </View>
                            </>

                        )
                    })
                }
            </View>

            <View className='pattern_title'>
                <View>结算规则</View>
                <View className='pattern_title_right' onClick={()=>{
                    Taro.getClipboardData({
                        success: function (res) {
                            console.log('res')
                            setRules(res.data);
                        }
                    })
                }}>
                    <View>粘贴</View>
                </View>
            </View>
            <View className='pattern_rules'>
                <Textarea count={false}
                    className='pattern_rules_input'
                    confirmType='return'
                    value={rules}
                    onInput={(e) => {
                        setRules(e.detail.value)
                    }}
                    adjustPosition={true} //键盘弹起时，是否自动上推页面 
                    showConfirmBar={false}
                    autoHeight
                    placeholderStyle='color: #B6B6B6;'
                    placeholder={`点击输入结算规则，例如：开票信息、卡点、自离无费用等`}>

                </Textarea>
            </View>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn'>提交</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
