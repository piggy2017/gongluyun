/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:09:50
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-08 11:10:38
 * @Description: 用于存放用户的相关信息
 */

import {
    observable
} from 'mobx'
import {
    userCenter,
    getRoleAndPermission
} from '@/util/api'
import Taro from '@tarojs/taro';
const userStore = observable({
    role: Taro.getStorageSync('role') ? Taro.getStorageSync('role') : 'ADMIN', // 管理员:1-ADMIN  客服:2-CUSTOMER  驻场:3-ON_SITE  SEEK:5-求职者 SUPPLIER:4-供应商
    token: Taro.getStorageSync('token') ? Taro.getStorageSync('token') : '',
    isLogin: Taro.getStorageSync('isLogin') ? Taro.getStorageSync('isLogin') : 0, //1已登陆0未登陆,         // 1 已登陆   0 未登陆
    companyVerified: false, // true 已实名认证  false 未实名认证
    userInfo: Taro.getStorageSync('userInfo') ? Taro.getStorageSync('userInfo') : '',
    companyInfo: Taro.getStorageSync('companyInfo') ? Taro.getStorageSync('companyInfo') : '',
    refreshUserInfo() { // 统一刷新用户信息
        userCenter({}).then(res => {
            console.log("refreshUserInfo用户信息res:", res);
            if (res?.code === 200) {
                userStore.userInfo = res?.data?.userInfo;
                Taro.setStorageSync('userInfo', res?.data?.userInfo);
                userStore.companyInfo = res?.data;
                userStore.companyVerified= res?.data?.companyVerified;
                userStore.role = res?.data?.userInfo.userRole;
                Taro.setStorageSync('role', res?.data?.userInfo.userRole);
                Taro.setStorageSync('companyInfo', res.data);
            }
        })
    },

    roles: [],          // 角色和角色id的对应关系
    permissions: [],    // 角色和权限的对应关系
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
                userStore.roles = roles;
                userStore.permissions = permissions;
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
    }
});

export default userStore
