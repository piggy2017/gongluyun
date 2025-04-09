/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:09:50
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-09 16:47:08
 * @Description: 用于存放用户的相关信息
 */

import {
    observable
} from 'mobx'
import {
    userCenter,
    getRoleAndPermission,
    getRoleAndPermissionByUserId,
    checkSupplier,
    getTemplateIds
} from '@/util/api'
import Taro from '@tarojs/taro';
const userStore = observable({
    role: Taro.getStorageSync('role') ? Taro.getStorageSync('role') : '', // SUPPLIER   SEEK    // 管理员:1-ADMIN  客服:2-CUSTOMER  驻场:3-ON_SITE  SEEK:5-求职者 SUPPLIER:4-供应商  6-CHANNEL 渠道
    token: Taro.getStorageSync('token') ? Taro.getStorageSync('token') : '',
    //token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTgwMzEzMzQ0NyIsInVzZXJfa2V5IjoiNzgzMWRkYjUtNTg3Zi00YTZmLWI1ZDItNmUyYTU2ODg2YmQ3IiwiZXhwIjoxNzMzODE0Nzk4fQ.oZQl--OZIcqUbjmqvrIZpCsOfmKWL6X5Xe5b_aJUQfA',    // Taro.getStorageSync('token') ? Taro.getStorageSync('token') : '',
    isLogin: Taro.getStorageSync('isLogin') ? Taro.getStorageSync('isLogin') : 0, // 1已登陆 0未登陆,         // 1 已登陆   0 未登陆
    companyVerified: false, // true 已实名认证  false 未实名认证
    userInfo: Taro.getStorageSync('userInfo') ? Taro.getStorageSync('userInfo') : '',
    companyInfo: Taro.getStorageSync('companyInfo') ? Taro.getStorageSync('companyInfo') : '',
    userRoles: Taro.getStorageSync('userRoles') ? Taro.getStorageSync('userRoles') : [], // 用户所拥有的公司下面的所有角色列表
    
    refreshUserInfo(callback) { // 统一刷新用户信息
        userCenter({}).then(res => {
            console.log("refreshUserInfo用户信息res:", res);
            if (res?.code === 200) {
                userStore.userInfo = res?.data?.userInfo;
                Taro.setStorageSync('userInfo', res?.data?.userInfo);
                userStore.companyInfo = res?.data;
                userStore.companyVerified = res?.data?.companyVerified;
                // userStore.role = res?.data?.userInfo.userRole;
                // Taro.setStorageSync('role', res?.data?.userInfo.userRole);
                Taro.setStorageSync('companyInfo', res.data);
                if(res.data.userInfo.roles){
                    userStore.userRoles = res?.data?.userInfo.roles.map(item=>{
                        if(item.roleName==='ADMIN'){
                            item.name='管理员'
                        }else if(item.roleName==='CUSTOMER'){
                            item.name='客服'
                        }else  if(item.roleName==='ON_SITE'){
                            item.name='驻场'
                        }else  if(item.roleName==='CHANNEL'){
                            item.name='渠道'
                        }
                        return item
                    })
                    Taro.setStorageSync('userRoles', res?.data?.userInfo.roles);
                }
                if (callback) {
                    callback(res);
                }
            }
        })
    },

    setUserRoles(value) {
        userStore.userRoles = value
    },

    subTemplates: [], // 用户的可订阅消息模板列表
    getSubTemplates() {
        getTemplateIds({}).then(res => {
            console.log("用户的可订阅消息模板列表getSubTemplates:", res)
            if (res.code === 200) {
                userStore.subTemplates = res.data;
            }
        })
    },


    roles: [ // 角色和角色id的对应关系
        {
            roleId: '1',
            roleName: '管理员',
        },
        {
            roleId: '2',
            roleName: '客服',
        },
        {
            roleId: '3',
            roleName: '驻场',
        },
        {
            roleId: '6',
            roleName: '渠道',
        },
    ],
    permissions: [], // 角色和权限的对应关系
    getRoleAndPermissionFunc() {
        getRoleAndPermission({}).then(res => {
            console.log("getRoleAndPermissionFunc", res);
            const {
                code,
                data: {
                    roles,
                    permissions
                }
            } = res;
            if (code === 200) {
                userStore.roles = roles.map(item => {
                    item.isSelected = false;
                    return item;
                })
                userStore.permissions = permissions;
            }
        })
    },

    myPermissions: [], // 当前用户所拥有的权限列表
    setMyPermissions() {
        getRoleAndPermissionByUserId({}).then(res => {
            const {
                code,
                data: {
                    permissions
                }
            } = res;
            if (code === 200) {
                userStore.myPermissions = permissions;
            }
        })
    },

    setCompanyVerified(value) {
        userStore.companyVerified = value
    },
    setRole(value) {
        userStore.role = value
    },
    setToken(value) {
        userStore.token = value
    },
    setIsLogin(value) {
        console.log("----- setIsLogin 登录状态已经被修改 ----", value)
        userStore.isLogin = value
    },
    setUserInfo(value) {
        userStore.userInfo = value
    },
    filterJobTypes: [], // 筛选的职位类型
    setFilterJobTypes(value) {
        userStore.filterJobTypes = value
    },

    supplierCompanyInfo: { // 供应商的公司信息
        companyVerified: false,
        logo: null,
        name: null,
        serialCode: null
    },
    getSupplierCompanyInfo(callback) { // 获取供应商信息
        checkSupplier({}).then(res => {
            userStore.supplierCompanyInfo = res.data;
            if (callback) callback(res.data);
        })
    },
    setSupplierCompanyInfo(value) {
        userStore.supplierCompanyInfo = value
    },

    enterParams: {}, // 求职者通过岗位分享进入到小程序的岗位详情页,携带的路由参数,进行上下级绑定
    setEnterParams: (obj) => {
        console.log("求职者通过岗位分享进入到小程序的岗位详情页,携带的路由参数,进行上下级绑定", obj);
        userStore.enterParams = obj;
    },
});

export default userStore
