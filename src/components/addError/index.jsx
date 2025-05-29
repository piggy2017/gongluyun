/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-05-16 14:58:27
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-29 17:07:19
 * @Description: 批量录入求职者,撞单报错弹窗
 */
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, RichText } from '@tarojs/components';
import { replaceNewLinesWithBr } from '@/util/utils'
import './index.scss';

const AddError = observer(({ showPicker, errorMsg, onClose, store }) => {
    const {
        userStore: { companyInfo, isLogin },
    } = store
    const [msg, setMsg] = useState('');
    const [isShow, setIsShow] = useState(false);
    useEffect(() => {
        if (errorMsg) {
            setMsg(replaceNewLinesWithBr(errorMsg));
        }
        setIsShow(showPicker);
    }, [errorMsg, showPicker])

    return (
        <>
            {
                isShow &&
                <View className='error_model_wrap'>
                    <View className='error_model_content_wrap'>
                        <View className='error_model_content'>
                            <RichText nodes={msg}></RichText>
                        </View>
                        <View className='error_model_btn' onClick={() => {
                            onClose();
                            setIsShow(false);
                        }}>我知道了</View>
                    </View>
                </View>
            }

        </>
    );
});

export default inject('store')(AddError);
