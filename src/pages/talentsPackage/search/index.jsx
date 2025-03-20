/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-21 17:27:07
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { debounce } from '@/util/utils'
import './index.scss'

import TalentsItem from '@/components/items/talentsItem'
import ClueItem from '@/components/items/clueItem'

import {
    workbenchSearch, clueReceive
} from '@/util/api'


const Index = observer(({ store }) => {
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { statusTitleHeight, contenTitleHeight },
        businessStore: { sourceList },
        userStore: { role, userInfo: { userSerialCode } },
    } = store

    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [searchValue, setSearchValue] = useState('');
    const [list, setList] = useState([])
    const [clueList, setClueList] = useState([])
    const [jobList, setJobList] = useState([]);

    const getSourceName = (state) => {
        if (state) {
            const _list = sourceList.find(item => item.value === state);
            console.log("_list", _list, _list.name)
            return _list.name
        }
    }

    const getData = async (value) => {
        const { code, data: { cluePools, contracts, talentPools } } = await workbenchSearch({ searchInfo: value });
        console.log("搜索结果", code);
        setRequestState(1);
        if (code === 200) {
            setRequestState(2);
            setClueList(cluePools);
            setList(talentPools);
            setJobList(contracts);
        }
    }

    const onGetClient = async (obj, index) => {
        console.log("egetClueFunc", obj, index);
        Taro.showLoading({ title: '领取中...' });
        const { code, data, msg } = await clueReceive({ uuid: obj.uuid });
        Taro.hideLoading();
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
                console.log("_list", _list);
                return _list;
            })
            forceUpdate();
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 });
        }
    }

    const viewMore = (type) => {
        let _url = '';
        if (type === 1) {
            _url = `/pages/talentsPackage/talents/index?searchValue=${searchValue}`;
            return Taro.navigateTo({ url: _url })
        } else if (type === 2) {
            _url = `/pages/clue/index`;
            Taro.setStorageSync('clueSearchValue', searchValue);
        } else if (type === 3) {
            _url = `/pages/projectManage/index`;
            Taro.setStorageSync('projectSearchValue', searchValue);
        }
        Taro.switchTab({ url: _url })
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
                            focus={true}
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
                            <View className='search_section_title_right' onClick={() => viewMore(1)}>
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

            {
                role != 'ON_SITE' &&
                <View className='search_section'>
                    {
                        clueList.length > 0 &&
                        <View className='search_section_title'>
                            <View>线索池</View>
                            {
                                clueList.length >= 3 &&
                                <View className='search_section_title_right' onClick={() => viewMore(2)}>
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
                                    // return <ClueItem index={index} item={item} onGetClient={getClueFunc}></ClueItem>
                                    return (
                                        <View key={index} className='clue_item'>
                                            <View className='clue_item_wrap'>
                                                <View className='clue_item_wrap_left'>
                                                    <View className='clue_item_title'>
                                                        <View className='clue_item_title_left'>
                                                            <View className='clue_item_title_sort'>{index + 1}</View>
                                                            <View className='clue_item_title_name'>{item.name}</View>
                                                        </View>
                                                    </View>
                                                    <View className='clue_item_info'><Text>录入时间：</Text>{item.createTime}</View>
                                                    {
                                                        item.source && <View className='clue_item_info'><Text>来源：</Text>{getSourceName(item.source)}</View>
                                                    }
                                                    {
                                                        item.recruitTitle ? <View className='clue_item_info'><Text>报名岗位：</Text>{item.recruitTitle}</View> : ''
                                                    }
                                                </View>
                                                {
                                                    item.isGet &&
                                                    <View className='clue_item_wrap_right_done'>已领取</View> ||
                                                    <View className='clue_item_wrap_right' onClick={() => onGetClient(item, index)}>立即领取</View>
                                                }
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                    }

                </View>
            }

            <View className='search_section'>

                {
                    jobList.length > 0 &&
                    <View className='search_section_title'>
                        <View>招聘项目</View>
                        {
                            jobList.length >= 3 &&
                            <View className='search_section_title_right' onClick={() => viewMore(3)}>
                                <View>查看更多</View>
                                <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                            </View>
                        }
                    </View>
                }
                <View className='jobs_wrapper'>
                    {
                        jobList.length > 0 && jobList.map((item, index) => {
                            return <View onClick={() => {
                                Taro.navigateTo({
                                    url: `/pages/projectPackage/projectDetail/index?contractsSerialCode=${item.serialCode}&numberRecruits=${item.numberRecruits}&numberOnJob=${item.numberOnJob}&leaveRate=${item.leaveRate}&supplierCount=${item.supplierCount}`
                                })
                            }} index={index} className='jobs_item row-show-1'>{item.title}</View>
                        })
                    }
                </View>
            </View>

            {
                requestState === 2 && list.length === 0 && clueList.length === 0 && jobList.length === 0 &&
                <Taro.NoData></Taro.NoData>
            }
        </View>
    )
})

export default inject('store')(Index)
