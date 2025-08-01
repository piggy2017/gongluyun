/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-05-16 14:58:27
 * @LastEditors: 孙林
 * @LastEditTime: 2025-08-01 17:35:18
 * @Description: 上传身份证并识别信息
 */
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';

import crypto from 'crypto-js';
import Base64 from '@/util/base64'
import { fetchOssConfig } from '@/util/api'
import { compareVersion } from '@/util/utils';
import './index.scss';

// setIdcardSrc 函数用于设置身份证照片的 URL
// setScanInfos 函数用于设置身份证扫描信息
// companySerialCode 求职者扫码打开签到,识别身份证携带的企业编号
const UploadResume = observer(({ resumeName, resumeUrl, deleteResume, getUploadInfo, store }) => {
    const {
        baseStore: { phonePlatform, SDKVersion, bottomSafeAreaHeight },
    } = store

    const [resumeSrc, setResumeSrc] = useState('');       // 简历文件地址
    const [resumeCurrentName, setResumeCurrentName] = useState('');     // 简历文件名称

    useEffect(() => {
        if (resumeUrl) {
            setResumeSrc(resumeUrl);
            setResumeCurrentName(resumeName);
        }
    }, [resumeName, resumeUrl])

    const uploadResume = () => {    // 选择简历文件
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        console.log("当前手机平台是:", phonePlatform);
        wx.chooseMessageFile({
            count: 1,
            extension: allowedExtensions,
            success: res => {
                const file = res.tempFiles[0];
                console.log("ios选择文件成功", file);
                file.platform = 'iOS';
                uploadToOSS(file);
            },
            fail: (err) => {
                console.log("选择文件失败", err);
            }
        });
        return
        if (phonePlatform === 'ios') {

        } else {
            // 检查基础库版本
            if (compareVersion(SDKVersion, '2.17.0') >= 0) {
                // Android使用系统文件选择器
                wx.chooseFile({
                    count: 1,
                    type: 'file',
                    extension: allowedExtensions,
                    success: res => {
                        const file = res.tempFiles[0];
                        console.log("android选择文件成功", file);
                        file.platform = 'Android';
                        uploadToOSS(file);
                    },
                    fail: (err) => {
                        console.log("选择文件失败", err);
                    }
                });
            } else {
                // 低版本Android使用微信聊天文件选择器
                wx.chooseMessageFile({
                    count: 1,
                    extension: allowedExtensions,
                    success: res => {
                        const file = res.tempFiles[0];
                        console.log("android低版本选择文件成功", file);
                        file.platform = 'Android (低版本)';
                        uploadToOSS(file);
                    },
                    fail: (err) => {
                        console.log("选择文件失败", err);
                    }
                });
            }
        }
    }

    const computeSignature = (accessKeySecret, canonicalString) => {
        return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
    }

    const uploadToOSS = async (file) => {  // 上传简历文件
        Taro.showLoading({
            title: '上传中',
            mask: true
        })
        try {
            const result = await fetchOssConfig({ type: 'RESUME', bucket: 'apu-mini' });
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

                const fileExt = file.path.substring(file.path.lastIndexOf('.'));
                const objectKey = `${urlPath}${Date.now()}-${Math.random() * 10000}${fileExt}`;
                console.log('生成唯一文件名objectKey', objectKey);
                const params = {
                    'key': objectKey,
                    'policy': policy,
                    'OSSAccessKeyId': accessKeyId,
                    'success_action_status': '200',
                    'Signature': signature,
                    'x-oss-security-token': securityToken,
                };
                // 返回 Promise 对象
                Taro.uploadFile({
                    url: ossServiceDomain,
                    filePath: file.path,
                    name: 'file',
                    formData: params,
                    success(res) {
                        console.log("文件上传成功", res);
                        Taro.hideLoading();
                        let fileUrl = ossServiceDomain + '/' + params.key;
                        console.log('上传成功的文件url', fileUrl);
                        // setFormListData(index, 'resumeUrl', fileUrl);
                        // setFormListData(index, 'resumeName', file.name);

                        getUploadInfo(fileUrl, file.name);
                        setResumeSrc(fileUrl);
                        setResumeCurrentName(file.name);
                    },
                    fail(err) {
                        console.log('文件上传失败:', err);
                    }
                });
            }
        } catch (e) { }
    };

    const previewResume = (_url) => {
        wx.downloadFile({
            url: _url, // 文件服务器地址（需配置合法域名）
            success: (res) => {
                wx.openDocument({
                    filePath: res.tempFilePath, // 临时文件路径
                    showMenu: true, // 显示右上角菜单（分享、保存等）
                    success: () => console.log("打开文档成功"),
                    fail: (err) => console.error("打开失败", err)
                });
            },
            fail: (err) => console.error("下载失败", err)
        });
    }

    const deleteResumeFunc = () => {
        setResumeSrc('');
        setResumeCurrentName('');
        deleteResume();
    }

    return (
        <View className='upload_resume project_item_border'>
            <View className='upload_resume_title'>上传简历</View>
            {
                !resumeSrc &&
                <>
                    <View className='upload_resume_subTitle'>支持pdf、word，文件大小不超过4M</View>
                    <View className='upload_resume_btn' onClick={() => uploadResume()}>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon92.webp`}></Image>
                        <View>选择文件</View>
                    </View>
                </> ||
                <View className='upload_resume_info'>
                    <View className='upload_resume_info_left'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon9${resumeCurrentName.includes('.pdf') ? '4' : '3'}.webp`}></Image>
                        <View>{resumeCurrentName}</View>
                    </View>
                    <View className='upload_resume_info_right'>
                        <View className='upload_resume_info_right_btn' onClick={() => previewResume(resumeSrc)}>预览</View>
                        <Image onClick={deleteResumeFunc} src={`${Taro.$cdnUrl}/index/index_icon95.webp`}></Image>
                    </View>
                </View>
            }
        </View>

    );
});

export default inject('store')(UploadResume);
