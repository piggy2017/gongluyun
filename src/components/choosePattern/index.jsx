/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-02-24 10:22:06
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-24 11:50:05
 * @Description:  申请成为供应商--输入公司名称
 */
import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Input } from '@tarojs/components';
import { AtFloatLayout, AtIcon } from 'taro-ui'

import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss';

const ChoosePattern = observer(({ showPicker, onClose, onchange, store }) => {
    const [patternList, setPatternList] = useState([
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 1 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 2 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 3 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 4 },
        { content: '在职15天400，人多+V，卡点3天，请假旷工顺延，自离旷离无费；', id: 5 },
    ])
    const [chooseId, setChooseId] = useState('')

    return (
        <>
            <AtFloatLayout catchMove className='choose_pattern_layout' isOpened={showPicker} onClose={onClose}>
                <View className='filter_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View>选择合作模式</View>
                            <AtIcon value='close' size='14' color='#222222' onClick={onClose}></AtIcon>
                        </View>
                        <View className='filter_content'>
                            {
                                patternList.length > 0 && patternList.map((item, index) => {
                                    return (
                                        <View onClick={() => {
                                            setChooseId(item)
                                            console.log("点击了模式", item.id)
                                        }
                                        } className={`filter_pattern_item ${chooseId.id == item.id ? 'filter_pattern_item_active' : ''}`} key={index} >
                                            <View className='filter_item_title'>模式{index + 1}:</View>
                                            <View className='filter_item_content'>{item.content}</View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View className={`filter_btn ${chooseId ? 'filter_btn_active' : ''}`} onClick={() => {
                            if (!chooseId) {
                                return Taro.showToast({
                                    title: '请选择合作模式',
                                    icon: 'none',
                                    duration: 2000
                                })
                            }
                            onchange(chooseId);
                        }}>确定</View>
                    </View>
                </View>
            </AtFloatLayout>
        </>
    );
});

// export default inject('store')(DatePicker);
// 包裹 inject 和 memo
export default inject('store')(React.memo(ChoosePattern, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));