
import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Textarea, Block } from '@tarojs/components'
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

    const [list, setList] = useState([]);

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
        return `calc(100vh - ${statusTitleHeight + bottomSafeAreaHeight}px - 414rpx)`;
    }

    return (
        <View className='container'>
            <View>
                <View style={`height:${statusTitleHeight}px`}></View>
                <View className='page_logos'>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_15.webp`}></Image>
                    <View>人力资源供应链智能帮手</View>
                </View>
            </View>


            <View className='my_port'>
                <View className='my_port_left_logo'></View>
                <View className='my_port_left_text'>成都爱发单人力有限公司</View>
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
                                    <View>{item.name}</View>
                                    {
                                        item.isAuth ? <View className='supplier_list_name_auth'>已认证</View> : ''
                                    }
                                </View>
                                <View className='supplier_list_nums'>
                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.num1}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>合作项目</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.num2}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已入职</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.num3}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已离职</View>
                                    </View>

                                    <View className='supplier_list_nums_item'>
                                        <View className='supplier_list_nums_item_top'>
                                            <View className='supplier_list_nums_item_top_l'>{item.num4}</View>
                                            <View className='supplier_list_nums_item_top_r'>个</View>
                                        </View>
                                        <View className='supplier_list_nums_item_bottom'>已结费</View>
                                    </View>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView>

            <View className='page_bottom'>
                <View style={`height:18rpx;`}></View>
                <View className='page_bottom_content'>
                    <View className='page_bottom_content_l'>
                        <View className='page_bottom_content_l_avatar'></View>
                        <View >
                            <View className='page_bottom_content_l_name'>徐老师</View>
                            <View className='page_bottom_content_l_label'>经纪人</View>
                        </View>
                    </View>
                    <View className='page_bottom_content_r'>
                        <View className='page_bottom_btn page_bottom_btn_call'>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_16.webp`}></Image>
                            <View>电话咨询</View>
                        </View>
                        <View className='page_bottom_btn page_bottom_btn_signup'>
                            <View>立即报名</View>
                        </View>
                    </View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
