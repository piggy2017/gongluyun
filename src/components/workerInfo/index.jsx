/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 14:51:53
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-24 14:00:58
 * @Description: 
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import './index.scss';
import { callUp } from '@/util/api';

const WorkerInfo = observer(({ store, info, interview, type }) => {
    const {
        businessStore: { setEditClientInfos }
    } = store

    const goEdit = () => {
        setEditClientInfos(info);
        Taro.navigateTo({
            url: type === 1 ? '/pages/newPackage/newWorker/index' : '/pages/talentsPackage/editTalent/index'
        });
    }

    const callUser = (obj) => {
        // if (type === 1 && interview) {
        //     return Taro.showToast({
        //         title: '领取后才能拨打电话',
        //         icon: 'none'
        //     })
        // }
        Taro.makePhoneCall({ phoneNumber: obj.phone });
        if (type === 1) {
            callUp({ uuid: obj.uuid }).then(res => {
                console.log("拨打电话 调用接口", res);
            })
        }
    }

    return (
        <>
            {
                info &&
                <View className='userInfo'>
                    <View className='userInfo_title'>
                        <View className='userInfo_title_left'>
                            <View className='userInfo_title_name'>{info.name}</View>
                            <View>{info.age ? info.age + '岁' : ''}{(info.age && (info.sex === 0 || info.sex === 1)) ? '·' : ''}{info.sex === 0 ? '男' : info.sex === 1 ? '女' : '未知'}</View>
                        </View>
                        {
                            ((info.seekState === 'PENDING' && !interview) || type == 2) &&
                            <View className='userInfo_title_right' onClick={goEdit}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon41.webp`}></Image>
                                <View>编辑</View>
                            </View>
                        }
                    </View>
                    {
                        type === 1 && interview &&
                        <>
                        </> ||
                        <View className='userInfo_tel flex-row-items' onClick={() => callUser(info)}>
                            <Image className='tel_img' src={`${Taro.$cdnUrl}/index/mine_icon7.webp`}></Image>
                            <View>{info.phone}</View>
                        </View>
                    }


                    <View className='userInfo_item'>
                        <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon8.webp`}></Image>
                        <View className='userInfo_item_content'><Text className='userInfo_item_content_label'>来源：</Text>{info.sourceDesc}</View>
                    </View>
                    {
                        info.jobTypes && info.jobTypes.length > 0 &&
                        <View className='userInfo_item'>
                            <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon9.webp`}></Image>
                            <View className='userInfo_item_content'><Text className='userInfo_item_content_label'>岗位意向：</Text>
                                {
                                    info.jobTypes.map((i, idx) => {
                                        return (
                                            <Text key={idx}>{i.name}{idx === info.jobTypes.length - 1 ? '' : '、'}</Text>
                                        )
                                    })
                                }
                            </View>
                        </View>
                    }

                    {
                        info.remark &&
                        <View className='userInfo_item'>
                            <Image className='userInfo_item_img' src={`${Taro.$cdnUrl}/index/mine_icon10.webp`}></Image>
                            <View className='userInfo_item_content'><Text className='userInfo_item_content_label'>备注：</Text>{info.remark}</View>
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