/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 11:44:14
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-21 14:55:13
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Textarea, Text, Input, Block, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import crypto from 'crypto-js';

import "taro-ui/dist/style/components/action-sheet.scss";
import Navbar from '@/components/navbar';
import Base64 from '@/util/base64'
import './index.scss'

import { companyUpdate, fetchOssConfig } from '@/util/api'

const Index = observer(({ store }) => {
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { scanFilterJob, setScanFilterJob }
    } = store

    const [images, setImages] = useState([]);                      // 选择的照片
    const [showAddError, setShowAddError] = useState(false);   // 备注弹窗
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        return () => {
            setImages([]);
            setScanFilterJob({
                title: '',
                recruitSerialCode: '',
                selected: false,
            });
        }
    }, []);

    const handlePhotoClick = async () => {
        try {
            Taro.chooseImage({
                count: 12 - images.length, // 最多可选择的图片数量
                sourceType: ['album', 'camera'], // 图片来源，可选值：album（相册），camera（相机）
                sizeType: ['original', 'compressed'], // 图片尺寸类型，可选值：original（原图），compressed（压缩图）
                success(res) {
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
            const result = await fetchOssConfig({ type: "IDCARD", bucket: 'apu-mini' });
            console.log(result, "result")
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

                console.log("arrarrarrarr", arr);
                // 返回 Promise 对象
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
    }


    const computeSignature = (accessKeySecret, canonicalString) => {
        return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
    }

    const deleteImg = (e, index) => {
        e.stopPropagation();
        setImages([...images.slice(0, index), ...images.slice(index + 1)])
    }

    const handleSubmit = async () => {
        if (!scanFilterJob.recruitSerialCode) {
            return Taro.showToast({ title: '请选择签到岗位', icon: 'none' });
        }
        if (images.length === 0) {
            return Taro.showToast({ title: '请上传身份证照片', icon: 'none' });
        }

        let params = {
            ...formData,
            imageUrls: images
        }
        Taro.showLoading({ title: '提交中...' });
        const { code, data, msg } = await companyUpdate(params);
        Taro.hideLoading();
        if (code === 200) {
            if (msg) {
                setShowAddError(true);
                setErrorMsg(msg);
            } else {
                Taro.showToast({ title: '提交成功', icon: 'none' });
                setTimeout(() => {
                    Taro.navigateBack({ delta: 1 });
                }, 1500);
            }
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const previewImg = (imgSrc) => {
        Taro.previewImage({
            current: imgSrc,            // 当前显示图片的链接
            urls: [...images]              // 需要预览的图片列表
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='批量识别签到'></Navbar>

            <View className='compony_info'>
                <View className='info_item'>
                    <View className='info_item_label info_item_label_requerd'>选择岗位</View>
                    <View className='info_item_right' onClick={() => {
                        Taro.navigateTo({
                            url: '/pages/newPackage/scanFilterJob/index'
                        })
                    }}>
                        <Text className={`${scanFilterJob.recruitSerialCode ? 'project_item_text_active' : 'project_item_text'}`}>{scanFilterJob.recruitSerialCode ? scanFilterJob.title : '选择签到的岗位'}</Text>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>

                <View className='compony_imgs'>
                    <View className='compony_img_title'>身份证正面照片 <Text>({images.length}/12）</Text></View>
                    <View className='compony_imgs_box'>
                        {
                            images.length < 12 &&
                            <View className='add_img' onClick={() => handlePhotoClick()}>
                                <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_21.webp`}></Image>
                                <View>上传身份证</View>
                            </View>
                        }
                        {
                            images.length > 0 && images.map((item, index) => {
                                return <View className='add_img_wrap' key={index} onClick={() => previewImg(item)}>
                                    <Image src={item} className='add_img_item'></Image>
                                    <Image onClick={(e) => deleteImg(e, index)} src={`${Taro.$cdnUrl}/index/index_icon15.webp`} className='add_img_delete'></Image>
                                </View>
                            })
                        }
                    </View>
                </View>
            </View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn' onClick={handleSubmit}>
                    <View>识别并签到</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <Taro.AddError showPicker={showAddError} errorMsg={errorMsg} onClose={()=>{setShowAddError(false)}}></Taro.AddError>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
