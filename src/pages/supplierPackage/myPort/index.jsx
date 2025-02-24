/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-02-24 14:02:01
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-24 15:00:21
 * @Description: 
 */


import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Button, Textarea, Block } from '@tarojs/components'
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
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [pageNo, setPageNo] = useState(1)
    const pageSize = 10;

    const [connect, setConnect] = useState(true);

    const [list, setList] = useState([
        { name: "成都西红人力", detail: '普工·全职·5月6日发布', model: '模式1:在职15天400，人多+V，卡点3天,在职三十天返现' },
        { name: "四川阿普企业管理咨询有限公司西安高陵新能源厂瑟福招操作工", detail: '普工·全职·5月6日发布', model: '模式1:在职15天400，人多+V，卡点3天,在职三十天返现' },
    ]);

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
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + bottomSafeAreaHeight}px - 392rpx)`;
    }

    return (
        <View className='container'>
            <Navbar whiteIcon fixed placeholder bgColor='transparent' title='我的合作端口' titleColor='#FFFFFF'></Navbar>

            <View className='my_port'>
                <View className='my_port_left_logo'></View>
                <View className='my_port_right'>
                    <View className='my_port_compone_name'>成都爱发单人力有限公司</View>
                    {
                        !connect &&
                        <View className='my_port_set'>
                            <View>暂未指定对接人员，点击设置</View>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_4.webp`}></Image>
                        </View> ||
                        <View className='my_port_connect'>
                            <View>合作对接：王老师 19180503641 </View>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_4.webp`}></Image>
                        </View>
                    }
                </View>
            </View>
            <View className='my_port_label'>
                <View>全部项目</View>
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
                                <View className='supplier_list_detail'>{item.detail}</View>
                                <View className='supplier_list_model'>
                                    <View className='supplier_list_model_tag'>合作模式</View>
                                    <View className='supplier_list_model_content'>{item.model}</View>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='page_btns'>
                    <View className='copy_btn'>复制链接</View>
                    <Button open-type='share' className='share_btn'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_7.webp`}></Image>
                        <View>分享到微信</View>
                    </Button>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
