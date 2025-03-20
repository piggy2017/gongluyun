/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-19 10:08:44
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Text, Textarea, Button, RichText } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { replaceNewLinesWithBr } from '@/util/utils'
import { decryptData, encryptData } from '@/util/crypto'

import Navbar from '@/components/navbar';
import './index.scss'

import { getRecruitmentInfo, signUpAdd } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { },
        userStore: { isLogin, userInfo, setRole, setEnterParams }
    } = store


    const [detail, setDetail] = useState({});
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        const { inviteRole, recruitSerialCode, agentSerialCode, source } = route.params;
        console.log("进入到岗位详情页,查看携带的参数", route.params);
        if (inviteRole === 'SEEK') {
            setRole('SEEK');
            Taro.setStorageSync('role', 'SEEK');
        }
        // 缓存进入页面的参数------》管道收益
        if (source && agentSerialCode) {
            setEnterParams({ source, agentSerialCode })
        }
        getDetail();
    }, [])

    const getDetail = async () => {
        Taro.showLoading({ title: '加载中...' });
        const { code, data, msg } = await getRecruitmentInfo({ recruitSerialCode: route.params.recruitSerialCode });
        Taro.hideLoading();
        console.log("getRecruitmentInfo", code, data);
        if (code === 200) {
            if (data.introduction) {
                data.introductionTrans = replaceNewLinesWithBr(data.introduction);
            }
            setDetail(data);
        }
    }

    const previewImg = (e) => {
        e.stopPropagation();
        Taro.previewImage({
            current: imgSrc, // 当前显示图片的http链接
            urls: [imgSrc] // 需要预览的图片http链接列表
        })
    }

    const copyDetail = () => {
        Taro.setClipboardData({
            data: detail.introduction,
            success: function (res) {
                Taro.showToast({
                    title: '复制成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    }

    const signUpFunc = async () => {
        if (!isLogin) {
            return setIsOpened(true)
        }
        Taro.makePhoneCall({
            phoneNumber: decryptData(detail.recruitPhone),
        }).then(async () => {
            console.log('拨打电话成功');
        }).catch((err) => {
            console.log('拨打电话失败', err);
        });

        if (!detail.signUp) {
            let params = {
                source: 'SIGN',
                recruitSerialCode: detail.recruitSerialCode,
                signUpChannel: 'IN_WECHAT_MINI'
            }
            const { code, data, msg } = await signUpAdd(params);
            if (code === 200) {
                // Taro.showToast({ title: '报名成功', icon: 'success', duration: 2000 });
                setDetail({ ...detail, signUp: true })
            }
        }
    }

    const onClose = (e) => {
        if (e === 'success') {
            // forceUpdate()
        }
        setIsOpened(false)
    }

    Taro.useShareAppMessage(res => {
        console.log("求职者分享 userInfo.userSerialCode", userInfo, userInfo?.userSerialCode);
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        let url = `/pages/workerPackage/projectDetail/index?recruitSerialCode=${detail.recruitSerialCode}&inviteRole=SEEK&source=WECHAT_MINI_SHARE&agentSerialCode=${userInfo?.userSerialCode ? userInfo.userSerialCode : ''}`;
        return {
            title: detail.areaName + detail.recruitTitle,
            path: url
        }
    })

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='岗位详情' customBack={() => {
                console.log("1")
                let historyPages = Taro.getCurrentPages();    // 历史页面 路由跳转数
                if (historyPages.length === 1) Taro.switchTab({ url: "/pages/workerIndex/index" });
                else Taro.navigateBack({ delta: 1 });         // 多页面跳转
            }}></Navbar>

            <View className='base_info'>
                <View style={`height:72rpx;`}></View>
                <View className='base_info_content'>
                    <View className='base_info_content_title'>{detail.recruitTitle}</View>
                    {
                        detail.recruitSalaryRange &&
                        <View className='base_info_content_range'>
                            {detail.recruitSalaryRange.split('元/')[0]}
                            {
                                detail.recruitSalaryRange.split('元/')[1] && <Text>元/{detail.recruitSalaryRange.split('元/')[1]}</Text>
                            }
                        </View>
                    }
                    <View className='base_info_content_tags'>
                        {
                            (detail.recruitSalaryType === 'DAY' || detail.recruitSalaryType === 'FIXED') &&
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_4${detail.recruitSalaryType === 'DAY' ? 1 : 2}.webp`}></Image>
                        }

                        {
                            detail.jobReq && detail.tags &&
                            <>
                                {
                                    [...detail.jobReq, ...detail.tags].map((r, i) => {
                                        return <View className='base_info_content_tags_item' key={i}>{r}</View>
                                    })
                                }
                            </>
                        }
                    </View>

                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_34.webp`}></Image>
                        <View>岗位类型：{detail.jobTypeName}</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_38.webp`}></Image>
                        <View>岗位薪资：{detail.recruitSalaryRange}</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_35.webp`}></Image>
                        <View>招聘人数：{detail.numberRecruits}人</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_36.webp`}></Image>
                        <View>工作地址：{detail.areaName}{detail.detailedAddress}</View>
                    </View>
                </View>
            </View>
            <View className='hr'></View>

            <View className='job_desc'>
                <View className='job_desc_title'>
                    <View>职位描述</View>
                    <View className='job_desc_title_right' onClick={copyDetail}>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_39.webp`}></Image>
                        <View>复制详情</View>
                    </View>
                </View>
                <View className='job_introduce'>
                    <RichText nodes={detail.introductionTrans}></RichText>
                </View>
                {
                    detail.jobImages &&
                    <View className='job_desc_images'>
                        <View onClick={() => previewImg()} className='job_desc_images_i'></View>
                        <View onClick={() => previewImg()} className='job_desc_images_i'></View>
                        <View onClick={() => previewImg()} className='job_desc_images_i'></View>
                        <View onClick={() => previewImg()} className='job_desc_images_i'></View>
                        <View onClick={() => previewImg()} className='job_desc_images_i'></View>
                    </View>
                }
                <View className='line_hr'></View>
                <View className='job_desc_compony'>
                    <View>公司名称</View>
                    <View className='job_desc_compony_name'>{detail.company}</View>
                </View>
            </View>
            <View style={`height:240rpx;`}></View>

            <View className='bottom_wrapper'>
                <View className='page_bottom_btns'>
                    <Button className='btn_item' open-type='share'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_52.webp`}></Image>
                        <View>分享</View>
                    </Button>
                    <View className='bottom_btn' onClick={signUpFunc}>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_43.webp`}></Image>
                        <View>电话咨询</View>
                    </View>
                </View>

                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} />
        </View>
    )
})

export default inject('store')(Index)
