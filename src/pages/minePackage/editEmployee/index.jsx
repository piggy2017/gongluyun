/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-13 10:10:21
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import { decryptData, encryptData } from '@/util/crypto'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'

import { getMemberInfo, companyUpdateMember } from '@/util/api'


const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { companyInfo, role, permissions },
        businessStore: { employeeInfo, setEmployeeInfo, onSiteProjectList, setOnSiteProjectList },
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
        getUserInfo();
        () => {
            console.log("卸载 useEffect");
            setOnSiteProjectList([]);
        }
    }, [])

    const getUserInfo = async () => {
        const { userSerialCode } = router.params;
        const { code, data, msg } = await getMemberInfo({ userSerialCode });
        console.log("code", code, "data", data, "msg", msg);
        if (code === 200) {
            data.authority = data.permission ? data.permission.map(item => item.permName) : [];
            data.permIds = data.permIds ? data.permIds.split(',') : [];
            setFormData(data);
            console.log("permissions_permissions", permissions);
            if (data.contractsSerialCodes?.length > 0) {
                setOnSiteProjectList(data.contractsSerialCodes);
            }else{
                setOnSiteProjectList([]);
            }

            if (permissions.length > 0) {
                const _list = JSON.parse(JSON.stringify(permissions));
                for (let i = 0; i < _list.length; i++) {
                    for (let j = 0; j < _list[i].childPerms.length; j++) {
                        if (data.permIds.indexOf(_list[i].childPerms[j].permId) > -1) {
                            _list[i].childPerms[j].selected = true;
                        }
                    }
                }
                console.log("_listsetPermissionList", _list);
                setPermissionList(_list);
            }
        }
    }


    const choosePerssion = (obj, index, idx) => {
        console.log("choosePerssion obj, index", obj, index);
        setPermissionList(permissionList => {
            if (obj.selected) {
                permissionList[index].childPerms[idx].selected = false;
            } else {
                permissionList[index].childPerms[idx].selected = true;
            }
            console.log("permissionList", permissionList);
            return permissionList;
        })
        forceUpdate();
    }

    const submitPermission = () => {
        let _permIds = [];
        let _permNames = [];
        let _permission = [];
        for (let i = 0; i < permissionList.length; i++) {
            for (let j = 0; j < permissionList[i].childPerms.length; j++) {
                if (permissionList[i].childPerms[j].selected) {
                    _permIds.push(permissionList[i].childPerms[j].permId);
                    _permNames.push(permissionList[i].childPerms[j].permName);
                    _permission.push(permissionList[i].childPerms[j]);
                }
            }
        }
        setFormData({ ...formData, permission: _permission, authority: _permNames, permIds: _permIds });
        setShowLimitModel(false);
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

        if (params.roleId == '3') {
            params.contractsSerialCodes = onSiteProjectList;
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
                        disabled
                        maxlength='11'
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
                    <View className='employee_item_right' onClick={() => {
                        if (formData.roleId === '1') {
                            return Taro.showToast({ title: '管理员账号不能变更角色', icon: 'none', });
                        }
                        setShowRoleModel(true)
                    }}>
                        <View className={`${formData.roleId ? 'option_item_active' : 'option_item_text'}`}>{formData.roleId ? formData.roleName : '请选择'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>权限</View>
                    <View className='employee_item_right' onClick={() => {
                        if (formData.roleId === '1') {
                            return Taro.showToast({ title: '管理员账号不能变更权限', icon: 'none', });
                        }
                        setShowLimitModel(true)
                    }}>
                        <View className={`${(formData.authority && formData.authority.length > 0) ? 'option_item_active' : 'option_item_text'}`}>{(formData.authority && formData.authority.length > 0) ? formData.authority.join('·') : '请选择'}</View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                {
                    formData.roleId == '3' &&  // 驻场
                    <View className='employee_item'>
                        <View className='employee_item_label'>绑定项目</View>
                        <View className='employee_item_right' onClick={() => {
                            Taro.navigateTo({ url: `/pages/newPackage/onSiteProject/index?type=1` })
                        }}>
                            <View className={`option_item_onsite ${onSiteProjectList.length > 0 ? 'option_item_active' : 'option_item_text'} }`}>
                                {onSiteProjectList.length === 0 ? '请选择' : '已选·' + onSiteProjectList.length}
                            </View>
                            <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                        </View>
                    </View>
                }
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
                                <View>选择权限</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowLimitModel(false) }}></AtIcon>
                            </View>
                            <View className='permission_wrapper_content'>
                                {
                                    permissionList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item.selected ? 'filter_wrapper_item_active' : ''}`}
                                            >
                                                <View className='permission_title'>{item.permName}</View>
                                                <View className='permission_wrap'>
                                                    {
                                                        permissionList[index].childPerms.map((child, idx) => {
                                                            return (
                                                                <View onClick={() => choosePerssion(child, index, idx)} className={`permission_item ${child.selected ? 'permission_item_active' : ''}`} key={idx}>{child.permName}</View>
                                                            )
                                                        })
                                                    }
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                            <View className='sure_btn' onClick={() => { submitPermission() }}>确定</View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
