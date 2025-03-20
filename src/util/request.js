/*
 * @Author: yinzhengchao yinzhengchao@apujiyu.com
 * @Date: 2024-01-24 18:11:08
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-20 09:42:12
 * @FilePath: /apu_mini/src/util/request.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Taro from '@tarojs/taro';
import userStore from '@/store/user'
import {
    API_BASE_URL
} from './api'

export default function request(url, data, method, header) {
    let {
        token,
        setToken,
        setRole,
        setIsLogin,
    } = userStore
    let {
        brand
    } = Taro.getSystemInfoSync(); //手机厂商
    // if (!token) {
    //     setIsLogin(0)
    //     setToken('')
    //     setRole('ADMIN')
    // }
    //获取小程序终端信息
    header = {
        accessToken: token, //token,
        channel: brand,
        appid:'wx2db45616d470ac07'
    }
    return new Promise((resolve, reject) => {
        Taro.request({
            url: url,
            data: data,
            method: method,
            header: header,
            success: function (res) {
                if (res.statusCode == 200) {
                    resolve(res.data);
                    if (res.data.code !== 200 && url.includes(API_BASE_URL)) {
                        Taro.hideLoading()
                        if (res.data.showMsg) {
                            Taro.showToast({
                                title: res.data.showMsg,
                                icon: 'none'
                            })
                        }
                    }
                    if (res.data.code == 7001 || res.data.code == 7002) {
                        console.log("==========================请求失效===========================", res);
                        return
                        setIsLogin(0)
                        setToken('')
                        setRole('ADMIN')
                        Taro.showToast({
                            title: '请登录~',
                            icon: 'none'
                        })
                        const pages = Taro.getCurrentPages();
                        console.log("当前页面", pages[0].route)
                        Taro.redirectTo({
                            url: '/pages/launch/index',
                        })
                        return
                    }
                } else {
                    Taro.hideLoading()
                    console.log(res.errMsg, 'code res.errMsg')
                    reject(res.errMsg);
                    Taro.showToast({
                        title: "请求超时，请检查网络后重试",
                        icon: "none"
                    })
                }
            },
            fail: function (err) {
                Taro.hideLoading()
                console.log(url, err, 'statusCode 打印错误日志')
                Taro.showToast({
                    title: "请求超时，请检查网络后重试",
                    icon: "none"
                })
                resolve(err)
            }
        })
    })
}
