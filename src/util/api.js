/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 13:43:28
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-12 11:55:55
 * @Description: 
 */

import http from "./request"

// const env = 'test'
const env = 'prod'
const base = env === 'prod' ? 'https://api.apujiyu.com' : 'http://test.apujiyu.com'
const API_BASE_URL = base + "/mini"
// const API_BASE_URL_JOB = "https://testios.joymian.com/jobfly/order"
const CDN_BASE_URL = "https://apu-mini.oss-accelerate.aliyuncs.com"
const webSocketUrl = env === 'prod' ? "wss://im.apujiyu.com/websocket" : "ws://test.im.apujiyu.com/websocket"

export const jobTypeAllList = params => { //所有工种
    return http(API_BASE_URL + '/job/jobTypeAllList', params, "POST", { "Content-Type": "application/json" });
};
export const jobAssoc = params => { //岗位联想
    return http(API_BASE_URL + '/job/jobAssoc', params, "POST", { "Content-Type": "application/json" });
};
export const filterJobTypeList = params => {                     // 获取任务大厅对应的工种
    return http(API_BASE_URL + '/order/contracts/jobTypeList', params, "POST", { "Content-Type": "application/json" });
};
export const fetchOssConfig = params => { //获取oss校验
    return http(API_BASE_URL + '/upload/stsToken', params, "POST", { "Content-Type": "application/json" });
};