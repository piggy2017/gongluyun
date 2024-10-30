/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 14:51:53
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-29 14:48:36
 * @Description: 
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';

const WorkerInfo = observer(({ store, info, interview }) => {
    const {
    } = store

    return (
        <>
            {
                info &&
                <View className='userInfo'>
                    <View className='userInfo_title'>
                        <View className='userInfo_title_left'>
                            <View className='userInfo_title_name'>{info.name}</View>
                            <View>{info.age ? info.age + '岁' : ''}·{info.sex === 0 ? '男' : info.sex === 1 ? '女' : '未知'}</View>
                        </View>
                        {
                            info.seekState === 'PENDING' && !interview &&
                            <View className='userInfo_title_right'>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon41.webp`}></Image>
                                <View>编辑</View>
                            </View>
                        }
                    </View>
                    <View className='userInfo_tel flex-row-items' onClick={() => Taro.makePhoneCall({ phoneNumber: info.phone })}>
                        <Image className='tel_img' src={`${Taro.$cdnUrl}/index/mine_icon7.webp`}></Image>
                        <View>{info.phone}</View>
                    </View>

                    <View className='userInfo_item'>
                        <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon8.webp`}></Image>
                        <View className='userInfo_item_content'><Text>来源：</Text>{info.source}</View>
                    </View>
                    {/* <View className='userInfo_item'>
                        <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon9.webp`}></Image>
                        <View className='userInfo_item_content'><Text>岗位意向：</Text>普工、物流分拣、BA</View>
                    </View> */}
                    {
                        info.remark &&
                        <View className='userInfo_item'>
                            <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon10.webp`}></Image>
                            <View className='userInfo_item_content'><Text>备注：</Text>{info.remark}</View>
                        </View>
                    }
                </View>
            }

        </>
    );
});

export default inject('store')(React.memo(WorkerInfo, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.info === nextProps.info;
}));