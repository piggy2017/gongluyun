/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 11:15:20
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-11 13:42:15
 * @Description: 线索列表item
 */

import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';

const ClueItem = observer(({ store, index, item }) => {
    const {
        baseStore: { },
    } = store

    return (
        <>
            <View key={index} className='clue_item'>
                <View className='clue_item_wrap'>
                    <View className='clue_item_title'>
                        <View className='clue_item_title_left'>
                            <View className='clue_item_title_sort'>{index + 1}</View>
                            <View className='clue_item_title_name'>{item.userName}</View>
                        </View>
                        <View className='clue_item_title_right'>立即领取</View>
                    </View>

                    <View className='clue_item_info'><Text>录入时间：</Text>{item.time}</View>
                    <View className='clue_item_info'><Text>来源：</Text>{item.source}</View>
                    {
                        item.signUpJob?<View className='clue_item_info'><Text>报名岗位：</Text>{item.signUpJob}</View>:''
                    }
                    
                </View>
            </View>
        </>
    );
});

export default inject('store')(React.memo(ClueItem, (prevProps, nextProps) => {
    return prevProps.index === nextProps.index && prevProps.store === nextProps.store;
}));