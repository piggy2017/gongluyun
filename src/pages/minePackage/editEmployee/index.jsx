/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-07 17:05:14
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import { decryptData, encryptData } from '@/util/crypto'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'

import { companyUpdateMember } from '@/util/api'


const Index = observer(({ store }) => {
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { companyInfo, roles, permissions },
        businessStore: { employeeInfo, setEmployeeInfo }
    } = store
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const [formData, setFormData] = useState({});

    const [showRoleModel, setShowRoleModel] = useState(false);
    const [roleList, setRoleList] = useState([
        { roleId: '2', roleName: '客服' },
        { roleId: '3', roleName: '驻场' }
    ]);
    const [permissionList, setPermissionList] = useState([]);
    const [showLimitModel, setShowLimitModel] = useState(false);

    useEffect(() => {
        console.log("编辑员工信息 - employeeInfo", employeeInfo);
        if (employeeInfo) {
            let _obj = { ...employeeInfo };
            _obj.permIds = _obj.permIds.split(',');
            _obj.authority = _obj.permission.map(item => item.permName);
            setFormData(_obj);
        }
    }, [employeeInfo])

    useEffect(() => {
        if (permissions.length > 0) {
            const _list = permissions.map(item => {
                return { ...item, selected: false }
            })
            let _permIds = [];
            if (employeeInfo) {
                _permIds = employeeInfo.permIds.split(',');
            }
            for (let i = 0; i < _list.length; i++) {
                if (_permIds.indexOf(_list[i].permId) > -1) {
                    _list[i].selected = true;
                }
            }
            console.log("_listsetPermissionList", _list);
            setPermissionList(_list);
        }
    }, [permissions])

    const choosePerssion = (obj, index) => {
        console.log("choosePerssion obj, index", obj, index);
        setPermissionList(permissionList => {
            if (obj.selected) {
                permissionList[index].selected = false;
            } else {
                permissionList[index].selected = true;
            }
            console.log("permissionList", permissionList);
            let _list = permissionList.filter(item => item.selected === true)//.map(item => item.permName);
            console.log("_list1", _list);
            if (_list.length > 0) {
                let _list2 = _list.map(item => item.permName);
                console.log("_list2", _list2);
                let _permIds = _list.map(item => item.permId);
                setFormData({ ...formData, permission: _list, authority: _list2, permIds: _permIds });
            }
            return permissionList;
        })
        forceUpdate();
    }


    const submitFunc = async () => {
        let params = {
            ...formData,
            companySerialCode: companyInfo.companySerialCode
        }
        console.log("params", params);
        const errorMessages = [
            !params.name && '员工姓名不能为空',
            !params.phone && '手机号码不能为空',
            !params.roleId && '请分配角色',
        ].filter(Boolean);

        if (errorMessages.length > 0) {
            return Taro.showToast({
                title: errorMessages[0],
                icon: 'none',
            })
        }
        params.permissionNames = formData.authority.join(',');
        Taro.showLoading({ title: '提交中...', mask: true });
        const { code, data, msg } = await companyUpdateMember(params);
        console.log("companyAddAccount", code, data);
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setEmployeeInfo({ ...formData });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 });
            }, 1500)
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='编辑员工'></Navbar>

            <View className='add_title'>账号信息</View>
            <View className='employee_group'>
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
                    <View className='employee_item_label'>手机号码</View>
                    <Input
                        type='number'
                        className='employee_item_input'
                        placeholder='请输入员工账户的手机号码'
                        placeholderStyle='color: #999999;'
                        value={formData.phone}
                        onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}></Input>
                </View>
            </View>
            <View className='add_title'>账号权限</View>
            <View className='employee_group_2'>
                <View className='employee_item'>
                    <View className='employee_item_label'>角色</View>
                    <View className='employee_item_right' onClick={() => { setShowRoleModel(true) }}>
                        <View className={`${formData.roleId ? 'option_item_active' : 'option_item_text'}`}>{formData.roleId ? formData.roleName : '请选择'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>权限</View>
                    <View className='employee_item_right' onClick={() => { setShowLimitModel(true) }}>
                        <View className={`${(formData.authority && formData.authority.length > 0) ? 'option_item_active' : 'option_item_text'}`}>{(formData.authority && formData.authority.length > 0) ? formData.authority.join('·') : '请选择'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
            </View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View onClick={() => submitFunc()} className={`post_btn ${(formData.name && formData.phone && formData.roleId) ? 'post_btn_active' : ''}`}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showRoleModel} onClose={() => { setShowRoleModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>选择角色</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowRoleModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    roleList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item.roleId === formData.roleId ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => {
                                                    setFormData({ ...formData, roleId: item.roleId, roleName: item.roleName });
                                                    setTimeout(() => {
                                                        setShowRoleModel(false)
                                                    }, 300);
                                                }}
                                            >{item.roleName}</View>
                                        )
                                    })
                                }
                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>

            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showLimitModel} onClose={() => { setShowLimitModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>选择角色</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowLimitModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    permissionList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item.selected ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => choosePerssion(item, index)}
                                            >{item.permName}</View>
                                        )
                                    })
                                }
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
