/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:09:50
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-17 10:08:02
 * @Description: 用于存放用户的相关信息
 */

import {
    observable
} from 'mobx'
import { userCenter } from '@/util/api'
import Taro from '@tarojs/taro';
const userStore = observable({
    role: Taro.getStorageSync('role') ? Taro.getStorageSync('role') : 'ADMIN', // 管理员:ADMIN  客服:CUSTOMER  驻场:ON_SITE  SEEK:求职者 SUPPLIER:供应商
    token: Taro.getStorageSync('token') ? Taro.getStorageSync('token') : '',
    isLogin: Taro.getStorageSync('isLogin') ? Taro.getStorageSync('isLogin') : 0, //1已登陆0未登陆,         // 1 已登陆   0 未登陆
    companyVerified: false, // true 已实名认证  false 未实名认证
    userInfo: Taro.getStorageSync('userInfo') ? Taro.getStorageSync('userInfo') : '',
    companyInfo:Taro.getStorageSync('companyInfo') ? Taro.getStorageSync('companyInfo') : '',
    refreshUserInfo(){     // 统一刷新用户信息
        userCenter({}).then(res=>{
            console.log("refreshUserInfo用户信息res:", res);
            if (res?.code === 200) {
                userStore.userInfo = res?.data?.userInfo;
                Taro.setStorageSync('userInfo', res?.data?.userInfo);
                userStore.companyInfo=res?.data;
                userStore.role=res?.data?.userInfo.userRole;
                Taro.setStorageSync('role', res?.data?.userInfo.userRole);
                Taro.setStorageSync('companyInfo', res.data);
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
