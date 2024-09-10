/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-06 13:54:19
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-10 14:17:48
 * @Description: 
 */
import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import { AtFloatLayout, AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/icon.scss";
import './index.scss';

const SexPicker = observer(({ onChange, showPicker, onClose, store }) => {
    const {
        baseStore: {
            bottomSafeAreaHeight
        }
    } = store

    const [filterSex, setFilterSex] = useState('');                      // 性别

    const selcectFilterSex = (type) => {
        setFilterSex(type);
        onChange(type);
        setTimeout(() => {
            onClose();
        }, 200);
    }

    return (
        <>
            <AtFloatLayout catchMove className='change_flow_layout' isOpened={showPicker} onClose={onClose}>
                <View className='flow_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View>选择性别</View>
                            <AtIcon value='close' size='14' color='#222222' onClick={onClose}></AtIcon>
                        </View>
                        <View className='filter_content'>
                            <View className='filter_content_sexs'>
                                <View onClick={() => selcectFilterSex('')} className={`filter_content_sex ${filterSex === '' ? 'filter_content_sex_active' : ''}`}>不限性别</View>
                                <View onClick={() => selcectFilterSex(0)} className={`filter_content_sex ${filterSex === 0 ? 'filter_content_sex_active' : ''}`}>男</View>
                                <View onClick={() => selcectFilterSex(1)} className={`filter_content_sex ${filterSex === 1 ? 'filter_content_sex_active' : ''}`}>女</View>
                            </View>
                        </View>
                        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                    </View>
                </View>
            </AtFloatLayout>
        </>
    );
});

// 包裹 inject 和 memo
export default inject('store')(React.memo(SexPicker, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));