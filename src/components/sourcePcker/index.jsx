/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 16:34:59
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 09:55:06
 * @Description: 
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, PickerView, PickerViewColumn, Button } from '@tarojs/components';
import { AtFloatLayout,AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/icon.scss";
import './index.scss';

const SourcePicker = observer(({ onChange, showPicker, onClose, store }) => {
    const {
        baseStore: {
            bottomSafeAreaHeight
        }
    } = store
    const [sourceList, setSourceList] = useState([ '抖音直播', '小红书', 'BOSS直聘', '微信私域', '58同城', '微信群', '钉钉', '飞书']);
    const [sourceIndex, setSourceIndex] = useState('全部来源');
    const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

    const setSource=(item)=>{
        setSourceIndex(item);
        onChange(item);
        onClose();
    }
    return (
        <>
            <AtFloatLayout catchMove className='source_init_layout' isOpened={showPicker} onClose={onClose}>
                <View className='filter_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View>按性别筛选</View>
                            <AtIcon value='close' size='14' color='#222222' onClick={onClose}></AtIcon>
                        </View>
                        <View className='filter_wrapper_content'>
                            {
                                sourceList.map((item, index) => {
                                    return (
                                        <View
                                            key={index}
                                            className={`filter_wrapper_item ${item === sourceIndex ? 'filter_wrapper_item_active' : ''}`}
                                            onClick={() => setSource(item)}
                                        >{item}</View>
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