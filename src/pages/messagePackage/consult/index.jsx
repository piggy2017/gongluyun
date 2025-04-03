/* eslint-disable import/first */
import { useEffect, useState, useReducer } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Button, Image, Text, Input } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import { AtIcon, AtModal } from 'taro-ui';
import "taro-ui/dist/style/components/modal.scss";
import { getUserInfo, getRecruitmentInfo, getMatchingAgent, getIMToken } from '@/util/api'
import { decryptData, encryptData } from '@/util/crypto'
import { debounce, throttle, formatTime } from '@/util/utils'
import Navbar from '@/components/navbar';
import Chat from '@/components/chat';

import ChatArea from '@/components/chatArea';
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss';

const Index = observer(({ store }) => {
    const router = useRouter()
    let [forceUpdate, refreshForceUpdate] = useReducer(x => x + 1, 0);
    const [jobInfo, setJobInfo] = useState({});
    const [infoOpen, setInfoOpen] = useState(false);
    const [system, setSystem] = useState(Taro.getSystemInfoSync());
    const [sendObj, setSendObj] = useState({});                        //  我发送的信息
    const [serialCodeUser, setUserSerialCode] = useState("");
    const [recommendOpen, setRecommendOpen] = useState(false);
    const [longPress, setLongPress] = useState(false);

    const {
        
    } = store;
    const entryChannel = router.params.entryChannel || 'RECRUITMENT'
    const [chatUserInfo, setChatUserInfo] = useState({});


    useEffect(() => {
        // userSerialCode 对方的userSerialCode
        // conversationId 对方的对话id
        // nickname 对方的昵称
        console.log("router.params", router.params);
        const { recruitSerialCode, userSerialCode, conversationId, nickname, phone } = router.params;
        setJobInfo({ conversationId });
        setUserSerialCode(userSerialCode);

        if (!phone) {
            getUserInfo({ userSerialCode }).then(res => {
                console.log("getUserInfo", res);
                if (res.code === 200) {
                    let info = JSON.parse(decryptData(res.data));
                    console.log('info', info);
                    setChatUserInfo({ userSerialCode, conversationId, nickname, phone: info.phone })
                }
            })
        } else {
            setChatUserInfo({ userSerialCode, conversationId, nickname, phone })
        }
    }, [])

    const sendMessageFn = async (type) => {
        // 1：视频匹配
        // 2：拒绝匹配
        // 3：同意匹配
        // 4：结束聊天
        // 5：结束匹配
        let res = await getIMToken({ entryChannel: 'RECRUITMENT' })
        let data = ''
        if (res.code === 200) {
            data = res.data
        } else {
            Taro.showToast({
                title: res.msg,
                icon: 'none',
                duration: 2000
            })
            return
        }
        let { recruitSerialCode, liveStudioSerialCode, liveChannelType } = router.params
        let params = {
            "code": 7,
            "rule": "ONE_KEY_MATCH",
            "loginChannel": "WECHAT_APP",
            "entryChannel": "RECRUITMENT",
            "action": type,
            "recruitSerialCode": recruitSerialCode,
            imToken: data
        }
        // 直播间
        if (liveStudioSerialCode) {
            params.liveStudioSerialCode = liveStudioSerialCode
        }
        if (liveChannelType) {
            params.liveChannelType = liveChannelType
        }
        if (type === 1) {
            setJobConsult({ recruitSerialCode, time: parseInt(new Date().getTime()) })
        } else {
            setJobConsult({})
        }
        // websocketStore.sendMessage(JSON.stringify(params));
    }

    const getCardInfo = (obj) => {      // 获取发送推荐岗位卡片信息
        console.log("getCardInfo", obj);

        // 处理发送卡片消息的逻辑,设置自定义事件。
        let customEvent = "job";  // job
        // 通过键值对设置自定义消息内容。
        let env = Taro.getEnv()
        let map = {
            'WEAPP': 'IN_WECHAT_MINI',
            'TT': 'IN_DOUYIN_MINI',
        }
        let customExts = { ...obj, source: map[env] };
        let option = {
            // 消息类型。
            type: "custom",
            // 消息接收方：单聊为对方用户 ID，群聊和聊天室分别为群组 ID 和聊天室 ID。
            to: "apujiyu" + serialCodeUser,
            // 会话类型：单聊、群聊和聊天室分别为 `singleChat`、`groupChat` 和 `chatRoom`。
            chatType: "singleChat",
            customEvent,
            customExts,
            ext: {
                applyDate: "",
                recruitSalaryRange: obj.recruitSalaryRange || '',
                title: obj.recruitTitle,
                recruitSerialCode: obj.recruitSerialCode || '',
                ...obj
            }
        };
        console.log("option", option);
        fixSendData(option, 'card');
    }

    const fixSendData = (data, type) => {
        // 处理数据
        console.log("fixSendData", data);
        const { recruitSerialCode, userSerialCode, applyDate = '', recruitTitle = '', recruitSalaryRange = '', conversationId } = router.params;
        let obj = {
            ...data,
            canGroupId: conversationId ? conversationId : userSerialCode ? `apujiyu${userSerialCode}` : jobInfo.conversationId, //群聊canGroupId 私聊 apujiyuXXX
        }
        if (type === 'card') {

        } else {
            obj.extDiy = {
                applyDate: applyDate || '',
                recruitSalaryRange: recruitSalaryRange || '',
                title: recruitTitle,
                recruitSerialCode: recruitSerialCode || '',
            }
        }
        console.log("fixSendData——obj", obj);
        setSendObj(obj)
    }

    const callUser = () => {
        console.log("userInfo.phone", chatUserInfo.phone);
        Taro.makePhoneCall({
            phoneNumber: chatUserInfo.phone
        })
    }
    const onOpenRecommend = () => {
        //打开推荐数据
        setRecommendOpen(true)
    }

    const closeModal = () => {
        setLongPress(false)
    }

    return (
        <View className='consult_box' onClick={closeModal}>
            <Navbar fixed placeholder bgColor='#FFF' title='消息'></Navbar>

            {
                <ChatArea
                    system={system}
                    sendObj={sendObj}
                    chatUser={chatUserInfo}
                    jobInfo={jobInfo}
                    isType='singleChat'
                    infoOpen={infoOpen}
                    longPress={longPress}
                    onOpenLongPress={() => setLongPress(true)} />
            }

            {
                <Chat
                    agentCall={callUser}
                    // chatUser={chatUserInfo}
                    sendInfo={(e) => fixSendData(e)}
                    isType='singleChat'
                    onOpenRecommend={onOpenRecommend} />
            }

        </View>
    )
})

export default inject('store')(Index)
