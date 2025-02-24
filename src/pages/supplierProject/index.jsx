/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-02-24 14:02:01
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-24 15:34:37
 * @Description: 
 */


import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Text, Button, Textarea, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import TabBar from '@/components/tabBar';

import Navbar from '@/components/navbar';
import './index.scss'

import { } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight, tabbarHeight },
        businessStore: { setEditProjectInfo, onSiteInfo, setOnSiteInfo },
        userStore: { companyInfo }
    } = store

    const [isRefresh, setIsRefresh] = useState(false);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [connect, setConnect] = useState(true);

    const [list, setList] = useState([
        { name: "成都西红人力", isJoin: true, detail: '普工·全职·5月6日发布', model: '模式1:在职15天400，人多+V，卡点3天,在职三十天返现' },
        { name: "四川阿普企业管理咨询有限公司西安高陵新能源厂瑟福招操作工", isJoin: false, detail: '普工·全职·5月6日发布', model: '模式1:在职15天400，人多+V，卡点3天,在职三十天返现' },
    ]);

    const [type, setType] = useState(0);

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (goonLoad) {
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
    }, 200);

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + tabbarHeight}px - 274rpx)`;
    }

    return (
        <View className='container'>
            <Navbar back={false} fixed placeholder bgColor='transparent' title='我的合作端口' titleColor='#FFFFFF'></Navbar>

            <View className='my_port'>
                <View className='my_port_left_logo'></View>
                <View className='my_port_right'>
                    <View className='my_port_compone_name'>成都爱发单人力有限公司</View>
                    <View className='my_port_connect'>
                        <View>合作对接：王老师 <Text>19180503641</Text> </View>
                    </View>
                </View>
            </View>
            <View className='my_port_label'>
                <View onClick={() => setType(0)} className={`${type === 0 ? 'my_port_active' : ''}`}>全部项目</View>
                <View onClick={() => setType(1)} className={`${type === 1 ? 'my_port_active' : ''}`}>合作中</View>
                <View onClick={() => setType(2)} className={`${type === 2 ? 'my_port_active' : ''}`}>未合作</View>
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
                            <View className='supplier_list' key={index}>
                                <View className='supplier_list_name'>
                                    {item.name}
                                </View>

                                <View className='supplier_list_detail'>
                                    <View>{item.detail}</View>
                                    {
                                        item.isJoin &&
                                        <View className='joined'></View> ||
                                        <View className='join_project_btn'>加入项目</View>
                                    }

                                </View>
                                <View className='supplier_list_model'>
                                    <View className='supplier_list_model_tag'>合作模式</View>
                                    <View className='supplier_list_model_content'>{item.model}</View>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView>


            <TabBar actCurrent={0} />
        </View>
    )
})

export default inject('store')(Index)
