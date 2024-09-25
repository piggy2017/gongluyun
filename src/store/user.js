/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:09:50
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-25 14:36:37
 * @Description: 用于存放用户的相关信息
 */

import {
    observable
} from 'mobx'
import Taro from '@tarojs/taro';
const userStore = observable({
    role: 'admin',    // 管理员:admin  客服:service  驻场:onSite
    token: '',
    isLogin: 0,         // 1 已登陆   0 未登陆
    authentication: 1,  // 1 已实名认证  0 未实名认证
    userInfo: {},
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
        userStore.isLogin = value
    },
    setUserInfo(value) {
        userStore.userInfo = value
    },
    filterJobTypes:[],    // 筛选的职位类型
    setFilterJobTypes(value) {
        userStore.filterJobTypes = value
    }
});

export default userStore
