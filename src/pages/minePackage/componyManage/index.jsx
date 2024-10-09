/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 11:44:14
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-08 17:51:42
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro';
import { View, Textarea, Text, Input, Block, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtActionSheet, AtActionSheetItem } from 'taro-ui'
import { reverseGeocoder } from '@/util/getLocation';
import crypto from 'crypto-js';

import "taro-ui/dist/style/components/action-sheet.scss";
import Navbar from '@/components/navbar';
import Base64 from '@/util/base64'
import { fetchOssConfig } from "@/util/api";
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
    } = store
    const [formData, setFormData] = useState({});

    const [openAction, setOpenAction] = useState(false);           // 是否打开选择照片弹窗
    const [images, setImages] = useState([
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/add_clue.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon1.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon2.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon3.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon4.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon5.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon6.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon7.webp',
        // 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/index/index_icon8.webp'
    ]);                      // 选择的照片



    const handlePhotoClick = async (type) => {
        let sourceType = {
            1: 'album',
            2: 'camera'
        }
        // 用户同意授权
        try {
            Taro.chooseImage({
                count: 1, // 最多可选择的图片数量
                sourceType: [sourceType[type]], // 图片来源，可选值：album（相册），camera（相机）
                sizeType: ['original', 'compressed'], // 图片尺寸类型，可选值：original（原图），compressed（压缩图）
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
            const result = await fetchOssConfig({ type: "AVATAR", bucket: 'apu-mini' });
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
                console.log(1)
                const policy = Base64.encode(JSON.stringify(policyText));
                console.log(policy, "policy")
                const signature = computeSignature(accessKeySecret, policy);
                console.log(signature, "signature")
                const params = {
                    'key': `${urlPath}${Date.now()}-${Math.random() * 1000000}.jpg`,
                    'policy': policy,
                    'OSSAccessKeyId': accessKeyId,
                    'success_action_status': '200',
                    'Signature': signature,
                    'x-oss-security-token': securityToken,
                };
                console.log(arr[0], "arr[0]")
                // 返回 Promise 对象
                Taro.uploadFile({
                    url: ossServiceDomain,
                    filePath: arr[0],
                    name: 'file',
                    formData: params,
                    success(res) {
                        // let info = { ...res, url: params.key }
                        Taro.hideLoading();
                        let imgUrl = ossServiceDomain + '/' + params.key;
                        // setImgSrc(imgUrl);
                        console.log('上传成功 --  oss地址为', imgUrl);
                        // setAvatar(ossServiceDomain + '/' + params.key)
                    },
                    fail(err) {
                        console.log(err)
                    }
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

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='企业管理'></Navbar>

            <View className='compony_info'>
                <View className='info_item'>
                    <View className='info_item_label'>企业Logo</View>
                    <View className='info_item_logo' onClick={() => setOpenAction(true)}></View>
                </View>
                <View className='info_item'>
                    <View className='info_item_label'>企业名称</View>
                    <Input
                        className='info_item_input'
                        placeholder='请输入企业名称'
                        value={formData.componyName}
                        placeholderStyle='color: #777777;'
                        onInput={(e) => setFormData({ ...formData, componyName: e.target.value })}></Input>
                </View>
                <View className='info_item'>
                    <View className='info_item_label'>联系人姓名</View>
                    <Input
                        className='info_item_input'
                        placeholder='请输入联系人姓名'
                        value={formData.name}
                        placeholderStyle='color: #777777;'
                        onInput={(e) => setFormData({ ...formData, name: e.target.value })}></Input>
                </View>
                <View className='info_item'>
                    <View className='info_item_label'>联系手机号码</View>
                    <Input
                        type='number'
                        className='info_item_input'
                        placeholder='请输入联系手机号码'
                        value={formData.phone}
                        placeholderStyle='color: #777777;'
                        onInput={(e) => setFormData({ ...formData, phone: e.target.value })}></Input>
                </View>
                <View className='info_item_2'>
                    <View className='info_item_label'>详细地址</View>
                    <Textarea
                        count={false}
                        auto-height
                        confirmType='return'
                        adjustPosition={false} //键盘弹起时，是否自动上推页面 
                        show-confirm-bar
                        maxlength={100}
                        autoHeight
                        className='info_item_textarea'
                        placeholder='请输入详细地址'
                        value={formData.address}
                        placeholderStyle='color: #777777;'
                        onInput={(e) => setFormData({ ...formData, address: e.target.value })}></Textarea>
                </View>

                <View className='compony_imgs'>
                    <View className='compony_img_title'>企业图片 <Text>({images.length}/9）</Text></View>
                    <View className='compony_imgs_box'>

                        {
                            images.length < 9 &&
                            <View className='add_img' onClick={() => { setOpenAction(true) }}>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon14.webp`}></Image>
                            </View>
                        }
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
                <View className='post_btn'>
                    <View>保存</View>
                    <Image src={`${Taro.$cdnUrl}/index/index_icon20.webp`}></Image>
                </View>
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
        </View>
    )
})

export default inject('store')(Index)
