/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 11:15:20
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-16 17:42:19
 * @Description: 线索列表item
 */

import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';

const ClueItem = observer(({ store, index, item, onGetClient }) => {
    const {
        baseStore: { },
    } = store

    useEffect(() => {
        console.log("子组件中的item", item);
    }, [item])

    return (
        <>
            <View key={index} className='clue_item'>
                <View className='clue_item_wrap'>
                    <View className='clue_item_wrap_left'>
                        <View className='clue_item_title'>
                            <View className='clue_item_title_left'>
                                <View className='clue_item_title_sort'>{index + 1}</View>
                                <View className='clue_item_title_name'>{item.name}{item.source}</View>
                            </View>
                            {/* <View className='clue_item_title_right' onClick={() => getClient(item)}>立即领取</View> */}
                        </View>
                        {
                            item.recruitTitle ? <View className='clue_item_info'>{item.recruitTitle}</View> : ''
                        }

                        {/* <View className='clue_item_info'>{item.source}</View> */}
                        <View className='clue_item_info'>{item.createTime}录入</View>

                    </View>
                    {
                        item.isGet &&
                        <View className='clue_item_wrap_right_done'>已领取</View> ||
                        <View className='clue_item_wrap_right' onClick={() => onGetClient(item, index)}>立即领取</View>
                    }

                </View>
            </View>
        </>
    );
});

export default inject('store')(React.memo(ClueItem, (prevProps, nextProps) => {
    return prevProps.item === nextProps.item && prevProps.store === nextProps.store;
}));