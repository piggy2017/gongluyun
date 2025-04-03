/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-01 17:58:31
 * @Description: 
 */
import {
    useEffect
} from 'react';
import Taro, {
    useLaunch,
    useRouter
} from '@tarojs/taro'
import {
    Provider
} from 'mobx-react'
import SDK from "@/util/Easemob";
import baseStore from '@/store/base'
import userStore from '@/store/user'
import ChatStore from '@/store/chat';
import businessStore from '@/store/business'
import LoginComponent from '@/components/login';
import JoinSupplier from '@/components/joinSupplier';
import ChoosePattern from '@/components/choosePattern';
import LoadMore from '@/components/loadMore';
import NoData from '@/components/noData';
import SubscribeMsg from '@/components/subscribeMsg';
import { decryptData, encryptData } from '@/util/crypto'
import {
    getQueryString
} from '@/util/utils.js'
import './app.scss'
const store = {
    baseStore,
    userStore,
    businessStore,
    ChatStore
}

function App({
    children
}) {
    const router = useRouter();
    const { setEnterParams, token, userInfo: { userSerialCode } } = userStore;
    const { hxUser } = ChatStore;
    useLaunch(() => {
        console.log("useLaunch--router.params", router.params);
        const {
            source,
            agentSerialCode,
            q
        } = router.params
        // 缓存进入页面的参数------》管道收益
        if (source && agentSerialCode) {
            setEnterParams({
                source,
                agentSerialCode
            })
        }
        if (q) {
            let query = getQueryString(decodeURIComponent(q));
            console.log("query", query);
            setEnterParams(query);
        }
    })

    useEffect(() => {
        baseStore.setSystemInfo();
        // businessStore.setSourceList();
        Taro.$cdnUrl = 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject';
        Taro.$cdnBackIcon = 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/mine/back_icon.webp';
        Taro.$cdnBlackBackIcon = 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/supplier/supplier_5.webp';
        Taro.$baseCdnUrl = 'https://apu-mini.oss-accelerate.aliyuncs.com';
        Taro.GlobalLogin = LoginComponent;
        Taro.GlobalJoinSupplier = JoinSupplier;
        Taro.ChoosePattern = ChoosePattern;
        Taro.LoadMore = LoadMore;
        Taro.NoData = NoData;
        Taro.SubscribeMsg = SubscribeMsg;
    }, [])

    useEffect(() => {
        Taro.WebIM = SDK;
        Taro.WebIM.conn = new Taro.WebIM.connection({
            appKey: '1158220627120684#apujiyu', // : '1158220627120684#demo',        // 测试环境
            // appKey: '1158220627120684#demo', // 测试环境
            isMultiLoginSessions: false,
            https: false,
            url: 'wss://im-api-wechat.easemob.com/websocket',
            apiUrl: 'https://a1.easemob.com',
            heartBeatWait: 30000,
            autoReconnectNumMax: 5,
            useOwnUploadFun: false
        });

        Taro.WebIM.conn.addEventHandler("GLOBAL", {
            onTextMessage: function (message) {
                console.log(message, "全局监听");

                if (message.from === "interactivegonglu") { // 互动消息
                    FindStore.setInteriavegonglu(JSON.parse(message.ext.extJson))
                }

                if (message.from === "taskgonglu") {
                    let _obj = JSON.parse(message.ext.extJson);
                    if (_obj.taskAward === 'SYSTEM_ASSIST_RED_ENVELOPE') {
                        showComponentStore.setMatchRedInfo({
                            show: true,
                            ..._obj
                        });
                    }
                }
                unifyData(message)
            },
            onImageMessage: function (message) {
                unifyData(message)
            },
            onCmdMessage: function (message) {},
            onAudioMessage: function (message) {},
            // 当前用户收到位置消息。
            onLocationMessage: function (message) {
                unifyData(message)
            },
            onChannelMessage: function (message) {
                console.log(message, "环形 onChannelMessage");
            },
            onConnected: () => { // 重连成功
                // console.log("onConnected");
            },
            onDisconnected: (errorCode) => { // 重连失败
                console.log("onDisconnected", errorCode);
            },
            onTokenWillExpire: () => {
                console.log("onTokenWillExpire");
            },
            onTokenExpired: () => {
                console.log("onTokenExpired");
            },
            // 当前用户收到会话已读回执。
            onChannelMessage: (message) => {
                console.log("当前用户收到会话已读回执。", message);
            },
            // onCustomMessage: function (message) {
            //   unifyData(message)

            // },
            onCustomMessage: function (message) {
                // getMessage(message)
                unifyData(message)
                console.log("收到自定义消息message",message);
            },
        });
        return () => {
          Taro.WebIM.conn.removeEventHandler("GLOBAL");
        };
    }, [])

    const unifyData = (data) => {
      const { sessionList, setSessionList } = ChatStore;
      if (data.from === 'jiumian' || data.from === 'rdjiumian' || data.from === 'apujiyu' || data.from === 'rdapujiyu' || data.from === "interactivegonglu") return
      let chatList = JSON.parse(JSON.stringify(sessionList))
      chatList = chatList.filter(item => {
        return item.conversationId !== 'matchgonglu' && item.conversationId !== 'taskgonglu' && item.conversationId !== 'interactivegonglu'
      })
      let inx = chatList.findIndex(r =>
        r.conversationId === (data.chatType === 'groupChat' ? data.to : data.to === r.conversationId ? data.to : data.from)
      )
      console.log(inx)
      if (inx > -1) {
        console.log("我存在数组中")
        chatList[inx].lastMessage = data
        chatList[inx].unReadCount += 1
        const element = chatList.splice(inx, 1)[0];
        chatList.unshift(element)
        setSessionList([...chatList])
      } else {
        console.log("我不存在数组中，就要在本地添加了")
        let obj = {
          conversationId: data.chatType === "singleChat" ? data.from : data.to,
          conversationType: data.chatType,
          isPinned: false,
          lastMessage: data,
          pinnedTime: 0,
          unReadCount: 1,
        }
        setSessionList([obj, ...chatList])
      }
    }
    
    useEffect(() => {
      if (Object.keys(hxUser).length && token) {
        console.log(hxUser, "我重新登陆了")
        const HXLoginState = Taro.WebIM.conn.logOut
        if (HXLoginState) {
          let { username, password } = hxUser
          Taro.WebIM.conn.open({
            user: username,
            pwd: decryptData(password),
          }).then(() => {
            // console.log("login success");
            Taro.WebIM.conn.fetchUserInfoById([hxUser.username]).then(res => {
              // console.log("app.jsx fetchUserInfoById1", res);
            })
            getMessageList()
          }).catch((reason) => {
            console.log("login fail", reason);
          });
        } else {
          Taro.WebIM.conn.fetchUserInfoById([hxUser.username]).then(res => {
            // console.log("app.jsx fetchUserInfoById2", res)
          })
          getMessageList()
        }
      }
    }, [hxUser, token]);
  
    const getMessageList = () => {
      const { setSessionList, setCursor } = ChatStore;
      Taro.WebIM.conn.getServerConversations({ pageSize: 20, cursor: '' }).then((res) => {
        // console.log("res.data.conversations", res.data.conversations); // userSerialCode
        const _conversations = res.data.conversations.filter(item => !item.conversationId.includes(userSerialCode))
        console.log("res.data._conversations", _conversations);
        setSessionList(_conversations)
        const { cursor } = res.data
        if (cursor) {
          setCursor(cursor)
        }
      })
    }

    useEffect(() => {
        const {
            scene
        } = Taro.getLaunchOptionsSync();
        if (scene === 1154) { //  1154是朋友圈单页模式场景值
            console.log('朋友圈单页模式场景值,不进行更新检查');
            return
        }

        if (Taro.canIUse('getUpdateManager')) {
            const updateManager = Taro.getUpdateManager();
            // 重点：增加对象存在性判断
            if (!updateManager) {
                console.warn('UpdateManager is unavailable in current context')
                return
            }
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function () {
                        Taro.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            // eslint-disable-next-line no-shadow
                            success: function (res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新的版本下载失败
                        Taro.showModal({
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                        })
                    })
                }
            })
        } else {
            Taro.showModal({
                title: '提示',
                content: '当前微信版本过低，无法更好体验程序，请升级到最新微信版本后重试。'
            })
        }
    }, []);

    return ( 
      <Provider store = {store}>
        {
            children
        } 
      </Provider>
    );
}

export default App
