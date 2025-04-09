/* eslint-disable import/first */
import { useEffect, useState, useReducer } from 'react';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { View, Image, } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import { AtBadge } from 'taro-ui'
import { getTimeDetail } from '@/util/utils'
import TabBar from '@/components/tabBar';

import Navbar from '@/components/navbar';
import "taro-ui/dist/style/components/badge.scss";
import { } from '@/util/api'
import './index.scss';

import Skeleton from './Skeleton';

const Message = observer(({ store }) => {
    const [messageList, setMessageList] = useState([])
    const [isOpened, setIsOpened] = useState(false);
    const [loadingState, setLoadingState] = useState(1);

    const {
        baseStore: { tabbarHeight, bottomSafeAreaHeight },
        ChatStore: { sessionList, setIsRead, unReadTotal, setSessionList, cursor, setCursor },
        userStore: { role, isLogin, apuCustomer, userInfo: { userSerialCode } },
    } = store

    usePullDownRefresh(() => {
        Taro.stopPullDownRefresh()
    })

    useEffect(() => {
        const fetchData = async () => {
            if (sessionList.length) {
                console.log("sessionList", sessionList);
                let msgList = JSON.parse(JSON.stringify(sessionList)).filter(item => {
                    return item.conversationId !== 'matchgonglu' && item.conversationId !== 'taskgonglu' && item.conversationId !== 'interactivegonglu'
                })
                if (messageList.length === 0) {
                    setLoadingState(1)
                }
                console.log("msgList", msgList, msgList.length)

                // return
                let arr = msgList.filter(r => r.conversationType === 'singleChat')
                let arr2 = msgList.filter(r => r.conversationType === 'groupChat')
                let list = arr.map(r => {
                    return r.conversationId
                })
                let list2 = arr2.map(r => {
                    return r.conversationId
                })
                // const _hasGongluList = list.some(item => item === 'gonglu');
                // if (!_hasGongluList) {
                //     list.unshift('gonglu')
                // }
                console.log("arrarr", list, list2);
                const uniqueArr = [...new Set(list)];
                const uniqueArr2 = [...new Set(list2)];
                try {
                    let data = await Taro.WebIM.conn.fetchUserInfoById(uniqueArr)  // , ["nickname", "avatarurl", "apuCustomer", 'userVerified']
                    console.log("data", data)
                    let data2 = {}
                    if (uniqueArr2.length) {
                        try {
                            data2 = await Taro.WebIM.conn.getGroupInfo({ groupId: uniqueArr2 });
                            console.log("data2", data2)
                        } catch (e) {
                            console.log(e)
                            data2.data = []
                        }
                    }
                    let result = data.data;
                    console.log("result_result", result)
                    msgList.forEach(r => {
                        if (r.conversationType === "singleChat" && r.conversationId !== 'gonglu') {  //  && r.conversationId !== 'matchgonglu'
                            r.userInfo = result[r.conversationId];

                            // if (result[r.conversationId]?.ext) {
                            //     if (JSON.parse(result[r.conversationId].ext).apuCustomer) {
                            //         r.userInfo.nickname = "【交付客服】" + result[r.conversationId].nickname
                            //     }
                            //     r.apuCustomer = JSON.parse(result[r.conversationId].ext).apuCustomer;   // 单聊 是否是客服聊天
                            //     if (JSON.parse(result[r.conversationId].ext).apuCustomer) {   // 如果对方是客服,需要置顶
                            //         r.isPinned = true;
                            //         Taro.WebIM.conn.pinConversation({ conversationId: r.conversationId, conversationType: 'singleChat', isPinned: true }).then(res => {
                            //             console.log("私聊 置顶 操作 结果", res);
                            //         })
                            //     }
                            // }
                        }

                        if (r.conversationId === 'gonglu') {     // 系统消息  || r.conversationId === 'matchgonglu'
                            console.log("系统消息_系统消息", r);
                            r.userInfo = result[r.conversationId]
                            r.userInfo.avatarurl = `${Taro.$cdnUrl}/sass/service_system.webp`
                        }
                    })
                    console.log(msgList, "msgList");
                    const _listArr = JSON.parse(JSON.stringify(msgList));
                    let _isPinnedArr = _listArr.filter(item => item.isPinned);
                    let _noPinnedArr = _listArr.filter(item => !item.isPinned);
                    msgList = [..._isPinnedArr, ..._noPinnedArr];
                    console.log("调整置顶 顺序后的;列表", msgList);

                    msgList = msgList.filter(item => item.conversationId !== 'matchgonglu');
                    // 判断msgList中是否包含gonglu,并且gonglu在不在第一位,不在第一位就把gonglu放到第一位
                    const _hasGonglu2 = msgList.some(item => item.conversationId === 'gonglu');
                    if (_hasGonglu2 && msgList[0].conversationId !== 'gonglu') {
                        const _gongluIndex = msgList.findIndex(item => item.conversationId === 'gonglu');
                        const _gongluItem = msgList.splice(_gongluIndex, 1);
                        msgList.unshift(_gongluItem[0]);
                    }
                    console.log("msgListmsgList2", msgList)
                    setMessageList(msgList)
                    if (msgList.length) {
                        setLoadingState(2)
                    } else {
                        setLoadingState(3)
                    }
                } catch (e) { }

            } else {
                setLoadingState(3)
            }
        }
        fetchData()

    }, [sessionList, unReadTotal]);

    const goToPage = (type, id, unReadCount, extDiy, item) => {
        console.log("type, id, unReadCount, extDiy, item", type, id, unReadCount, extDiy, item);
        //如果私聊没查询到用户信息，代表此群聊已经解散或者群主注销
        let url = "";

        if (type === "singleChat") {
            console.log("chat status 7")
            url = `/pages/messagePackage/consult/index?recruitSerialCode=''&conversationId=${id}&userSerialCode=${id.split('apujiyu')[1].trim()}`
            if (item.userInfo && item.userInfo.nickname) {
                console.log("chat status 9")
                url = `${url}&nickname=${item.userInfo.nickname}`
            }
            Taro.navigateTo({
                url: url
            })
        }

        if (unReadCount > 0) {
            let option = {
                chatType: type, // 会话类型，设置为单聊。
                type: 'channel', // 消息类型。
                to: id, // 接收消息对象的用户 ID。
            };
            let msg = Taro.WebIM.message.create(option);
            Taro.WebIM.conn.send(msg);
            setIsRead(id)
        }
    }

    useReachBottom(() => {
        console.log('触底加载')
        if (cursor) {
            Taro.WebIM.conn.getServerConversations({ pageSize: 20, cursor: cursor }).then((res) => {
                console.log("会话列表数量", res.data)
                setSessionList([...sessionList, ...res.data.conversations])
                if (res.data.cursor) {
                    setCursor(res.data.cursor)
                } else {
                    setCursor('')
                }
            })
        }
    })

    const onClose = (e) => {
        if (e === 'success') {
            // forceUpdate()
        }
        setIsOpened(false)
    }


    return (
        <View className='message_box'>
            <Navbar back={false} fixed placeholder bgColor='#FFF' title='消息'></Navbar>
            {
                isLogin != 1 &&   // 用户未登录
                <View className='login_area'>
                    <Image className='login_area_img' src={`${Taro.$baseCdnUrl}/register/message_noLogin.png`}></Image>
                    <View className='login_area_title'>您还未登录</View>
                    <View className='login_area_desc'>登录账户后，可查看消息哦～</View>
                    <View className='login_area_btn' onClick={() => setIsOpened(true)}>立即登录</View>
                </View>
                ||
                <View className='my_message' style={{ marginBottom: tabbarHeight + 'PX' }}>
                    {
                        loadingState == 1 && <Skeleton />
                    }
                    {
                        loadingState === 2 &&
                        messageList.map((item, index) => {
                            let { conversationType, unReadCount, conversationId, lastMessage: { msg, time, ext, type, customEvent = '' } } = item
                            return (

                                <View className='every_box' key={index} onClick={() => goToPage(conversationType, conversationId, unReadCount, ext, item)}>

                                    {
                                        unReadCount > 0 ?
                                            <AtBadge value={unReadCount} maxValue={9}>
                                                <View className='head_box'><Image src={item.userInfo ? item.userInfo.avatarurl : `${Taro.$cdnUrl}/message/chat_group_new.webp`}></Image></View>
                                            </AtBadge>
                                            :
                                            <View className='head_box'><Image src={item.userInfo ? item.userInfo.avatarurl : `${Taro.$cdnUrl}/message/chat_group_new.webp`}></Image></View>
                                    }
                                    <View className='content'>
                                        <View className='top_cont'>
                                            <View>{(conversationId === 'gonglu') ? '系统消息' : item.userInfo && item.userInfo.nickname || ''}</View>
                                            <View>{conversationId === 'gonglu' ? "" : getTimeDetail(time)}</View>
                                        </View>
                                        {
                                            type === 'txt' && <View className='detail_cont'>{msg}</View>
                                        }
                                        {
                                            type === 'img' && <View className='detail_cont'>[图片]</View>
                                        }
                                        {
                                            type === 'loc' && <View className='detail_cont'>[位置]</View>
                                        }
                                        {
                                            type === "custom" && customEvent === 'job' && <View className='detail_cont'>[岗位]</View>
                                        }
                                        {
                                            type === "custom" && customEvent === 'interview' && <View className='detail_cont'>{ext.interviewType == 1 ? '[面试通知]' : '面试结果通知'}</View>
                                        }
                                    </View>
                                </View>
                            )
                        })
                    }
                    {
                        loadingState === 3 && messageList.length === 0 &&
                        <Taro.NoData></Taro.NoData>
                    }
                </View>
            }

            <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} />

            <TabBar actCurrent={(role === 'SEEK' || role === 'CHANNEL') ? 1 : 3} />
        </View>
    )
})

export default inject('store')(Message)
