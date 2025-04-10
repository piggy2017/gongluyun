/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-02-24 10:22:06
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-10 15:54:23
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
import { supplierCreate } from '@/util/api';

const JoinSupplier = observer(({ showPicker, onClose, onChange, store }) => {
    const {
        userStore: { supplierCompanyInfo, setSupplierCompanyInfo }
    } = store
    const [componyName, setComponyName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [channelCode, setChannelCode] = useState('');

    const postComponyName = async () => {
        // if (!componyName) {
        //     return Taro.showToast({
        //         title: '请输入公司/个人名称',
        //         icon: 'none',
        //         duration: 2000
        //     })
        // }
        if (!phone) {
            return Taro.showToast({
                title: '请输入手机号',
                icon: 'none',
                duration: 2000
            })
        }
        const { code, data, msg } = await supplierCreate({ phone, channelCode });
        console.log(" 注册供应商 ", code, data, msg)
        if (code === 200) {
            setSupplierCompanyInfo({ ...data });
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
        onClose();
    }

    return (
        <>
            {
                showPicker &&
                <AtFloatLayout catchMove className='join_supplier_layout' isOpened={showPicker} onClose={onClose}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>
                                    <View>要申请成为供应商</View>
                                    <View>请提供你或你所代表公司的名称(保存后不能修改)</View>
                                </View>
                                <AtIcon value='close' size='20' color='#222222' onClick={onClose}></AtIcon>
                            </View>
                            {/* <View className='filter_content_item'>
                                <View className='filter_content_item_label'>名称</View>
                                <Input className='filter_content_input'
                                    placeholder='点击输入公司/个人名称'
                                    placeholderStyle='color: #999999;'
                                    value={componyName}
                                    onInput={(e) => setComponyName(e.detail.value)}></Input>
                            </View> */}
                            <View className='filter_content_item'>
                                <View className='filter_content_item_label'>手机号</View>
                                <Input className='filter_content_input'
                                    placeholder='点击手机号码'
                                    placeholderStyle='color: #999999;'
                                    value={phone}
                                    onInput={(e) => setPhone(e.detail.value)}></Input>
                            </View>
                            <View className='filter_content_item'>
                                <View className='filter_content_item_label'>渠道码</View>
                                <Input className='filter_content_input'
                                    placeholder='点击输入渠道码'
                                    placeholderStyle='color: #999999;'
                                    value={channelCode}
                                    onInput={(e) => setChannelCode(e.detail.value)}></Input>
                            </View>
                            {/* <View className='filter_content_item'>
                                <View className='filter_content_item_label'>地点</View>
                                <Input className='filter_content_input'
                                    placeholder='点击地址'
                                    placeholderStyle='color: #999999;'
                                    value={address}
                                    onInput={(e) => setAddress(e.detail.value)}></Input>
                            </View> */}

                            <View className={`filter_wrapper_btn ${(phone && channelCode) ? 'filter_wrapper_btn_active' : ''}`} onClick={() => postComponyName()}>保存</View>
                        </View>
                    </View>
                </AtFloatLayout>
            }

        </>
    );
});

// export default inject('store')(DatePicker);
// 包裹 inject 和 memo
export default inject('store')(React.memo(JoinSupplier, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));