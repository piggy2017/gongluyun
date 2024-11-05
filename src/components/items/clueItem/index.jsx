/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 11:15:20
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-05 15:31:16
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
        businessStore: { sourceList },
    } = store

    useEffect(() => {
        console.log("子组件中的item", item, sourceList);
    }, [item])

    const getSourceName = (state) => {
        if (state) {
            const _list = sourceList.find(item => item.value === state);
            console.log("_list", _list, _list.name)
            return _list.name
        }
    }

    return (
        <>
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
        </>
    );
});

export default inject('store')(React.memo(ClueItem, (prevProps, nextProps) => {
    return prevProps.item === nextProps.item && prevProps.store === nextProps.store;
}));