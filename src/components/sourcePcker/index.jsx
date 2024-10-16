/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 16:34:59
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-16 15:44:12
 * @Description: 
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, PickerView, PickerViewColumn, Button } from '@tarojs/components';
import { AtFloatLayout, AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/icon.scss";
import './index.scss';
import { clueSource } from '@/util/api'

const SourcePicker = observer(({ onChange, showPicker, onClose, store }) => {
    const {
        baseStore: {
            bottomSafeAreaHeight
        }
    } = store
    const [sourceList, setSourceList] = useState([]);
    const [sourceItem, setSourceItem] = useState('全部来源');
    const [showSourceModel, setShowSourceModel] = useState(false);              //  是否显示切换状态的弹窗

    useEffect(() => {
        clueSource({}).then(res => {
            console.log("获取线索来源枚举-clueSource", res);
            if (res.code !== 200) return
            // let lastElement = res.data.pop();
            // res.data.unshift(lastElement);
            setSourceList(res.data);
        })
    }, [])

    const setSourceFunc = (item) => {
        setSourceItem(item);
        let obj = {
            name: item.name,
            source: item.value
        }
        setTimeout(() => {
            onChange(obj);
            onClose();
        }, 300);
    }
    return (
        <>
            <AtFloatLayout catchMove className='source_init_layout' isOpened={showPicker} onClose={onClose}>
                <View className='filter_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View>线索来源</View>
                            <AtIcon value='close' size='14' color='#222222' onClick={onClose}></AtIcon>
                        </View>
                        <View className='filter_wrapper_content'>
                            {
                                sourceList.map((item, index) => {
                                    return (
                                        <View
                                            key={index}
                                            className={`filter_wrapper_item ${item.name === sourceItem.name ? 'filter_wrapper_item_active' : ''}`}
                                            onClick={() => setSourceFunc(item)}
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