/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 11:44:14
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-22 15:57:20
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Block, Text, Input } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { encryptData } from '@/util/crypto'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import './index.scss'

import { getMemberInfo, companyDisableAccount, companyUpdateMember } from '@/util/api'

const Index = observer(({ store }) => {
    const router = useRouter();
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { role, companyInfo, getRoleAndPermissionFunc },
    } = store
    const [currentInfo, setCurrentInfo] = useState({});
    const [showEditModel, setShowEditModel] = useState(false);   // 修改密码的弹窗
    const [ispassword, setIsPassword] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [surePassword, setSurePassword] = useState('');

    useEffect(() => {
        getRoleAndPermissionFunc();
    }, [])

    useDidShow(() => {
        getUserInfo();
    })

    const getUserInfo = async () => {
        const { userSerialCode } = router.params;
        const { code, data, msg } = await getMemberInfo({ userSerialCode });
        console.log("code", code, "data", data, "msg", msg);
        if (code === 200) {
            if (data.permission?.length > 0) {
                data.permissionNames = data.permission.map((item) => {
                    return item.permName
                }).join('、');
            } else {
                data.permissionNames = '暂无权限'
            }
            setCurrentInfo(data);
        }
    }

    const validatePassword = password => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    }

    const editOpen = async (_type) => {
        if (currentInfo.roleId === '1') {
            return Taro.showToast({ title: '管理员账号不能禁用', icon: 'none', })
        }
        let params = {
            companySerialCode: companyInfo.companySerialCode,
            userSerialCode: currentInfo.userSerialCode,
            status: _type
        }
        const { code, data, msg } = await companyDisableAccount(params);
        console.log("code", code, "data", data, "msg", msg);
        if (code === 200) {
            Taro.showToast({ title: '修改成功', icon: 'none' });
            setCurrentInfo(currentInfo => {
                currentInfo.status = _type;
                console.log("currentInfo", currentInfo);
                return currentInfo
            })
            forceUpdate();
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const savePasswordFunc = async () => {
        if (!validatePassword(newPassword)) {
            return Taro.showToast({ title: '密码无效，需至少8位且包含字母和数字', icon: 'none', })
        }
        if (newPassword !== surePassword) {
            return Taro.showToast({ title: '两次密码输入不一致', icon: 'none', })
        }

        let params = {
            // ...currentInfo,
            companySerialCode: companyInfo.companySerialCode,
            userSerialCode: currentInfo.userSerialCode,
            password: encryptData(newPassword)
        }
        Taro.showLoading({ title: '提交中...', mask: true });
        const { code, data, msg } = await companyUpdateMember(params);
        console.log("修改密码结果", code, data);
        if (code === 200) {
            Taro.showToast({ title: '修改成功', icon: 'none' });
            setShowEditModel(false);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const goEdit = () => {
        const { userSerialCode } = router.params;
        Taro.navigateTo({ url: `/pages/minePackage/editEmployee/index?userSerialCode=${userSerialCode}` });
    }


    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title=''></Navbar>

            <View className='container_bg'>
                <View className='infos_wrap'>
                    <Image src={currentInfo.avatar} className='avatar'></Image>
                    <View className='names'>
                        <View className='name'>{currentInfo.name}</View>
                        <View className='time'>在职时间：{currentInfo.createTime}</View>
                    </View>
                    <View className='info_title'>账号信息</View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon17.webp`}></Image>
                        <View className='info_item_label'>手机号码</View>
                        <View className='info_item_value'>{currentInfo.phone}</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon18.webp`}></Image>
                        <View className='info_item_label'>角色</View>
                        <View className='info_item_value'>{currentInfo.roleName}</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon19.webp`}></Image>
                        <View className='info_item_label'>权限</View>
                        <View className='info_item_value'>{currentInfo.permissionNames}</View>
                    </View>
                </View>
            </View>

            <View className='detail_btns'>
                <View className='btns_wrap'>
                    {
                        currentInfo.status == '0' ? <View className='btn disable_btn' onClick={() => editOpen('1')}>禁用</View> : <View onClick={() => editOpen('0')} className='btn open_btn'>启用</View>
                    }

                    <View className='btn upload_password' onClick={() => { setShowEditModel(true) }}>修改密码</View>
                    <View className='btn edit_btn' onClick={goEdit}>编辑</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>


            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showEditModel} onClose={() => { setShowEditModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>修改密码</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowEditModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                <View className='employee_group'>
                                    <View className='employee_item'>
                                        <View className='employee_item_label'>新密码</View>
                                        <Input
                                            password={ispassword}
                                            className='employee_item_input'
                                            placeholder='新密码不低于8位，包含字母和数字'
                                            placeholderStyle='color: #999999;'
                                            value={newPassword}
                                            onInput={(e) => setNewPassword(e.detail.value)}></Input>
                                        <Image onClick={() => setIsPassword(!ispassword)} src={`${Taro.$cdnUrl}/index/index_eye.webp`}></Image>
                                    </View>
                                    <View className='employee_item'>
                                        <View className='employee_item_label'>确认密码</View>
                                        <Input
                                            password={ispassword}
                                            className='employee_item_input'
                                            placeholder='新密码不低于8位，包含字母和数字'
                                            placeholderStyle='color: #999999;'
                                            value={surePassword}
                                            onInput={(e) => setSurePassword(e.detail.value)}></Input>
                                        <Image onClick={() => setIsPassword(!ispassword)} src={`${Taro.$cdnUrl}/index/index_eye.webp`}></Image>
                                    </View>
                                </View>

                                <View onClick={() => savePasswordFunc()} className={`save_btn ${(newPassword.length >= 8 && surePassword.length >= 8) ? 'save_btn_active' : ''}`}> 保存</View>
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
