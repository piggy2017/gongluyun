/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-18 11:16:06
 * @Description: 设置合作模式
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Button, Text, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';

import Navbar from '@/components/navbar';
import './index.scss'

import { setUpCoopModelByCompany } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { projectPatternInfo },
        userStore: { companyInfo }
    } = store

    const [patternList, setPatternList] = useState([        // 合作模式列表
        { content: '' }
    ]);

    const [rules, setRules] = useState('');

    useEffect(() => {
        console.log("projectPatternInfo", projectPatternInfo);
        if (projectPatternInfo.cooperationModels.length > 0) {
            let _list = projectPatternInfo.cooperationModels.map(item => {
                return { content: item };
            })
            setPatternList(_list);
        }
        setRules(projectPatternInfo.settlementStandard);
    }, [projectPatternInfo]);

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

    const postPattern = async () => {
        const { contractsSerialCode } = projectPatternInfo;
        // let _isWrite = patternList.some(item => item.content === '');
        // if (!rules || _isWrite) {
        //     Taro.showToast({ title: '请填写完整', icon: 'none' })
        //     return;
        // }
        Taro.showLoading({
            title: '保存中',
            mask: true
        })
        const { code, data, msg } = await setUpCoopModelByCompany({
            contractsSerialCode,
            settlementStandard: rules,
            cooperationModels: patternList.filter(item => item.content).map(item => item.content)
        })
        console.log('code', code, data, msg)
        Taro.hideLoading()
        if (code === 200) {
            Taro.showToast({ title: '保存成功', icon: 'none' });
            setTimeout(() => {
                Taro.navigateBack({
                    delta: 1
                });
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' })
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#fff' title='合作模式'></Navbar>
            <View className='project_wrapper'>
                <View className='project_label'>项目名称</View>
                <View className='project_name'>
                    <View>{projectPatternInfo.title}</View>
                </View>
            </View>

            <View className='pattern_title'>
                <View>合作模式</View>
                <View className='pattern_title_right' onClick={() => {
                    const _write = patternList.every(item => item.content.length > 0);
                    if (!_write) {
                        return Taro.showToast({
                            title: '请填写完整后再新增模式',
                            icon: 'none'
                        })
                    }
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
                <View className='pattern_title_right' onClick={() => {
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

            <View style={`height:200rpx;`}></View>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn' onClick={postPattern}>提交</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
