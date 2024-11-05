/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-05 15:43:09
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
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
    workbenchSearch, clueReceive
} from '@/util/api'


const Index = observer(({ store }) => {
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, companyVerified }
    } = store

    const [searchValue, setSearchValue] = useState('');
    const [list, setList] = useState([])

    const [clueList, setClueList] = useState([])

    const [jobList, setJobList] = useState([
        '龙泉驿区招物流分拣全职月结普工',
        '龙泉驿区招物流分拣全职月结普工',
        '龙泉驿区招物流分拣全职月结普工'
    ])

    const getData = async (value) => {
        const { code, data: { cluePools, contracts, talentPools } } = await workbenchSearch({ searchInfo: value });
        console.log("搜索结果", code);
        if (code === 200) {
            setClueList(cluePools);
            setList(talentPools);
            setJobList(contracts);
        }
    }

    const getClueFunc = async (obj, index) => {
        console.log("egetClueFunc", obj, index);
        Taro.showLoading({ title: '领取中...' });
        const { code, data, msg } = await clueReceive({ uuid: obj.uuid });
        console.log("getClient", code, data);
        if (code === 200) {
            Taro.showToast({ title: '领取成功', icon: 'none', duration: 2000 });
            setClueList(clueList => {
                let _list = clueList.map((item, i) => {
                    if (i === index) {
                        item.isGet = true;
                    }
                    return item
                })
                return _list
            })
            forceUpdate();
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 });
        }
        Taro.hideLoading();
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

                {
                    list.length > 0 &&
                    <View className='search_section_title'>
                        <View>人才库</View>
                        {
                            list.length >= 3 &&
                            <View className='search_section_title_right'>
                                <View>查看更多</View>
                                <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                            </View>
                        }

                    </View>
                }
                <>
                    {
                        list.length > 0 && list.map((item, index) => {
                            return <TalentsItem index={index} item={item}></TalentsItem>
                        })
                    }
                </>
            </View>

            <View className='search_section'>

                {
                    clueList.length > 0 &&
                    <View className='search_section_title'>
                        <View>线索池</View>
                        {
                            clueList.length >= 3 &&
                            <View className='search_section_title_right'>
                                <View>查看更多</View>
                                <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                            </View>
                        }
                    </View>
                }
                {
                    clueList.length > 0 &&
                    <View className='clue_wrapper'>
                        {
                            clueList.length > 0 && clueList.map((item, index) => {
                                return <ClueItem index={index} item={item} onGetClient={getClueFunc}></ClueItem>
                            })
                        }
                    </View>
                }

            </View>

            <View className='search_section'>

                {
                    jobList.length > 0 &&
                    <View className='search_section_title'>
                        <View>招聘项目</View>
                        {
                            jobList.length >= 3 &&
                            <View className='search_section_title_right'>
                                <View>查看更多</View>
                                <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                            </View>
                        }
                    </View>
                }
                <View className='jobs_wrapper'>
                    {
                        jobList.length > 0 && jobList.map((item, index) => {
                            return <View onClick={()=>{
                                Taro.navigateTo({
                                    url:`/pages/projectPackage/projectDetail/index?contractsSerialCode=${item.serialCode}&numberRecruits=${item.numberRecruits}&numberOnJob=${item.numberOnJob}&leaveRate=${item.leaveRate}&supplierCount=${item.supplierCount}`
                                })
                            }} index={index} className='jobs_item row-show-1'>{item.title}</View>
                        })
                    }
                </View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
