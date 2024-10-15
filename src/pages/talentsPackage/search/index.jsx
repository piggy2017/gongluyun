/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-14 16:28:38
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
import './index.scss'

import TalentsItem from '@/components/items/talentsItem'
import ClueItem from '@/components/items/clueItem'

import {
    workbenchSearch
} from '@/util/api'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, authentication }
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [list, setList] = useState([
        { id: 1, userName: "高小光", detail: "45岁·男·汉族", phone: "177****0923", labels: ['有电工证', '接受倒班', '15年工作经验', '高中文凭'], jobIntention: "普工、快递、小工、物流分拣、保洁、家政、修车工" },
        { id: 2, userName: "张三", detail: "45岁·男·汉族", phone: "177****0923", labels: ['有电工证', '接受倒班', '15年工作经验', '高中文凭'], jobIntention: "普工、物流分拣、保洁、家政、修车工、物流分拣、保洁、家政、修车工" },
        { id: 3, userName: "里斯", detail: "45岁·男·汉族", phone: "177****0923", labels: ['有电工证', '接受倒班', '能上夜班', '15年工作经验', '高中文凭'], jobIntention: "普工、物流分拣、保洁、家政、修车工" },
    ])

    const [clueList, setClueList] = useState([
        { id: 1, userName: "客户0974", time: "今天", source: "小红书" },
        { id: 2, userName: "客户0974", time: "今天", source: "微信岗位链接报名-小李", signUpJob: "成都龙泉驿京西仓库分拣" },
        { id: 3, userName: "客户0974", time: "今天", source: "小红书" },
    ])

    const [jobList, setJobList] = useState([
        '龙泉驿区招物流分拣全职月结普工',
        '龙泉驿区招物流分拣全职月结普工',
        '龙泉驿区招物流分拣全职月结普工'
    ])

    const getData = async (value) => {
        const { code, data } = await workbenchSearch({ searchInfo: value });
        console.log("搜索结果", code, data);
    }

    return (
        <View className='container'>
            <View className='my_header'>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <Image className='back_icon' src={`${Taro.$cdnBackIcon}`} onClick={() => { Taro.navigateBack({ delta: 1 }) }}></Image>
                    <View className='search_wrap'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                        <Input className='search_input'
                            placeholder='输入关键词搜索项目、求职者'
                            confirmType='search'
                            placeholderStyle='color: #777777;'
                            onInput={(e) => { setSearchValue(e.detail.value) }}
                            onConfirm={(e) => {
                                getData(e.detail.value);
                            }}
                            value={searchValue}></Input>
                    </View>
                </View>
            </View>
            <View style={`height:${statusTitleHeight + contenTitleHeight}px`}></View>

            <View className='search_section'>
                <View className='search_section_title'>
                    <View>人才库</View>
                    <View className='search_section_title_right'>
                        <View>查看更多</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <>
                    {
                        list.length > 0 && list.map((item, index) => {
                            return <TalentsItem index={index} item={item}></TalentsItem>
                        })
                    }
                </>
            </View>

            <View className='search_section'>
                <View className='search_section_title'>
                    <View>线索池</View>
                    <View className='search_section_title_right'>
                        <View>查看更多</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='clue_wrapper'>
                    {
                        clueList.length > 0 && clueList.map((item, index) => {
                            return <ClueItem index={index} item={item}></ClueItem>
                        })
                    }
                </View>
            </View>

            <View className='search_section'>
                <View className='search_section_title'>
                    <View>招聘项目</View>
                    <View className='search_section_title_right'>
                        <View>查看更多</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='jobs_wrapper'>
                    {
                        jobList.length > 0 && jobList.map((item, index) => {
                            return <View index={index} className='jobs_item row-show-1'>{item}</View>
                        })
                    }
                </View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
