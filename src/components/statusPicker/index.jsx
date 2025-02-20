/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-16 16:37:03
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-19 15:13:16
 * @Description: 
 */

import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import { AtFloatLayout, AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/icon.scss";
import './index.scss';

const SourcePicker = observer(({ onChange, showPicker, onClose, store }) => {
    const {
        baseStore: {
            bottomSafeAreaHeight
        }
    } = store
    const [filterState, setFilterState] = useState({    // 筛选状态
        state: "", name: '全部状态'
    })

    const [statusList, setStatusList] = useState([
        { name: '全部状态', state: '' },
        { name: '已联系', state: 'CONTACT' },
        { name: '不合适', state: 'UNSUITABLE' },
        { name: '待处理', state: 'PENDING' },
        { name: "已约面", state: "SCHEDULED_INTERVIEW" },
        { name: '未到面', state: 'NOT_INTERVIEW' },
        { name: '已到面', state: 'ARRIVE_INTERVIEW' },
        { name: '面试失败', state: 'INTERVIEW_FAILED' },
        { name: '面试通过', state: 'INTERVIEW_PASSED' },
        { name: '已离职', state: 'RESIGN' },
        { name: '已入职', state: 'EMPLOYED' },
    ])

    const setPickerStatusFunc = (obj) => {   // 筛选状态的回调
        console.log("setPickerStatusFunc", obj);
        setFilterState(obj);
        setTimeout(() => {
            onChange(obj);
            onClose();
        }, 300);
    }
    return (
        <>
            <AtFloatLayout catchMove className='status_init_layout' isOpened={showPicker} onClose={onClose}>
                <View className='filter_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View>筛选状态</View>
                            <AtIcon value='close' size='14' color='#222222' onClick={onClose}></AtIcon>
                        </View>
                        <View className='filter_wrapper_content'>
                            {
                                statusList.map((item, index) => {
                                    return (
                                        <View
                                            key={index}
                                            className={`filter_wrapper_item ${item.name === filterState.name ? 'filter_wrapper_item_active' : ''}`}
                                            onClick={() => setPickerStatusFunc(item)}
                                        >{item.name}</View>
                                    )
                                })
                            }
                        </View>
                        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                    </View>
                </View>
            </AtFloatLayout>
        </>
    );
});


export default inject('store')(React.memo(SourcePicker, (prevProps, nextProps) => {
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));