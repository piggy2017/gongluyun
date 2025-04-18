/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-01-10 09:38:02
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-14 15:58:30
 * @FilePath: /apu.mini/src/store/chat.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 本地管理会话列表
import {
    observable
} from 'mobx';
import Taro from '@tarojs/taro';
import {
    decryptData,
    encryptData
} from '@/util/crypto'
// 工种列表
const ChatStore = observable({
    sessionList: Taro.getStorageSync('sessionList') ? JSON.parse(Taro.getStorageSync('sessionList')) : [], // 会话列表
    unReadTotal: Taro.getStorageSync('unReadTotal') ? Taro.getStorageSync('unReadTotal') : 0, // 未读消息总数
    hxUser: Taro.getStorageSync('hxUser') ? JSON.parse(Taro.getStorageSync('hxUser')) : {}, //环信用户
    cursor: '', //未读消息总数

    setHxUser: (obj) => {
        ChatStore.hxUser = obj
        Taro.setStorageSync('hxUser', JSON.stringify(obj));
        let {
            username,
            password
        } = obj;
        console.log(decryptData(password))
        Taro.WebIM.conn.open({
            user: username,
            pwd: decryptData(password),
        }).then(() => {
            console.log("login success");
            ChatStore.getMessageList();
        }).catch((reason) => {
            console.log("login fail", reason);
        });
    },

    getMessageList: () => {
        console.log("getMessageList")
        Taro.WebIM.conn.getServerConversations({
            pageSize: 20,
            cursor: ''
        }).then((res) => {
            console.log("getMessageList_getServerConversations", res);
            const {
                conversations,
                cursor
            } = res.data;
            ChatStore.setSessionList(conversations);
            if (cursor) {
                ChatStore.cursor = cursor;
            }
        })
    },

    setSessionList: (obj) => {
        console.log("setSessionList", obj);
        let _list = obj.filter(r => r.conversationId != "matchgonglu" && r.conversationId !== 'taskgonglu' && r.conversationId !== 'interactivegonglu');
        console.log("去掉系统消息:", _list)
        ChatStore.sessionList = _list
        ChatStore.unReadTotal = 0
        _list.forEach(r => {
            if (r.conversationId != "matchgonglu" && r.conversationId !== 'taskgonglu' && r.conversationId !== 'interactivegonglu') {
                ChatStore.unReadTotal += r.unReadCount;
            }
        });
        Taro.setStorageSync('sessionList', JSON.stringify(_list))
        Taro.setStorageSync('unReadTotal', ChatStore.unReadTotal)
    },
    setUnReadTotal:(value)=>{
        ChatStore.unReadTotal = value;
    },

    setIsRead: (code) => {
        let inx = ChatStore.sessionList.findIndex(r => r.conversationId === code)
        console.log(inx, "inx")
        if (inx > -1) {
            ChatStore.unReadTotal = ChatStore.unReadTotal - ChatStore.sessionList[inx].unReadCount
            ChatStore.sessionList[inx].unReadCount = 0
        }
        Taro.setStorageSync('unReadTotal', ChatStore.unReadTotal)
        Taro.setStorageSync('sessionList', JSON.stringify(ChatStore.sessionList))
    },

    setCursor: (str) => {
        ChatStore.cursor = str;
    },
});

export default ChatStore;
