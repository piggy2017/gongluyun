/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-05-16 14:58:27
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-16 16:27:32
 * @Description: 上传身份证并识别信息
 */
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import './index.scss';

import crypto from 'crypto-js';
import Base64 from '@/util/base64'
import { fetchOssConfig, clueIdcard } from '@/util/api'

// setIdcardSrc 函数用于设置身份证照片的 URL
// setScanInfos 函数用于设置身份证扫描信息
// companySerialCode 求职者扫码打开签到,识别身份证携带的企业编号
const ScanIdCard = observer(({ initfrontUrl, initbackUrl, issueDate, expirationDate, setIdcardSrc, setScanInfos, companySerialCode, store }) => {
    const {
        userStore: { companyInfo, isLogin },
    } = store

    const [idCardFrontSrc, setIdCardFrontSrc] = useState('');   // 身份证正面照片
    const [idCardBackSrc, setIdCardBackSrc] = useState('');     // 身份证背面照片
    const [idCardDate, setIdCardDate] = useState('');           // 身份证有效时间
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        if (initfrontUrl) {
            setIdCardFrontSrc(initfrontUrl);
        }
        if (initbackUrl) {
            setIdCardBackSrc(initbackUrl);
        }
        if (issueDate || expirationDate) {
            setIdCardDate(`${issueDate}~${expirationDate}`);
        }
    }, [initfrontUrl, initbackUrl, issueDate, expirationDate])

    const chooseImageFn = async (type) => {
        if (isLogin === 0) {
            setIsOpened(true);
            return
        }
        const res = await Taro.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
        });
        const tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths, 'tempFilePaths')
        changeIdcardUrl(type, tempFilePaths);
    }

    const computeSignature = (accessKeySecret, canonicalString) => {
        return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
    }

    const changeIdcardUrl = async (type, arr) => {
        Taro.showLoading({
            title: '上传中',
            mask: true
        })
        try {
            const result = await fetchOssConfig({ type: 'IDCARD', bucket: 'apu-mini' });
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
                        console.log("图片上传成功", res);
                        Taro.hideLoading();
                        let imgUrl = ossServiceDomain + '/' + params.key;
                        if (type == 1) {          // 身份证正面
                            setIdCardFrontSrc(imgUrl);
                            discernIdCardFn(imgUrl, 1);
                            setIdcardSrc(imgUrl, 1);
                        } else if (type == 2) {    // 身份证背面
                            setIdCardBackSrc(imgUrl);
                            discernIdCardFn(imgUrl, 2);
                            setIdcardSrc(imgUrl, 2);
                        }
                    },
                    fail(err) {
                        console.log(err)
                    }
                });
            }
        } catch (e) { }
    };

    const discernIdCardFn = async (imgUrl, type) => {
        let params = {
            photo: true,
            url: imgUrl,
            source: 'sign',
            companySerialCode: companySerialCode ? companySerialCode : companyInfo.companySerialCode,
            idcardSide: type === 1 ? 'front' : 'back'
        }
        Taro.showLoading({ title: '识别中...', mask: true })
        const { code, data, msg } = await clueIdcard(params);
        Taro.hideLoading();
        console.log("身份证识别", code, data, msg);
        if (code === 200 && data) {
            const { address, birthday, expirationDate, idcard, issueDate, name, sex } = data;
            let obj = {}
            if (address) obj.address = address;
            if (idcard) obj.idCardNo = idcard;
            if (expirationDate) obj.expirationDate = expirationDate;
            if (birthday) obj.birthday = birthday;
            if (issueDate) obj.issueDate = issueDate;
            if (name) obj.name = name;
            if (sex === 0 || sex === 1) obj.sex = sex;
            if (type === 1) {
                obj.frontUrl = imgUrl;
            } else if (type === 2) {
                obj.backUrl = imgUrl;
            }
            if (issueDate || expirationDate) {
                setIdCardDate(`${issueDate}-${expirationDate}`)
            }
            setScanInfos(obj);
        }
    }

    const previewImg = (imgSrc) => {
        Taro.previewImage({
            current: imgSrc,            // 当前显示图片的链接
            urls: [imgSrc]              // 需要预览的图片列表
        })
    }

    const onClose = (e) => {
        if (e === 'success') {
        }
        setIsOpened(false)
    }

    return (
        <>
            <View className='project_upload_idCard project_item_border'>
                <View className='project_item_title'>上传身份证</View>
                <View className='upload_wrapper'>
                    {
                        !idCardFrontSrc &&
                        <View className='upload_item' onClick={() => chooseImageFn(1)}>
                            <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_21.webp`}></Image>
                            <View>上传正面</View>
                        </View> ||
                        <View className='uploaded_item'>
                            <Image onClick={() => previewImg(idCardFrontSrc)} src={idCardFrontSrc}></Image>
                            <View className='re_upload' onClick={() => chooseImageFn(1)}>重传图片</View>
                        </View>
                    }
                    {
                        !idCardBackSrc &&
                        <View className='upload_item' onClick={() => chooseImageFn(2)}>
                            <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_21.webp`}></Image>
                            <View>上传背面</View>
                        </View> ||
                        <View className='uploaded_item'>
                            <Image onClick={() => previewImg(idCardBackSrc)} src={idCardBackSrc}></Image>
                            <View className='re_upload' onClick={() => chooseImageFn(2)}>重传图片</View>
                        </View>
                    }
                </View>
                {
                    idCardDate &&
                    <View className='upload_infos'>
                        <View className='upload_infos_label'>证件有效期限</View>
                        <View>{idCardDate}</View>
                    </View>
                }
            </View>
            <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} />
        </>

    );
});

export default inject('store')(ScanIdCard);
