/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-16 16:37:03
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-21 13:46:41
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
        state: "", name: '全部状态'
    })

    const [statusList, setStatusList] = useState([   // seleted: true
        { name: '全部状态', state: '', },
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
            if (initData.length == 1 && initData[0].state === '') {
                setStatusList(statusList.map(item => {
                    return {
                        ...item,
                        seleted: true
                    }
                }))
            } else {
                // 如果是选择的其他的
                let _list = JSON.parse(JSON.stringify(statusList));
                for (let i = 0; i < _list.length; i++) {
                    for (let j = 0; j < initData.length; j++) {
                        if (_list[i].state === initData[j].state) {
                            _list[i].seleted = true;
                            break;
                        }
                    }
                }
                setStatusList(_list)
            }
        }
    }, [initData]);

    const setPickerStatusFunc = (obj, index) => {   // 筛选状态的回调
        console.log("setPickerStatusFunc", obj);
        // setFilterState(obj);
        // setTimeout(() => {
        //     onChange(obj);
        //     onClose();
        // }, 300);

        // 如果当前点击的是全部,并且当前是选中的状态,则取消选中
        if (obj.state === '') {
            setStatusList(statusList.map(item => {
                return {
                    ...item,
                    seleted: obj.seleted === true ? false : true
                }
            }))
        } else {
            setStatusList(statusList => {
                let _list = JSON.parse(JSON.stringify(statusList));
                _list[index].seleted = obj.seleted === true ? false : true;
                let _filterList = _list.filter(item => item.seleted);
                console.log("_filterList.length:", _filterList.length, "_list.length:", _list.length)
                if (_filterList.length === _list.length - 1 && !obj.seleted) {
                    _list[0].seleted = true;
                } else {
                    _list[0].seleted = false;
                }
                return _list
            })
        }
    }

    const comfirmStatusFunc = () => {
        let _filterList = statusList.filter(item => item.seleted);
        if (_filterList.length === 0) {
            _filterList.push({ name: '全部状态', state: '' })
        } else if (_filterList.length === statusList.length) {
            _filterList = [{ name: '全部状态', state: '' }]
        }
        onChange(_filterList);
        onClose();
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
                                            onClick={() => setPickerStatusFunc(item, index)}
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