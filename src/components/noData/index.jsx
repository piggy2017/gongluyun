/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-03-10 17:58:09
 * @LastEditors: 孙林
 * @LastEditTime: 2025-07-10 09:56:28
 * @Description: 列表无数据的状态
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import './index.scss';

const NoData = observer(({ goonLoad, store, padding }) => {

    return (
        <>
            <View className='no_data'>
                <View style={`padding-top:${padding ? padding+'rpx' : '300rpx'}`}><Image src={`${Taro.$cdnUrl}/index/no_login.webp`}></Image></View>
                <View>暂无相关数据~</View>
            </View>
        </>
    );
});

// export default inject('store')(AgePicker);
export default inject('store')(React.memo(NoData, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.goonLoad === nextProps.goonLoad && prevProps.store === nextProps.store;
}));