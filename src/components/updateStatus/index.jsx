/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-23 11:41:37
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-29 14:31:49
 * @Description: 更改用户状态  未到面 已到面 面试失败 面试通过 已离职 已入职
 */

import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import { getStatus, getColor } from '@/util/utils'
import './index.scss';

const UpdateStatus = observer(({ showPicker, onChange, currentStatus, bottomHeight, onClose, type = 1, store }) => {
    // 默认 type=1 名单反馈、列表反馈页面、客户详情,第一个状态是未到面      type=2 花名册 第一个状态是已约面

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
                showPicker &&    // style={`bottom:${bottomHeight}px;`}
                <View className='footer_options' >
                    {
                        type === 2 &&
                        <View className='footer_options_item' onClick={() => clickStatus('SCHEDULED_INTERVIEW')}>
                            <View className='footer_options_item_icon'>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon50.webp`}></Image>
                                <View style={{ color: '#08B5FF' }}>已约面</View>
                            </View>
                            {
                                status === 'SCHEDULED_INTERVIEW' &&
                                <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                            }
                        </View> ||
                        <View className='footer_options_item' onClick={() => clickStatus('NOT_INTERVIEW')}>
                            <View className='footer_options_item_icon'>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon42.webp`}></Image>
                                <View>未到面</View>
                            </View>
                            {
                                status === 'NOT_INTERVIEW' &&
                                <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                            }
                        </View>
                    }
                    <View className='footer_options_item' onClick={() => clickStatus('ARRIVE_INTERVIEW')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                            <View style={{ color: '#1678FF' }}>已到面</View>
                        </View>
                        {
                            status === 'ARRIVE_INTERVIEW' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={() => clickStatus('INTERVIEW_FAILED')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                            <View style={{ color: '#F00000' }}>面试失败</View>
                        </View>
                        {
                            status === 'INTERVIEW_FAILED' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => clickStatus('INTERVIEW_PASSED')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                            <View style={{ color: '#FF6B17' }}>面试通过</View>
                        </View>
                        {
                            status === 'INTERVIEW_PASSED' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={() => clickStatus('RESIGN')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon39.webp`}></Image>
                            <View>已离职</View>
                        </View>
                        {
                            status === 'RESIGN' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={() => clickStatus('EMPLOYED')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon36.webp`}></Image>
                            <View style={{ color: '#04B400' }}>已入职</View>
                        </View>
                        {
                            status === 'EMPLOYED' &&
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