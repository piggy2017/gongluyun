/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-17 15:26:29
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { decryptData, encryptData } from '@/util/crypto'
import Navbar from '@/components/navbar';
import './index.scss'

import { contractsSign, getUserInfoByPhone, qrSign } from '@/util/api'


const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { isLogin, userInfo, setRole, companyInfo },
        businessStore: { workerJobInfo, setWorkerJobInfo },
    } = store
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const [formData, setFormData] = useState({});
    const [fromAll, setFromAll] = useState(false);
    const [recruitNames, setRecruitNames] = useState([]);

    const getQueryString = (url) => {
        url = url.replace(/\s*/g, "");

        let itemArr = [];
        let itemObj = {};

        url
            .substring(url.lastIndexOf("?") + 1, url.length)
            .split("&")
            .map((item) => {
                itemArr.push(item.split("="));
            });
        itemArr.map((item) => {
            itemObj[item[0]] = item[1];
        });
        return itemObj;
    }

    useEffect(() => {
        setRole('SEEK');
        Taro.setStorageSync('role', 'SEEK');
        return () => {
            setWorkerJobInfo({});
        }
    }, [])

    useEffect(() => {
        console.log("routerrouter", router);
        console.log("userInfo——isLogin", userInfo, isLogin);
        const date = new Date();

        const year = date.getFullYear();       // 获取当前年份
        const month = date.getMonth() + 1;     // 获取当前月份（从 0 开始，需要 +1）
        const day = date.getDate();            // 获取当前日期

        let interviewDate = `${year}-${month}-${day}`

        const { q } = router.params;
        console.log("q", q);
        let _q = decodeURIComponent(q);
        console.log("q", _q);
        const { title, recruitSerialCode, isAll, list } = getQueryString(_q);   // isAll 是否是项目管理中的全部岗位 list 二维码中的岗位列表
        if (isAll) {
            setFromAll(true);
            let _list = JSON.parse(list).map(item => item.title);
            setRecruitNames(_list);
        }

        console.log("title", title, "recruitSerialCode", recruitSerialCode, "isAll", "list", list);
        // setFormData({ ...formData, title, interviewDate });
        if (isLogin) {
            console.log("请求参数:phone", decryptData(userInfo.phone), "recruitSerialCode", recruitSerialCode);
            getUserInfoByPhone({ phone: decryptData(userInfo.phone), recruitSerialCode }).then(res => {
                console.log("getUserInfoByPhone_res", res);
                const { code, data } = res;
                if (code === 200 && data) {
                    console.log("存在用户信息");
                    const { phone, name, sex, idCardNo } = data;
                    setFormData({
                        ...formData,
                        phone: decryptData(userInfo.phone),
                        name,
                        sex,
                        idCardNo,
                        title: title,
                        interviewDate
                    });
                } else {
                    console.log("不存在用户信息");
                    setFormData({ ...formData, title: title, interviewDate });
                    Taro.showToast({ title: '您未报名该岗位,无法完成签到.', icon: 'none' });
                }
            })
        } else {
            setFormData({ ...formData, title: title, interviewDate });
        }
    }, [userInfo, isLogin])

    const signFunc = async () => {
        const { q } = router.params;
        console.log("q", q);
        let _q = decodeURIComponent(q);
        console.log("q", _q);
        const { title, recruitSerialCode, isAll, list } = getQueryString(_q);

        Taro.showLoading({ title: '签到中...' });
        if (formData.idCardNo && formData.idCardNo.length != 18) {
            return Taro.showToast({ title: '请输入18位身份证号码', icon: 'none' });
        }
        let params = {
            ...formData,
            // recruitSerialCode: isAll ? workerJobInfo.recruitSerialCode : recruitSerialCode   // isAll 是否是项目管理中的全部岗位
        }
        if (isAll) {  // isAll 是否是项目管理中的多个岗位列表的二维码
            let _list = JSON.parse(list).map(item => item.recruitSerialCode);
            params.recruitSerialCodes = _list;
        } else {
            params.recruitSerialCode = recruitSerialCode;
        }
        console.log("signFunc_params", params);
        Taro.hideLoading();
        const { code, msg } = await qrSign({ ...params });
        Taro.hideLoading();
        console.log("signFunc_code", code, msg);
        if (code === 200) {
            Taro.showToast({ title: '签到成功', icon: 'none' });
            Taro.navigateTo({
                url: `/pages/signInPackage/signSuccess/index?title=${recruitNames.length == 1 ? recruitNames[0] : recruitNames[0] + '等' + recruitNames.length + '个岗位'}&interviewDate=${formData.interviewDate}`
            })
            if (!isAll) {
                Taro.navigateTo({
                    url: `/pages/signInPackage/signSuccess/index?title=${title}&interviewDate=${formData.interviewDate}`
                })
            }
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    // const goChooseJob = () => {
    //     Taro.navigateTo({
    //         url: `/pages/signInPackage/${isLogin ? 'chooseJob' : 'signLogin'}/index`
    //     });
    // }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='扫码签到'></Navbar>

            <View className='employee_group'>
                {
                    (isLogin === 1) &&
                    <>
                        <View className='employee_item'>
                            <View className='employee_item_label'>手机号码</View>
                            <Input
                                disabled
                                type='number'
                                maxlength='11'
                                className='employee_item_input'
                                placeholder='请输入手机号码'
                                placeholderStyle='color: #999999;'
                                value={formData.phone}
                                onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}></Input>
                        </View>
                        <View className='employee_item'>
                            <View className='employee_item_label'>姓名</View>
                            <Input
                                className='employee_item_input'
                                placeholder='请输入员工姓名'
                                placeholderStyle='color: #999999;'
                                value={formData.name}
                                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}></Input>
                        </View>

                        <View className='employee_item'>
                            <View className='employee_item_label'>性别</View>
                            <View className='employee_item_right'>
                                <View onClick={() => setFormData({ ...formData, sex: 0 })} className={`option_item ${formData.sex === 0 ? 'option_item_active' : ''}`}>男</View>
                                <View onClick={() => setFormData({ ...formData, sex: 1 })} className={`option_item ${formData.sex === 1 ? 'option_item_active' : ''}`}>女</View>
                            </View>
                        </View>

                        <View className='employee_item'>
                            <View className='employee_item_label'>身份证号</View>
                            <Input
                                type='idcard'
                                className='employee_item_input'
                                maxlength='18'
                                placeholder='请输入身份证号'
                                placeholderStyle='color: #999999;'
                                value={formData.idCardNo}
                                onInput={(e) => setFormData({ ...formData, idCardNo: e.detail.value })}></Input>
                        </View>
                    </>
                }

                {
                    !fromAll &&
                    <View className='employee_item'>
                        <View className='employee_item_label'>报名岗位</View>
                        <Input
                            disabled
                            className='employee_item_input'
                            placeholder='报名岗位'
                            placeholderStyle='color: #999999;'
                            value={formData.title}
                            onInput={(e) => setFormData({ ...formData, title: e.detail.value })}></Input>
                    </View> ||
                    <View className='employee_item'>
                        <View className='employee_item_label'>报名岗位</View>
                        <View className='employee_item_right'>
                            <View className='employee_item_right_a'>
                                {
                                    recruitNames.map((item, index) => {
                                        return (
                                            <Text key={index}>{item}</Text>
                                        )
                                    })
                                }
                            </View>
                            <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                        </View>
                    </View>
                }

                <View className='employee_item'>
                    <View className='employee_item_label'>面试日期</View>
                    <Input
                        disabled
                        className='employee_item_input'
                        placeholder='面试日期'
                        placeholderStyle='color: #999999;'
                        value={formData.interviewDate}
                        onInput={(e) => setFormData({ ...formData, interviewDate: e.detail.value })}></Input>
                </View>
            </View>

            {
                !isLogin &&
                <View className='login_btn' onclick={() => Taro.navigateTo({ url: '/pages/signInPackage/signLogin/index' })}>登录并签到</View> ||
                <View className='login_btn' onclick={signFunc}>确认是我并签到</View>
            }
        </View>
    )
})

export default inject('store')(Index)
