/*
 * @Author: 
 * @Date: 2024-01-24 18:11:08
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-16 17:44:15
 * @FilePath: /apu_mini/src/util/request.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Taro from '@tarojs/taro';
import userStore from '@/store/user'
import {
    API_BASE_URL
} from './api'

export default async function request(url, data, method = 'GET', header = {}) {
    const {
        token,
        setToken,
        setIsLogin
    } = userStore
    const role = Taro.getStorageSync('role')
    const {
        brand
    } = Taro.getSystemInfoSync()

    const res = await Taro.request({
        url,
        data,
        method,
        header: {
            accessToken: token,
            channel: brand,
            appid: 'wxf653f23600828801',
            userRole: role,
            ...header
        },
    })

    if (res.statusCode !== 200) {
        const e = new Error(`HTTP ${res.statusCode}`);
        e.type = 'http';
        throw e
    }
    const body = res.data || {}
    if (body.code === 7001 || body.code === 7002) {
        setIsLogin(0);
        setToken('')
        Taro.showToast({
            title: '请登录~',
            icon: 'none'
        })
        const pages = Taro.getCurrentPages()
        const route = pages[pages.length - 1]?.route // 栈顶才是当前页
        if (route !== 'pages/supplierProject/index') {
            Taro.redirectTo({
                url: '/pages/launch/index'
            })
        }
        const e = new Error('unauthorized');
        e.type = 'auth';
        throw e
    }
    if (body.code !== 200) {
        if (body.showMsg) Taro.showToast({
            title: body.showMsg,
            icon: 'none'
        })
        const e = new Error(body.showMsg || '业务处理失败')
        e.type = 'business';
        e.code = body.code;
        e.data = body.data
        throw e
    }
    return body
}
