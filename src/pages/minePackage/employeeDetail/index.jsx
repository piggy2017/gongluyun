/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 11:44:14
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-31 17:50:22
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'

import Navbar from '@/components/navbar';
import './index.scss'

import { companyDisableAccount } from '@/util/api'

const Index = observer(({ store }) => {
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { companyInfo,getRoleAndPermissionFunc },
        businessStore: { employeeInfo, setEmployeeInfo }
    } = store
    const [currentInfo, setCurrentInfo] = useState({});

    useEffect(()=>{
        getRoleAndPermissionFunc();
    },[])

    useEffect(() => {
        console.log("employeeInfo", employeeInfo);
        // setCurrentInfo(employeeInfo);
        let _obj = { ...employeeInfo }
        if (_obj.permission?.length > 0) {
            _obj.permissionNames = _obj.permission.map((item) => {
                return item.permName
            }).join('、');
        }
        console.log("_obj_obj", _obj);
        setCurrentInfo(_obj);
    }, [employeeInfo])

    const editOpen = async (_type) => {
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

    const goEdit = () => {
        setEmployeeInfo(currentInfo);
        Taro.navigateTo({ url: '/pages/minePackage/editEmployee/index' });
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

                    <View className='btn upload_password'>修改密码</View>
                    <View className='btn edit_btn' onClick={goEdit}>编辑</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
