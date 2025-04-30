/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 14:51:53
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-30 09:43:15
 * @Description: 人才库列表结果的item,需要传入 index，item
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';

const TalentsItem = observer(({ store, index, item }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store

    return (
        <>
            <View className='talents_item' key={index} onClick={() => Taro.navigateTo({ url: `/pages/talentsPackage/signUpHistory/index?uuid=${item.uuid}&phone=${item.phone}&idCardNo=${item.idCardNo?item.idCardNo:''}` })}>
                <View className='talents_item_title'>
                    <View className='talents_item_title_left'>
                        <View className='talents_item_title_name'>{item.name}</View>
                        <View className='talents_item_title_detail'>{item.age ? item.age + '岁·' : ''}{item.sex === 0 ? '男' : item.sex === 1 ? '女' : '未知'}</View>
                    </View>
                    <View className='talents_item_title_right' onClick={(e) => {
                        e.stopPropagation();
                        Taro.makePhoneCall({ phoneNumber: item.phone })
                    }}>
                        {
                            item.phone && <Image src={`${Taro.$cdnUrl}/index/mine_icon7.webp`}></Image>
                        }
                        <View>{item.phone}</View>
                    </View>
                </View>
                {
                    // item.labels.length > 0 &&
                    // <View className='talents_item_labels'>
                    //     {
                    //         item.labels.map((label, idx) => {
                    //             return (
                    //                 <View key={idx} className='talents_item_label'>
                    //                     {label}
                    //                 </View>
                    //             )
                    //         })
                    //     }
                    // </View>
                }
                <View className='talents_item_jobIntention row-show-1'>求职意向：
                    {
                        item.jobNames && item.jobNames.length > 0 &&
                        item.jobNames.map((jobName, idx) => {
                            return (
                                <Text key={idx}>{jobName}{idx === item.jobNames.length - 1 ? '' : '、'}</Text>
                            )
                        })
                    }
                    {
                        !item.jobNames && <Text>暂无</Text>
                    }
                </View>
                {/* <View className='talents_item_line'></View>
                <View className='talents_item_bottom'>
                    <View>求职历史</View>
                    <View>安排面试</View>
                </View> */}
            </View>
        </>
    );
});

export default inject('store')(React.memo(TalentsItem, (prevProps, nextProps) => {
    return prevProps.item === nextProps.item && prevProps.store === nextProps.store;
}));
