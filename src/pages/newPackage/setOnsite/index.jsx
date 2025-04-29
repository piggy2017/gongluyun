/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-29 10:39:09
 * @Description:
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, throttle } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'

import { companyMemberList, updateContracts } from '@/util/api'

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        userStore: { companyInfo },
        businessStore: { setOnSiteListForProject, setSetOnSiteListForProject },
    } = store
    const [formData, setFormData] = useState({});

    const [showRoleModel, setShowRoleModel] = useState(false);
    const [roleList, setRoleList] = useState(['客服', '驻场', '销售']);

    const [showLimitModel, setShowLimitModel] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 20;
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败

    const [list, setList] = useState([]);
    const [chooseList, setChooseList] = useState([]);
    const [searchHeight, setSearchHeight] = useState(43);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (setOnSiteListForProject.length > 0) {
            setChooseList(setOnSiteListForProject);
        }
    }, [setOnSiteListForProject])

    useEffect(() => {
        getList(1);
        setTimeout(async () => {
            const _query = await selectorQueryDomInfo('.search_wrapper');
            if (_query?.height) {
                console.log("_query_query_query", _query.height);
                setSearchHeight(_query.height)
            }
        }, 0);
        return () => {
            console.log("触发 选择驻唱 页面的卸载");
            setSetOnSiteListForProject([]);
        }
    }, []);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + bottomSafeAreaHeight + searchHeight}px - 160rpx)`;
    }
    const setOnSite = (obj, index) => {
        obj.interviewContactInfo = obj.userSerialCode;
        setList(list => {
            list[index].selected = !list[index].selected;
            return [...list];
        })
        setChooseList(chooseList => {
            if (chooseList.length > 0) {
                let index = chooseList.findIndex(item => item.interviewContactInfo === obj.userSerialCode);
                if (index > -1) {
                    chooseList.splice(index, 1);
                } else {
                    chooseList.push(obj);
                }
            } else {
                chooseList.push(obj);
            }
            return [...chooseList];
        })
    }

    const getList = async (_pageNo) => {
        let params = {
            pageNo: _pageNo,
            pageSize,
            companySerialCode: companyInfo.companySerialCode,
            status: 0,
            roleId: '3'
        }
        setRequestState(1);
        Taro.showLoading({ title: '加载中...' });
        const { code, data } = await companyMemberList(params);
        console.log("code", code, "data", data);
        Taro.hideLoading();
        setIsRefresh(false);
        if (code === 200 && data.responses?.length > 0) {
            let _list = chooseList.length > 0 ? chooseList : setOnSiteListForProject.length > 0 ? setOnSiteListForProject : [];
            console.log("chooseList_list", _list);
            if (_list.length > 0) {
                for (let i = 0; i < data.responses.length; i++) {
                    for (let j = 0; j < _list.length; j++) {
                        if (data.responses[i].userSerialCode === _list[j].interviewContactInfo) {
                            data.responses[i].selected = true;
                        }
                    }
                }
            }
            setList(_pageNo === 1 ? data.responses : [...list, ...data.responses]);
            setgoonLoad(true);
            setPageNo(data.pageNo);
            setRequestState(2);
        } else {
            setgoonLoad(false);
            setRequestState(3);
            if (_pageNo === 1) {
                setList([]);
            }
        }
    }

    const handleScrollToLower = debounce(() => {    // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (goonLoad) {
            getList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {    // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
        getList(1);
    }, 200);

    const handleConfirm = async () => {
        if (chooseList.length === 0) {
            Taro.showToast({ title: '请选择驻场人员', icon: 'none', });
            return;
        }
        const { recruitSerialCode, serialCode } = route.params;
        let _contactList = chooseList.map(item => {
            let obj = {
                interviewContactName: item.interviewContactName ? item.interviewContactName : item.name,
                interviewContactPhone: item.interviewContactPhone ? item.interviewContactPhone : item.phone,
                interviewContactInfo: item.interviewContactInfo ? item.interviewContactInfo : item.userSerialCode,
            };
            return obj
        })
        console.log("_contactList", _contactList);
        let params = {
            recruitSerialCode,
            serialCode,
            interviewInfos: _contactList
            // interviewContactInfo: obj.userSerialCode,
            // interviewContactName: obj.name,
            // interviewContactPhone: obj.phone
        }
        updateContracts(params).then(res => {
            if (res.code === 200) {
                Taro.showToast({ title: '设置成功', icon: 'none', });
                setTimeout(() => {
                    Taro.navigateBack({
                        delta: 1
                    });
                }, 1500);
            } else {
                Taro.showToast({ title: res.msg, icon: 'none', });
            }
        })
    }

    const searchFunc = throttle(() => {
        setgoonLoad(true);
        getList(1);
    }, 200)

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='设置驻场'></Navbar>

            {/* <View className='tab_wrapper'>
                <View className='tab_item' onClick={() => { setShowRoleModel(true) }}>
                    <View>全部状态</View>
                    <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                </View>
                <View className='tab_item' onClick={() => { setShowLimitModel(true) }}>
                    <View>全部角色</View>
                    <AtIcon value='chevron-down' size='14' color='#000000'></AtIcon>
                </View>
            </View> */}
            <View className='search_wrapper'>
                <View style={`height: 18rpx;`}></View>
                <View className='search_content'>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                    <Input className='search_input'
                        placeholder='输入关键词搜索'
                        confirmType='search'
                        placeholderStyle='color: #777777;'
                        onInput={(e) => { setSearchValue(e.detail.value) }}
                        onConfirm={() => searchFunc()}
                        value={searchValue}></Input>
                </View>
            </View>

            <ScrollView
                scrollY
                className='list_wrapper'
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
                            <View className='list_item' key={index} onClick={() => setOnSite(item, index)}>
                                <View className='list_item_left'>
                                    <Image src={item.avatar} className='avatar'></Image>
                                    <View className='item_infos'>
                                        <View className='item_name'>
                                            <View>{item.name}</View>
                                            <View className='item_role'>驻场</View>
                                        </View>
                                        <View className='item_phone'>{item.phone}</View>
                                    </View>
                                </View>
                                <Image className='list_item_right' src={`${Taro.$cdnUrl}/index/index_icon2${item.selected ? 7 : 8}.webp`}></Image>
                            </View>
                        )
                    })
                }
                {
                    list.length >= 9 &&
                    <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                }
                {
                    list.length === 0 && requestState === 3 &&
                    <Taro.NoData></Taro.NoData>
                }
            </ScrollView>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className={`post_btn ${chooseList.length > 0 ? 'post_btn_active' : ''}`} onClick={handleConfirm}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>


            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showRoleModel} onClose={() => { setShowRoleModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>选择角色</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowRoleModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    roleList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item === formData.role ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => setFormData({ ...formData, role: item })}
                                            >{item}</View>
                                        )
                                    })
                                }
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>

            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showLimitModel} onClose={() => { setShowLimitModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>选择角色</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowLimitModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    roleList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item === formData.role ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => setFormData({ ...formData, role: item })}
                                            >{item}</View>
                                        )
                                    })
                                }
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>
        </View >
    )
})

export default inject('store')(Index)
