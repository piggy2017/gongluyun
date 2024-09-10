/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 14:51:53
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-10 16:41:47
 * @Description: 
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';

const WorkerInfo = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store

    return (
        <>
            <View className='userInfo'>
                <View className='userInfo_title'>
                    <View className='userInfo_title_name'>高小光</View>
                    <View>45岁·男·汉族</View>
                </View>
                <View className='userInfo_tel flex-row-items'>
                    <Image className='tel_img' src={`${Taro.$cdnUrl}/index/mine_icon7.webp`}></Image>
                    <View>177 6548 0923</View>
                </View>

                <View className='userInfo_item'>
                    <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon8.webp`}></Image>
                    <View className='userInfo_item_content'><Text>来源：</Text>供应商-成都西红人力资源</View>
                </View>
                <View className='userInfo_item'>
                    <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon9.webp`}></Image>
                    <View className='userInfo_item_content'><Text>岗位意向：</Text>普工、物流分拣、BA</View>
                </View>
                <View className='userInfo_item'>
                    <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon10.webp`}></Image>
                    <View className='userInfo_item_content'><Text>备注：</Text>曾经有物流分拣经验，能吃苦想要高工资，工作能力强，15年工作经验</View>
                </View>
            </View>
        </>
    );
});

export default inject('store')(React.memo(WorkerInfo, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));