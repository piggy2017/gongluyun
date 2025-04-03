/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-03-31 11:24:38
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-31 11:24:52
 * @Description: 
 */

import { decryptData } from './crypto'

//登陆环信
const LOGINHXIM = (Taro,hxUser) => {
    let { username, password } = hxUser
    Taro.WebIM.conn.open({
        user: username,
        pwd: decryptData(password),
    }).then(() => {
        console.log("login success");
    }).catch((reason) => {
        console.log("login fail", reason);
    });
}
export default LOGINHXIM