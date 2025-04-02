/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-05-17 09:15:44
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-01 16:48:57
 * @Description: 
 */
/* eslint-disable react/jsx-indent-props */
import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, ScrollView, Text } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import { sendHx } from '@/util/api';
import { getTimeMH } from '@/util/utils'
import MapView from '../mapView'

import './index.scss';

const ChatInput = observer(({ sendObj, store, system, jobInfo = {}, chatUser = {}, isType = 'singleChat', infoOpen, longPress = true, onOpenLongPress }) => {

    const [chatMessages, setChatMessages] = useState([]);
    const [topDis, setTopDis] = useState({})
    const [intoView, setIntoView] = useState(null)
    // const [sendUserInfo, setSendUserInfo] = useState({})
    const [imageUrl, setImageUrl] = useState('');
    const chatBoxRef = useRef(null);
    const [menuInfo, setMenuInfo] = useState({});

    const audioContext = Taro.createInnerAudioContext(); //播放器
    const [chatComponentHeight, setChatComponentHeight] = useState(0);   // 底部聊天区域高度
    const {
        baseStore: { navHeight, bottomSafeAreaHeight },
        userStore: { role, userInfo: { userSerialCode, avatar, nickName } },
        ChatStore: { setIsRead, sessionList, setSessionList, hxUser: { username } },
    } = store

    useEffect(() => {
        console.log("chatarea_sendObjsendObj", sendObj)
        if (Object.keys(sendObj).length) {
            let option = {
                // 消息类型
                ...sendObj,
                from: `${username ? username : `apujiyu${userSerialCode}`}`,
            };
            console.log("chatarea_option", option, sessionList)
            sendTextMessage(option, sessionList)
        }
    }, [sendObj])

    useEffect(() => {
        if (chatMessages.length === 0) {
            console.log("我要加载历史数据了,页面中传入的jobInfo 信息:", jobInfo)
            getHistoryMessage()
        }
        return () => {
            if (audioContext) {
                audioContext.stop();
                audioContext.destroy();
            }
        };
    }, [jobInfo]);


    useEffect(() => {
        Taro.WebIM.conn.addEventHandler('eventName', {
            onTextMessage: function (message) {
                getMessage(message)
                console.log(chatMessages, "setChatMessages")
            },
            // 当前用户收到图片消息。
            onImageMessage: function (message) {
                console.log(message, "onImageMessage")
                getMessage(message)
            },
            // 当前用户收到透传消息。
            onCmdMessage: function (message) { },
            // 当前用户收到语音消息。
            onAudioMessage: function (message) { },
            // 当前用户收到位置消息。
            // 当前用户收到位置消息。
            onLocationMessage: function (message) {
                getMessage(message)
            },
            // 当前用户收到会话已读回执。
            onChannelMessage: function (message) {
                console.log(message, "onChannelMessage")
            },
            // 当前用户收到自定义消息。
            onCustomMessage: function (message) {
                getMessage(message)
            },
            // 当前用户收到撤回消息。
            onRecallMessage: function (message) {
                // getMessage(message)
                console.log(topDis, "message============>")

                getRecallMsg(message)
            }
        });
        return () => {
            Taro.WebIM.conn.removeEventHandler("eventName")
        }
    }, [jobInfo]);

    const getRecallMsg = (message) => {
        setChatMessages((preMessage) => {
            let arr = preMessage.filter(r => r.id != message.mid)
            return [...arr]
        })
        let inx = sessionList.findIndex(r => r.conversationId === jobInfo.conversationId)
        if (inx != -1) {
            sessionList[inx].lastMessage.msg = '对方撤回了一条消息'
            sessionList[inx].lastMessage.type = 'txt'
        }
        setSessionList([...sessionList])
    }

    const getMessage = (message) => {
        console.log("在chatArea中间听到getMessage", message);
        console.log("在chatArea中间听到jobInfo", jobInfo)
        const { conversationId, canGroupId } = jobInfo
        let obj = {
            ...message,
            userInfo: {
                avatarurl: message.ext.avatar,
                nickname: message.ext.nickName
            }
        }
        if (!message.customExts || Object.keys(message.customExts).length === 0) {
            obj.customExts = message.ext;
        }
        console.log("isType", isType, message.chatType)
        if (isType === message.chatType) {
            if (message.chatType === "groupChat") {
                console.log("canGroupId", canGroupId, message.to)
                if (canGroupId === message.to) {

                }
                setChatMessages((prevChatMessages) => [...prevChatMessages, obj]);
                isReadFn(message)
            } else {
                if (conversationId === message.from) {
                    setChatMessages((prevChatMessages) => [...prevChatMessages, obj]);
                    isReadFn(message)
                }
            }
        }
    }

    const isReadFn = (message) => {
        let option = {
            chatType: message.chatType, // 会话类型，设置为单聊。
            type: 'channel', // 消息类型。
            to: message.chatType === "groupChat" ? message.to : message.from, // 接收消息对象的用户 ID。
            // to: message.to, // 接收消息对象的用户 ID。
        };
        let msg = Taro.WebIM.message.create(option);
        Taro.WebIM.conn.send(msg);
        setIsRead(option.to)
    }

    useEffect(() => {
        const getTopDistance = async () => {
            try {
                let queryChat = { height: 0 }
                if (chatMessages.length > 0) {
                    queryChat = await selectorQueryClientRect('#chat_bottom');
                }

                console.log("queryChat_chat_bottom", queryChat);
                if (queryChat?.height > 0) {
                    setChatComponentHeight(queryChat.height);
                }
                setTimeout(() => {
                    setIntoView(`chat-message-${chatMessages.length - 1}`);
                }, 0);
            } catch (error) {
                console.error('An error occurred:', error);
            }
        };
        getTopDistance();
        return () => {
        }
    }, [chatMessages, infoOpen, system, chatUser])


    const sendTextMessage = (info, list) => {
        // let { canGroupId,  recruitSerialCode = '', conversationId } = jobInfo
        let { canGroupId, extDiy = {} } = info
        let option = {
            ext: {},
            ...info,
            // 会话类型：单聊、群聊和聊天室分别为 `singleChat`、`groupChat` 和 `chatRoom`，默认为单聊。
            chatType: isType,
            // 消息接收方：单聊为对方用户 ID，群聊和聊天室分别为群组 ID 和聊天室 ID。
            to: canGroupId,

        };
        // 如果带有岗位就在扩展字段里面传递岗位ID
        if (Object.keys(extDiy).length) {
            option.ext = {
                ...option.ext,
                ...extDiy
            }
        }
        // 创建文本消息。
        console.log(option, "sendTextMessage_发送信息")
        let msg = Taro.WebIM.message.create(option);
        console.log("发送消息体", msg)
        // 调用 `send` 方法发送该文本消息。
        Taro.WebIM.conn.send(msg).then((res) => {
            setChatMessages((prevChatMessages) =>
                [
                    ...prevChatMessages,
                    {
                        ...option,
                        time: new Date().getTime(),
                        id: res.serverMsgId,
                        userInfo: { avatarurl: avatar, nickname: nickName }
                    }
                ]
            );
            // 发送消息
            storageMessage(option, list)
            // sendSevice(option, isType, canGroupId,)
        }).catch((e) => {
            console.log("Send message fail", e);
            Taro.showToast({
                title: '发送失败',
                icon: 'none',
            })
        });
    }

    const storageMessage = (option, list = []) => {
        let chatInfo = {
            ...option,
            time: new Date().getTime(),
        }
        let inx = list.findIndex(r => r.conversationId === option.to)
        if (inx > -1) {
            list[inx].lastMessage = chatInfo
        } else {
            let obj = {
                conversationId: option.to,
                conversationType: option.chatType,
                isPinned: false,
                lastMessage: chatInfo,
                pinnedTime: 0,
                unReadCount: 0,
            }
            list = [obj, ...list]
        }
        setSessionList([...list])

    }

    const getHistoryMessage = (position = -1) => {
        const { conversationId } = jobInfo
        console.log("getHistoryMessage___conversationId", conversationId)
        if (!conversationId) return;
        let options = {
            // 对方的用户 ID 或者群组 ID 或聊天室 ID。
            targetId: conversationId,
            // 每页期望获取的消息条数。取值范围为 [1,50]，默认值为 20。
            pageSize: 50,
            // 查询的起始消息 ID。若该参数设置为 `-1`、`null` 或空字符串，从最新消息开始。
            cursor: position,
            // 会话类型：（默认） `singleChat`：单聊；`groupChat`：群聊。
            chatType: isType,
            // 消息搜索方向：（默认）`up`：按服务器收到消息的时间的逆序获取；`down`：按服务器收到消息的时间的正序获取。
            searchDirection: "up",
        };
        Taro.WebIM.conn
            .getHistoryMessages(options)
            .then((res) => {
                // 成功获取历史消息。
                console.log(res);
                let list = res.messages.reverse()
                let arr = list.map(r => {
                    return r.from
                })
                const uniqueArr = [...new Set(arr)];
                console.log(uniqueArr)
                Taro.WebIM.conn.fetchUserInfoById(uniqueArr, ["nickname", "avatarurl", 'userVerified']).then((data) => {
                    // r.userInfo = data.data[r.from]
                    let result = data.data
                    list.forEach(r => {
                        r.userInfo = result[r.from];
                        if (!r.customExts || Object.keys(r.customExts).length === 0) {
                            r.customExts = r.ext;
                        }
                    })
                    setChatMessages([...list]);
                });
            })
            .catch((e) => {
                // 获取失败。
            });

    }

    const selectorQueryClientRect = (selector) => new Promise(resolve => {
        const query = Taro.createSelectorQuery();
        query.select(selector).boundingClientRect((res) => {
            resolve(res);
        }).exec();
    });

    const sendOrReceived = (item) => {
        return item == `${username ? username : `apujiyu${userSerialCode}`}`;
    }

    // 横图和竖图分开处理
    const getWidth = (item, type) => {
        if (item.width >= item.height) {
            if (type === 1) {
                return '300rpx'
            } else {
                return 300 / (item.width / item.height) + 'rpx'
            }
        } else {
            if (type === 1) {
                return '200rpx'
            } else {
                return 200 / (item.width / item.height) + 'rpx'
            }
        }

    }

    const goJobDetail = (obj) => {    // 点击岗位卡片,跳转到岗位详情页面
        let url = '';
        const { recruitSerialCode, serialCode } = obj.customExts
        if (role === 'SEEK') {
            url = `/pages/workerPackage/projectDetail/index?recruitSerialCode=${recruitSerialCode}`
        } else {
            url = `/pages/projectPackage/projectDetail/index?contractsSerialCode=${serialCode}`
        }
        Taro.navigateTo({
            url: url
        });
        return

        let par = {
            fromCard: 1
        }
        if (recruitSerialCode) {
            par.recruitSerialCode = recruitSerialCode
        }
        if (source) {
            par.source = source
        }
        if (obj.from) {
            par.agentSerialCode = obj.from.includes('apujiyu') ? obj.from.split('apujiyu')[1] : obj.from
        }
        const params = new URLSearchParams({ ...par });
        url = url + `?${params.toString()}`
        Taro.navigateTo({
            url: url
        });
    }

    const getChatTime = (item, index) => {
        if (index === 0) {
            return item.time
        } else {
            let lastTime = chatMessages[index - 1].time
            let now = item.time
            //判断lastTime 和 now 之间相差几分钟
            let time = ((now - lastTime) / 1000 / 60) > 1
            if (time) {
                return item.time
            } else {
                return ''
            }
        }
    }

    const setInfo = (item, index, type) => {
        let map = {
            'txt': item.msg,
            'img': item.thumb || item.url,
            'loc': item.buildingName,
        }
        let info = {
            index,
            content: map[type],
            show: true,
            item
        }
        setMenuInfo(info)
        onOpenLongPress()
    }

    useEffect(() => {
        if (!longPress) {
            setMenuInfo({ ...menuInfo, show: longPress })
        }
        console.log(longPress, "==========>")
    }, [longPress])

    const copy = () => {
        Taro.setClipboardData({
            data: menuInfo.content,
            success: () => {
                Taro.showToast({
                    title: '复制成功',
                    icon: 'none'
                })
            }
        })
    }

    const recallMessage = () => {
        Taro.showModal({
            title: '提示',
            content: '是否确认撤回该条消息？',
            success: (data) => {
                if (data.confirm) {
                    // TODO:撤回
                    console.log(menuInfo.item)
                    let option = {
                        // 要撤回消息的消息 ID。
                        mid: menuInfo.item.id,
                        // 消息接收方：单聊为对方用户 ID，群聊和聊天室分别为群组 ID 和聊天室 ID。
                        to: menuInfo.item.to,
                        // 会话类型：单聊、群聊和聊天室分别为 `singleChat`、`groupChat` 和 `chatRoom`。
                        chatType: "singleChat",
                    };
                    Taro.WebIM.conn.recallMessage(option)
                        .then((res) => {
                            console.log("success", res);
                            Taro.showToast({
                                title: '撤回成功',
                                icon: 'none'
                            })
                            let arr = chatMessages.filter(r => r.id != option.mid)
                            setChatMessages([...arr])
                            let inx = sessionList.findIndex(r => r.conversationId === jobInfo.conversationId)
                            if (inx != -1) {
                                sessionList[inx].lastMessage.msg = '你撤回了一条消息'
                                sessionList[inx].lastMessage.type = 'txt'
                            }
                            setSessionList([...sessionList])
                        })
                        .catch((error) => {
                            // 消息撤回失败，原因可能是超过了撤销时限(超过 2 分钟)。
                            console.log("fail", error);
                            Taro.showToast({
                                title: '超过2分钟,不能撤回',
                                icon: 'none'
                            })
                        });
                }
            }
        })
    }

    return (
        <>
            <ScrollView
                style={{ height: `calc(100vh - ${navHeight + chatComponentHeight}PX)`, paddingTop: `0PX`, top: `${navHeight}PX` }}
                scrollY
                enhanced
                bounces
                ref={chatBoxRef}
                scrollWithAnimation
                scrollIntoView={intoView} // 滚动到最新消息
                className='chat-content'
                id='chat-content'
            >

                {
                    chatMessages.map((item, index) => (
                        <View
                            key={index}
                            id={`chat-message-${index}`} // 设置每条消息的唯一标识，用于滚动到指定消息
                            className={`chat-message ${sendOrReceived(item.from) ? 'sent' : 'received'}`}
                        >
                            {/* <Text className='message'>{message.message}</Text> */}
                            {
                                getChatTime(item, index) ? <View className='time_box'>{getTimeMH(getChatTime(item, index))}</View> : ''
                            }
                            {
                                item.customEvent && item.customEvent === "job" &&   // 岗位卡片
                                <View className='every_box_custom' onClick={() => goJobDetail(item)}>
                                    <View className='info'>
                                        <View className='right_box'>
                                            <View className='bottom_info'>
                                                <View className='require'>
                                                    <View className={`require_title ${item.customExts.realUser ? '' : 'faker_user'}`}>
                                                        <View>
                                                            {/* {
                                                                item.customExts.labelUrl && <Image src={item.customExts.labelUrl}></Image>
                                                            } */}
                                                            {item.customExts.recruitTitle}
                                                        </View>
                                                        {
                                                            item.customExts.recruitSalaryRange &&
                                                            <View>
                                                                {item.customExts.recruitSalaryRange.split('/')[0]}
                                                                {
                                                                    item.customExts.recruitSalaryRange.split('/')[1] && <Text>/{item.customExts.recruitSalaryRange.split('/')[1]}</Text>
                                                                }
                                                            </View>
                                                        }

                                                    </View>
                                                    {
                                                        item.customExts.jobReq && item.customExts.tags &&
                                                        <View className='require_req'>
                                                            {
                                                                [...item.customExts.jobReq, ...item.customExts.tags].map((r, i) => {
                                                                    return <View key={i}>{r}</View>
                                                                })
                                                            }
                                                        </View>
                                                    }

                                                    <View className='require_detail'>
                                                        <View className='left_info'>
                                                            <View className='avatar_box'><Image src={item.customExts.userAvatar}></Image></View>
                                                            <View className='addr_date'>
                                                                <View>{item.customExts.areaName}{item.customExts.distance && `· 距您 ${item.customExts.distance}千米`}</View>
                                                                <View>发布于 {item.customExts.createDate}</View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View> ||
                                <>
                                    {
                                        sendOrReceived(item.from) ?
                                            <View className={`is_my ${item.type === 'loc' && 'loc'}`}>
                                                {
                                                    item.type === 'txt' && <View className='txt_view' onLongPress={() => setInfo(item, index, 'txt')}>{item.msg}</View>
                                                }
                                                {
                                                    item.type === 'img' && <View className='img_view'><Image onClick={() => { setImageUrl(item.url || item.thumb) }} style={{ width: getWidth(item, 1), height: getWidth(item, 2) }} src={item.thumb || item.url} onLongPress={() => setInfo(item, index, 'img')}></Image></View>
                                                }
                                                {
                                                    item.type === 'loc' && <View onLongPress={() => setInfo(item, index, 'loc')}><MapView data={item} index={index} /></View>
                                                }

                                                <View className='avatar_box'><Image src={item.userInfo && item.userInfo.avatarurl}></Image></View>
                                                {
                                                    menuInfo.show && menuInfo.index === index && <View className='menu_longPress'>
                                                        <View onClick={() => copy()}>复制</View>
                                                        <View onClick={() => recallMessage()}>撤回</View>
                                                    </View>
                                                }
                                            </View>
                                            :
                                            <View className='is_other'>
                                                <View className='avatar_box'><Image src={item.userInfo && item.userInfo.avatarurl}></Image></View>
                                                <View className='other_box'>
                                                    <View className='name'>
                                                        <View className='nickname'>
                                                            {
                                                                item.chatType === 'groupChat' && item.userInfo && item.userInfo.nickname
                                                            }
                                                            {
                                                                item.userInfo && item.userInfo.ext && item.userInfo.ext.userVerified && <Text>已实名</Text>
                                                            }

                                                        </View>
                                                    </View>
                                                    {
                                                        item.type === 'txt' && <View className='msg'>{item.msg}</View>
                                                    }
                                                    {
                                                        item.type === 'img' && <View><Image onClick={() => setImageUrl(item.url || item.thumb)} style={{ width: getWidth(item, 1), height: getWidth(item, 2) }} src={item.thumb || item.url}></Image></View>
                                                    }
                                                    {
                                                        item.type === 'loc' && <View><MapView data={item} index={index} /></View>
                                                    }
                                                    {
                                                        item.type === 'audio' && <View>语音</View>
                                                    }
                                                </View>
                                            </View>
                                    }
                                </>
                            }
                        </View>
                    ))
                }
            </ScrollView>

            <View className={['full_image', !imageUrl && 'nont_box']} onClick={() => setImageUrl(null)} >
                <Image mode='widthFix' src={imageUrl}></Image>
            </View>
        </>


    );
});

export default inject('store')(ChatInput);
