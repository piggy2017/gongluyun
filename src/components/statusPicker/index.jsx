/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-16 16:37:03
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-16 17:11:19
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

const StatusPicker = observer(({ onChange, showPicker, onClose, initData, store }) => {
    const {
        baseStore: {
            bottomSafeAreaHeight
        }
    } = store
    const [filterState, setFilterState] = useState({    // 筛选状态
        state: "ALL", name: '全部状态'
    })

    const [statusList, setStatusList] = useState([   // seleted: true
        { name: '全部状态', state: 'ALL', },
        { name: '待处理', state: 'PENDING', },
        { name: '已联系', state: 'CONTACT', },
        { name: '不合适', state: 'UNSUITABLE', },
        { name: '名单满储备下次', state: 'FULL', },
        { name: '名单审核不通过', state: 'REVIEW_NOT_PASSED', },
        { name: "已约面", state: "SCHEDULED_INTERVIEW", },
        { name: '未到面', state: 'NOT_INTERVIEW', },
        { name: '已到面', state: 'ARRIVE_INTERVIEW', },
        { name: '待定', state: 'UNDETERMINED', },
        { name: '面试失败', state: 'INTERVIEW_FAILED', },
        { name: '面试通过', state: 'INTERVIEW_PASSED', },
        { name: '中途放弃', state: 'GIVE_HALFWAY', },
        { name: '已入职', state: 'EMPLOYED', },
        { name: '已离职', state: 'RESIGN', },
        { name: '可结算', state: 'SETTLEMENT', },
    ])

    useEffect(() => {
        if (initData?.length > 0) {
            if (initData.length == 1 && initData[0].state === 'ALL') {
                setStatusList(statusList.map(item => {
                    return {
                        ...item,
                        seleted: true
                    }
                }))
            }else{
                // 如果是选择的其他的
                
            }
        }
    }, [initData]);

    const setPickerStatusFunc = (obj) => {   // 筛选状态的回调
        console.log("setPickerStatusFunc", obj);
        setFilterState(obj);
        setTimeout(() => {
            onChange(obj);
            onClose();
        }, 300);
    }

    const comfirmStatusFunc = () => {

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
                                            className={`filter_wrapper_item ${item.seleted ? 'filter_wrapper_item_active' : ''}`}
                                            onClick={() => setPickerStatusFunc(item)}
                                        >{item.name}</View>
                                    )
                                })
                            }
                        </View>
                        <View className='post_btn' onClick={comfirmStatusFunc}>确定</View>
                        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                    </View>
                </View>
            </AtFloatLayout>
        </>
    );
});


export default inject('store')(React.memo(StatusPicker, (prevProps, nextProps) => {
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));