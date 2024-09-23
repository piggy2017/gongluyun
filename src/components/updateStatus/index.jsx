/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-23 11:41:37
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-23 11:56:16
 * @Description: 更改用户状态  未到面 已到面 面试失败 面试通过 已离职 已入职
 */

import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import './index.scss';

const UpdateStatus = observer(({ onChange, showPicker, currentStatus, bottomHeight, onClose, store }) => {

    // const [currentCliskstatus, setCurrentCliskstatus] = useState('未到面');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (currentStatus) {
            setStatus(currentStatus);
        }
    }, [currentStatus])

    const clickStatus = (status) => {
        onChange(status);
        setStatus(status);
        setTimeout(() => {
            onClose();
        }, 200);
    }

    return (
        <>
            {
                showPicker &&
                <View className='footer_options' style={`bottom:${bottomHeight}px;`}>
                    <View className='footer_options_item' onClick={() => clickStatus('未到面')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon42.webp`}></Image>
                            <View>未到面</View>
                        </View>
                        {
                            status === '未到面' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => clickStatus('已到面')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                            <View style={{ color: '#1678FF' }}>已到面</View>
                        </View>
                        {
                            status === '已到面' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={() => clickStatus('面试失败')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                            <View style={{ color: '#F00000' }}>面试失败</View>
                        </View>
                        {
                            status === '面试失败' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => clickStatus('面试通过')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                            <View style={{ color: '#FF6B17' }}>面试通过</View>
                        </View>
                        {
                            status === '面试通过' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={() => clickStatus('已离职')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon39.webp`}></Image>
                            <View>已离职</View>
                        </View>
                        {
                            status === '已离职' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => clickStatus('已入职')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon36.webp`}></Image>
                            <View style={{ color: '#04B400' }}>已入职</View>
                        </View>
                        {
                            status === '已入职' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                </View>
            }
        </>
    );
});

export default inject('store')(React.memo(UpdateStatus, (prevProps, nextProps) => {
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));