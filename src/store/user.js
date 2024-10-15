/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:09:50
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-15 14:02:44
 * @Description: 用于存放用户的相关信息
 */

import {
    observable
} from 'mobx'
import Taro from '@tarojs/taro';
const userStore = observable({
    role: Taro.getStorageSync('role') ? Taro.getStorageSync('role') : 'ADMIN', // 管理员:ADMIN  客服:CUSTOMER  驻场:ON_SITE  SEEK:求职者 SUPPLIER:供应商
    token: Taro.getStorageSync('token') ? Taro.getStorageSync('token') : '',
    isLogin: Taro.getStorageSync('isLogin') ? Taro.getStorageSync('isLogin') : 0, //1已登陆0未登陆,         // 1 已登陆   0 未登陆
    authentication: 0, // 1 已实名认证  0 未实名认证
    userInfo: Taro.getStorageSync('userInfo') ? Taro.getStorageSync('userInfo') : '',
    setAuthentication(value) {
        userStore.authentication = value
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
