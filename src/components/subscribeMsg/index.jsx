/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-03-10 17:58:09
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-01 16:22:00
 * @Description: 订阅消息
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import './index.scss';
import { subscribeMessage } from '@/util/api'

const SubscribeMsg = observer(({ store }) => {
    const {
        baseStore: { tabbarHeight },
        userStore: { subTemplates, getSubTemplates },
        businessStore: { showSubscribe, setShowSubscribe }
    } = store

    // const [showSubscribe, setShowSubscribe] = useState(false);     // 是否显示订阅消息
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        setShowSubscribe(subTemplates.length > 0 ? true : false);
    }, [subTemplates]);

    const subscribeMessageFunc = async () => {
        if (isRequesting) {
            return
        }
        let _tmplIds = subTemplates.length > 3 ? subTemplates.slice(0, 3) : subTemplates;
        console.log("_tmplIds", _tmplIds);
        Taro.requestSubscribeMessage({
            tmplIds: _tmplIds,
            success: function (res) {
                console.log("订阅成功", res);
                let _success = [];
                for (let i = 0; i < _tmplIds.length; i++) {
                    if (res[_tmplIds[i]] === 'accept') {
                        _success.push(_tmplIds[i])
                    }
                }
                if (_success.length > 0) {
                    postSuccessTems(_success)
                }

                let _reject = _tmplIds.some(item => res[item] == 'reject');  //  判断是否有拒绝的
                if (_reject) {
                    Taro.showModal({
                        title: '提示',
                        content: '您之前拒绝了部分消息,可以在设置中允许订阅消息',
                        showCancel: true,
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定');
                                Taro.openSetting({
                                    withSubscriptions: true,                       // 获取用户订阅消息的订阅状态
                                    success: function (suc) {
                                        console.log('openSetting_success', suc)
                                    },
                                    fail: function (error) {
                                        console.log('openSetting_error', error)
                                    }
                                })
                            } else if (res.cancel) {
                                console.log('用户点击取消');
                                setShowSubscribe(false);
                            }
                        }
                    })
                }
            },
            fail: function (err) {
                console.log("订阅失败", err);
                if (err.errMsg === 'requestSubscribeMessage:fail last call has not ended') {  // 发生在用户已经勾选了“总是保持以上选择，不再询问”后，再次尝试订阅时没有弹出确认窗口，导致调用失败。

                } else {
                }
            },
            complete: function () {
                setIsRequesting(true);
            }
        });
    }

    const postSuccessTems = async (_success) => {
        const { code } = await Taro.login();
        let params = {
            wxCode: code, templateIds: _success
        }
        console.log("传递给后端的数据", params);
        subscribeMessage(params).then(res => {
            console.log("订阅成功", res);
            getSubTemplates();
        })
    }

    return (
        <>
            {
                showSubscribe &&
                <View className='sub_message_wrapper' style={`bottom:${tabbarHeight}px;`}>
                    <View className='sub_message_title'>订阅消息，求职与项目动态尽在眼前  </View>
                    <View className='sub_message_btn' onClick={subscribeMessageFunc}>去订阅</View>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_80.webp`} onClick={() => setShowSubscribe(false)}></Image>
                </View>
            }
        </>
    );
});

// export default inject('store')(AgePicker);
export default inject('store')(React.memo(SubscribeMsg, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.goonLoad === nextProps.goonLoad && prevProps.store === nextProps.store;
}));