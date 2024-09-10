
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