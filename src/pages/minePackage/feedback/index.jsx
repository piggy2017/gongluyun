/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 11:44:14
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-16 10:35:42
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Textarea, Text, Input, Block, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { AtActionSheet, AtActionSheetItem } from 'taro-ui'
import crypto from 'crypto-js';

import "taro-ui/dist/style/components/action-sheet.scss";
import Navbar from '@/components/navbar';
import Base64 from '@/util/base64'
import { fetchOssConfig, userFeedBack } from "@/util/api";
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
        userStore: { isLogin, setIsLogin, role, setRole, companyVerified },
    } = store

    const [openAction, setOpenAction] = useState(false);           // 是否打开选择照片弹窗
    const [images, setImages] = useState([
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/add_clue.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon1.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon2.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon3.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon4.webp',
    ]);                      // 选择的照片

    const [feedbackValue, setFeedbackValue] = useState('');
    const [isOpened, setIsOpened] = useState(false);



    const handlePhotoClick = async (type) => {
        if(isLogin===0){
            setIsOpened(true);
            return;
        }
        if (images.length >= 5) {
            return Taro.showToast({ title: '最多上传5张图片', icon: 'none' })
        }
        let sourceType = {
            1: 'album',
            2: 'camera'
        }
        // 用户同意授权
        try {
            Taro.chooseImage({
                count: 5 - images.length,              // 最多可选择的图片数量
                sourceType: [sourceType[type]],        // 图片来源，可选值：album（相册），camera（相机）
                sizeType: ['original', 'compressed'],  // 图片尺寸类型，可选值：original（原图），compressed（压缩图）
                success(res) {
                    setOpenAction(false);
                    // 获取到用户选择的照片信息
                    console.log('选择的照片路径：', res);
                    const { tempFilePaths } = res;
                    getOssSrc(tempFilePaths);
                },
            });
        } catch (err) {
            console.log('选择照片失败：', err);
        }
    }

    const getOssSrc = async (arr) => {
        Taro.showLoading({
            title: '上传中',
            mask: true
        })
        try {
            const result = await fetchOssConfig({ type: "COMPLAINT", bucket: 'apu-mini' });
            if (result.code === 200) {
                let { ossServiceDomain, accessKeyId, urlPath, accessKeySecret, securityToken } = result.data;
                const date = new Date();
                date.setHours(date.getHours() + 1);
                const policyText = {
                    expiration: date.toISOString(),
                    conditions: [
                        ["content-length-range", 0, 1024 * 1024 * 1024],
                    ],
                };

                const policy = Base64.encode(JSON.stringify(policyText));
                const signature = computeSignature(accessKeySecret, policy);


                const uploadPromises = arr.map(r => {
                    const params = {
                        'key': `${urlPath}${Date.now()}-${Math.random() * 1000000}.jpg`,
                        'policy': policy,
                        'OSSAccessKeyId': accessKeyId,
                        'success_action_status': '200',
                        'Signature': signature,
                        'x-oss-security-token': securityToken,
                    };

                    // 返回 Promise 对象
                    return new Promise((resolve, reject) => {
                        Taro.uploadFile({
                            url: ossServiceDomain,
                            filePath: r,
                            name: 'file',
                            formData: params,
                            success(res) {
                                let imgUrl = ossServiceDomain + '/' + params.key;
                                resolve(imgUrl);
                            },
                            fail(err) {
                                reject(err);
                            }
                        });
                    });
                });

                // 等待所有异步操作完成
                Promise.all(uploadPromises)
                    .then(results => {
                        Taro.hideLoading();
                        setImages([...images, ...results]);
                    })
                    .catch(error => {
                        Taro.hideLoading();
                        console.error(error);
                    });
            } else {
                Taro.hideLoading();
            }
        } catch (e) {
        }
    };

    const computeSignature = (accessKeySecret, canonicalString) => {
        return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
    }

    const deleteImg = (index) => {
        setImages([...images.slice(0, index), ...images.slice(index + 1)])
    }

    const handleSubmit = async () => {
        if(isLogin===0){
            setIsOpened(true);
            return;
        }
        if (!feedbackValue && images.length === 0) {
            return Taro.showToast({ title: '请填写反馈内容或上传反馈图片', icon: 'none' })
        }
        let params = {
            describes: feedbackValue,
            imageUrl: images
        }
        const { code, data, msg } = await userFeedBack(params);
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 });
            }, 1500);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const onClose = (e) => {
        if (e === 'success') {
            // forceUpdate()
        }
        setIsOpened(false)
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='意见反馈'></Navbar>

            <View className='feedback_wrap'>
                <View className='feedback_wrap_title'>详细描述</View>
                <Textarea count={false}
                    confirmType='return'
                    adjustPosition={true} //键盘弹起时，是否自动上推页面 
                    show-confirm-bar
                    maxlength={500}
                    className='feedback_textarea'
                    placeholder='您在哪个页面遇到了什么问题，详细描述有助于帮助您快速解决...'
                    value={feedbackValue}
                    placeholderStyle='color: #777777;'
                    onInput={(e) => setFeedbackValue(e.target.value)}>
                </Textarea>
                <View className='feedback_count'>{feedbackValue.length}/500</View>
            </View>

            <View className='compony_info'>
                <View className='compony_imgs'>
                    <View className='compony_img_title'>上传图片 <Text>({images.length}/5）</Text></View>
                    <View className='compony_imgs_box'>
                        <View className='add_img' onClick={() => {
                            if (images.length >= 5) {
                                return Taro.showToast({ title: '最多上传5张图片', icon: 'none' })
                            }
                            setOpenAction(true);
                        }}>
                            <Image src={`${Taro.$cdnUrl}/index/index_icon14.webp`}></Image>
                        </View>
                        {
                            images.length > 0 && images.map((item, index) => {
                                return <View className='add_img_wrap' key={index}>
                                    <Image src={item} className='add_img_item'></Image>
                                    <Image onClick={() => deleteImg(index)} src={`${Taro.$cdnUrl}/index/index_icon15.webp`} className='add_img_delete'></Image>
                                </View>
                            })
                        }
                    </View>
                </View>
            </View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className={`post_btn ${(feedbackValue || images.length > 0) ? 'post_btn_active' : ''}`} onClick={handleSubmit}>提交</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <AtActionSheet isOpened={openAction} cancelText='取消' onCancel={() => setOpenAction(false)} onClose={() => setOpenAction(false)}>
                    <AtActionSheetItem onClick={() => handlePhotoClick(1)}>
                        选择照片
                    </AtActionSheetItem>
                    <AtActionSheetItem onClick={() => handlePhotoClick(2)}>
                        相机拍照
                    </AtActionSheetItem>
                </AtActionSheet>
            </Block>

            <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} />
        </View>
    )
})

export default inject('store')(Index)