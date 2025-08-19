/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-08-19 17:29:12
 * @Description: 
 */

import React, { useState, useEffect, useReducer } from 'react'
import Taro from '@tarojs/taro';
import { View, Image, Text, Input, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import { decryptData, encryptData } from '@/util/crypto'
import { throttle } from '@/util/utils'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import { companyAddAccount } from '@/util/api'
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { companyInfo, roles, permissions },
        businessStore: { onSiteProjectList, setOnSiteProjectList, siteObj, setSiteObj },
    } = store
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const [formData, setFormData] = useState({});
    const [ispassword, setIsPassword] = useState(true);

    const [showRoleModel, setShowRoleModel] = useState(false);
    const [roleList, setRoleList] = useState([]);

    const [chooseRoles, setChooseRoles] = useState([]);       // 当前选中的角色id

    const [permissionList, setPermissionList] = useState([]);

    const [showLimitModel, setShowLimitModel] = useState(false);

    useEffect(() => {
        console.log("permissionList发生改变,自动计算权限:", permissionList);
        submitPermission();
    }, [permissionList])


    useEffect(() => {
        console.log("rolesrolesroles", roles);
        if (roles?.length > 0) {
            setRoleList(roles);
            let _list = JSON.parse(JSON.stringify(roles));
            for (let i = 0; i < _list.length; i++) {
                _list[i].isSelected = false;
            }
            setRoleList(_list);
        }
    }, [roles])

    useEffect(() => {
        return () => {
            setOnSiteProjectList([]);
            setSiteObj([]);
        }
    }, [])

    useEffect(() => {
        console.log("permissions", permissions);
        if (permissions.length > 0) {
            const _list = JSON.parse(JSON.stringify(permissions));
            for (let i = 0; i < _list.length; i++) {
                for (let j = 0; j < _list[i].childPerms.length; j++) {
                    _list[i].childPerms[j].selected = false;
                }
            }
            setPermissionList(_list);
        }
    }, [permissions])

    const choosePerssion = (obj, index, idx) => {
        console.log("choosePerssion obj, index", obj, index);
        setPermissionList(permissionList => {
            if (obj.selected) {
                permissionList[index].childPerms[idx].selected = false;
            } else {
                permissionList[index].childPerms[idx].selected = true;
            }
            console.log("permissionList", permissionList);
            // let _list = permissionList.filter(item => item.selected === true)//.map(item => item.permName);
            // if (_list.length > 0) {
            //     let _list2 = _list.map(item => item.permName);
            //     let _permIds = _list.map(item => item.permId);
            //     setFormData({ ...formData, authority: _list2, permIds: _permIds });
            // }
            return permissionList;
        })
        forceUpdate();
    }

    const submitPermission = () => {
        let _permIds = [];
        // let _permNames = [];
        for (let i = 0; i < permissionList.length; i++) {
            for (let j = 0; j < permissionList[i].childPerms.length; j++) {
                if (permissionList[i].childPerms[j].selected) {
                    _permIds.push(permissionList[i].childPerms[j].permId);
                    // _permNames.push(permissionList[i].childPerms[j].permName);
                }
            }
        }
        setFormData({ ...formData, permIds: _permIds });  // authority: _permNames, 
        setShowLimitModel(false);
    }

    const validatePassword = password => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    }

    const submitFunc = throttle(async () => {
        console.log("chooseRoles", chooseRoles);
        console.log("roleList", roleList);

        let params = {
            ...formData,
            companySerialCode: companyInfo.companySerialCode,
            roleIds: chooseRoles.map(item => item.roleId),
            deptIds: siteObj.length > 0 ? siteObj : [],
        }
        console.log("params", params);
        const errorMessages = [
            !params.name && '员工姓名不能为空',
            !params.phone && '手机号码不能为空',
            !params.password && '密码不能为空',
            !params.subPassword && '请再次输入密码',
            !params.roleIds.length && '请分配角色',
        ].filter(Boolean);
        if (errorMessages.length > 0) {
            return Taro.showToast({
                title: errorMessages[0],
                icon: 'none',
            })
        }

        if (params.roleIds.includes('3')) {  // 驻场
            params.contractsSerialCodes = onSiteProjectList;
        }

        if (params.phone.length != 11) {
            return Taro.showToast({ title: '无效手机号码', icon: 'none', })
        }
        if (!validatePassword(params.password)) {
            return Taro.showToast({ title: '密码无效，需至少8位且包含字母和数字', icon: 'none', })
        }
        if (params.password !== params.subPassword) {
            return Taro.showToast({ title: '两次密码输入不一致', icon: 'none', })
        }
        console.log("params        return_", params);
        // return
        Taro.showLoading({ title: '提交中...', mask: true });
        params.password = encryptData(params.password);
        if (formData.authority?.length > 0) {
            params.permissionNames = formData.authority.join(',');
        } else {
            params.permissionNames = '';
        }

        const { code, data, msg } = await companyAddAccount(params);
        Taro.hideLoading();
        console.log("companyAddAccount", code, data);
        if (code === 200) {
            Taro.showToast({ title: '提交成功', icon: 'none' });
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 });
            }, 1500)
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }, 200)

    const chooseRoleFunc = (obj, index) => {
        console.log("选择角色:", obj);
        if (obj.isSelected) {   // 取消选中
            setChooseRoles(chooseRoles => {
                let list = chooseRoles.filter(item => item.roleId !== obj.roleId);
                return list
            })
        } else {
            if (chooseRoles.length > 0) {
                let _hasAdmin = chooseRoles.some(item => item.roleId == '1');
                if (_hasAdmin || obj.roleId == '1') {
                    return Taro.showToast({ title: '管理员角色不能和其他角色一起选', icon: 'none', });
                }
            }
            if (obj.roleId != '1') {  // 非管理员角色,默认的权限模板
                setPermissionList(permissionList => {
                    for (let i = 0; i < permissionList.length; i++) {
                        for (let j = 0; j < permissionList[i].childPerms.length; j++) {
                            if (obj.defaultPermissions.includes(permissionList[i].childPerms[j].permId)) {
                                permissionList[i].childPerms[j].selected = true;
                            }
                        }
                    }
                    console.log("permissionList", permissionList);
                    submitPermission();
                    return permissionList;
                })
            }

            setChooseRoles(chooseRoles => {
                return [...chooseRoles, obj];
            })
        }
        setRoleList(list => {
            list[index].isSelected = !list[index].isSelected;
            return [...list];
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='新建员工'></Navbar>

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
                        maxlength='11'
                        className='employee_item_input'
                        placeholder='请输入员工账户的手机号码'
                        placeholderStyle='color: #999999;'
                        value={formData.phone}
                        onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}></Input>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>密码</View>
                    <Input
                        password={ispassword}
                        className='employee_item_input'
                        placeholder='长度不低于8位，包含字母和数字'
                        placeholderStyle='color: #999999;'
                        value={formData.password}
                        onInput={(e) => setFormData({ ...formData, password: e.detail.value })}></Input>
                    <Image onClick={() => setIsPassword(!ispassword)} src={`${Taro.$cdnUrl}/index/index_eye.webp`}></Image>
                </View>
                <View className='employee_item'>
                    <View className='employee_item_label'>确认密码</View>
                    <Input
                        password={ispassword}
                        className='employee_item_input'
                        placeholder='长度不低于8位，包含字母和数字'
                        placeholderStyle='color: #999999;'
                        value={formData.subPassword}
                        onInput={(e) => setFormData({ ...formData, subPassword: e.detail.value })}></Input>
                    <Image onClick={() => setIsPassword(!ispassword)} src={`${Taro.$cdnUrl}/index/index_eye.webp`}></Image>
                </View>
            </View>
            <View className='add_title'>账号权限</View>
            <View className='employee_group_2'>
                <View className='employee_item'>
                    <View className='employee_item_label'>站点</View>
                    <View className='employee_item_right' onClick={() => {
                        Taro.navigateTo({ url: '/pages/newPackage/setSite/index' })
                    }}>
                        <View className={`${siteObj.length > 0 ? 'option_item_active' : 'option_item_text'}`}>
                            {siteObj.length > 0 ? `已选${siteObj.length}个站点` : '请选择站点'}
                        </View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>

                <View className='employee_item'>
                    <View className='employee_item_label'>角色</View>
                    <View className='employee_item_right' onClick={() => { setShowRoleModel(true) }}>
                        <View className={`${chooseRoles.length > 0 ? 'option_item_active' : 'option_item_text'}`}>
                            {
                                chooseRoles.length === 0 && '请选择角色' ||
                                chooseRoles.map((item, index) => {
                                    return <Text key={index}>{item.roleName}{index == chooseRoles.length - 1 ? '' : ' '}</Text>
                                })
                            }
                        </View>
                        <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    </View>
                </View>
                {
                    !chooseRoles.some(item => item.roleId == '1') &&  // 非管理员账号才能选择权限
                    <View className='employee_item'>
                        <View className='employee_item_label'>权限</View>
                        <View className='employee_item_right' onClick={() => { setShowLimitModel(true) }}>
                            <View className={`${(formData.permIds?.length > 0) ? 'option_item_active' : 'option_item_text'}`}>{(formData.permIds && formData.permIds.length > 0) ? `已选${formData.permIds.length}个权限` : '请选择权限'}</View>
                            <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                        </View>
                    </View>
                }

                {
                    chooseRoles.length > 0 && chooseRoles.some(item => item.roleId == '3') &&  // 驻场
                    <View className='employee_item'>
                        <View className='employee_item_label'>绑定项目</View>
                        <View className='employee_item_right' onClick={() => {
                            Taro.navigateTo({ url: `/pages/newPackage/onSiteBindProject/index?type=1` })
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
                <View onClick={() => submitFunc()} className={`post_btn ${(formData.name && formData.phone && formData.password && formData.subPassword && chooseRoles.length > 0) ? 'post_btn_active' : ''}`}>保存</View>
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
                                                className={`filter_wrapper_item ${item.isSelected ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => chooseRoleFunc(item, index)}
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
                                <View></View>
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
        </View >
    )
})

export default inject('store')(Index)
