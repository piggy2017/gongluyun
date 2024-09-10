
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