/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-23 11:41:37
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-11 18:58:57
 * @Description: 更改用户状态  未到面 已到面 面试失败 面试通过 已离职 已入职
 */

import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Block, Textarea, Text, RootPortal } from '@tarojs/components';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import { getStatus, getColor } from '@/util/utils'
import './index.scss';

const UpdateStatus = observer(({ showPicker, onChange, currentStatus, bottomHeight, onClose, type = 1, store }) => {
    // 默认 type=1 名单反馈、列表反馈页面、客户详情,第一个状态是未到面      type=2 名单 第一个状态是已约面

    const {
        baseStore: { bottomSafeAreaHeight, setKeyBoardHeight },
    } = store
    const [status, setStatus] = useState('');

    const [showModel, setShowModel] = useState(false);
    const [failReason, setFailReason] = useState(''); // 面试失败原因
    const [modelTitle, setModelTitle] = useState(''); // 

    useEffect(() => {
        if (currentStatus) {
            setStatus(currentStatus);
        }
    }, [currentStatus])

    const clickStatus = (e, status) => {
        e.stopPropagation();
        if (status === 'INTERVIEW_FAILED' || status === 'RESIGN') {   // 面试失败、已离职
            setModelTitle(status === 'INTERVIEW_FAILED' ? '面试失败' : '离职');
            setShowModel(true);
        } else {
            onChange(status);
            setStatus(status);
            setTimeout(() => {
                onClose();
            }, 200);
        }
    }

    const postReasonFunc = () => {
        if (!failReason) {
            return Taro.showToast({ title: '请输入原因', icon: 'none' });
        }
        const _status = modelTitle === '面试失败' ? 'INTERVIEW_FAILED' : 'RESIGN'
        onChange(_status, failReason);
        setStatus(_status);
        setShowModel(false);
        setTimeout(() => {
            onClose();
            setFailReason('');
        }, 200);
    }

    return (
        <>
            {
                showPicker &&    // style={`bottom:${bottomHeight}px;`}
                <View className='footer_options' >
                    {
                        type === 2 &&
                        <View className='footer_options_item' onClick={(e) => clickStatus(e, 'SCHEDULED_INTERVIEW')}>
                            <View className='footer_options_item_icon'>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon50.webp`}></Image>
                                <View style={{ color: '#08B5FF' }}>已约面</View>
                            </View>
                            {
                                status === 'SCHEDULED_INTERVIEW' &&
                                <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                            }
                        </View> ||
                        <View className='footer_options_item' onClick={(e) => clickStatus(e, 'NOT_INTERVIEW')}>
                            <View className='footer_options_item_icon'>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon42.webp`}></Image>
                                <View>未到面</View>
                            </View>
                            {
                                status === 'NOT_INTERVIEW' &&
                                <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                            }
                        </View>
                    }
                    <View className='footer_options_item' onClick={(e) => clickStatus(e, 'ARRIVE_INTERVIEW')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon43.webp`}></Image>
                            <View style={{ color: '#1678FF' }}>已到面</View>
                        </View>
                        {
                            status === 'ARRIVE_INTERVIEW' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={(e) => clickStatus(e, 'INTERVIEW_FAILED')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon44.webp`}></Image>
                            <View style={{ color: '#F00000' }}>面试失败</View>
                        </View>
                        {
                            status === 'INTERVIEW_FAILED' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={(e) => clickStatus(e, 'INTERVIEW_PASSED')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon37.webp`}></Image>
                            <View style={{ color: '#FF6B17' }}>面试通过</View>
                        </View>
                        {
                            status === 'INTERVIEW_PASSED' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>

                    <View className='footer_options_item' onClick={(e) => clickStatus(e, 'RESIGN')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon39.webp`}></Image>
                            <View>已离职</View>
                        </View>
                        {
                            status === 'RESIGN' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                    <View className='footer_options_item' onClick={(e) => clickStatus(e, 'EMPLOYED')}>
                        <View className='footer_options_item_icon'>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon36.webp`}></Image>
                            <View style={{ color: '#04B400' }}>已入职</View>
                        </View>
                        {
                            status === 'EMPLOYED' &&
                            <Image className='option_item_choose' src={`${Taro.$cdnUrl}/index/index_icon34.webp`}></Image>
                        }
                    </View>
                </View>
            }

            <Block>
                {
                    showModel &&
                    <RootPortal>
                        <AtFloatLayout catchMove className='status_init_layout' isOpened={showModel} onClose={() => { setShowModel(false) }}>
                            <View className='filter_wrapper'>
                                <View className='filter_wrapper_bg'>
                                    <View className='filter_title'>
                                        <View></View>
                                        <View>反馈{modelTitle}原因</View>
                                        <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowModel(false) }}></AtIcon>
                                    </View>
                                    <View className='input_wrapper'>
                                        <Textarea count={false}
                                            focus={true}
                                            className='float_input'
                                            auto-height
                                            confirmType='return'
                                            value={failReason}
                                            onInput={(e) => setFailReason(e.detail.value)}
                                            adjustPosition={true} //键盘弹起时，是否自动上推页面 
                                            showConfirmBar={false}
                                            maxlength={50}
                                            autoHeight
                                            placeholder={`请描述具体原因...（必填）`}
                                            onKeyboardHeightChange={(e) => {
                                                let currHeight = e.detail.height;
                                                console.log('currHeight', currHeight)
                                                if (currHeight > 0) {
                                                    setKeyBoardHeight(currHeight);
                                                }
                                            }}
                                        >
                                        </Textarea>
                                        <View className='input_number'><Text>{failReason.length}</Text>/50</View>
                                    </View>
                                    <View style={`background:${failReason.length > 0 ? '#0483FF' : '#CDE1FF'}`} className='post_btn' onClick={postReasonFunc}>提交</View>
                                    <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                                </View>
                            </View>
                        </AtFloatLayout>
                    </RootPortal>

                }
            </Block>
        </>
    );
});

export default inject('store')(React.memo(UpdateStatus, (prevProps, nextProps) => {
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));