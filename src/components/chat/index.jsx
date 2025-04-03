/* eslint-disable react/jsx-indent-props */
import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, Textarea, Button } from '@tarojs/components';
import ChooseType from './chooseType';
import './index.scss';

const ChatInput = observer(({ state, sendInfo, store, isType = 'groupChat', agentCall }) => {
    const [bottom, setBottom] = useState(0)
    const [addState, setAddState] = useState(false)
    const [voiceState, setVoiceState] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const inputRef = useRef(null);

    const systemInfo = Taro.getSystemInfoSync();
    // 底部安全区高度
    const bottomSafeHeight = systemInfo.screenHeight - systemInfo.safeArea.bottom;

    const {
        baseStore: { navHeight, bottomSafeAreaHeight },
        userStore: { role, userInfo: { userSerialCode, avatar, nickName } },
        baseStore: { platform },
        ChatStore: { hxUser: { username } },
    } = store

    useEffect(() => {
        const getTopDistance = async () => {
            const queryChat = await selectorQueryClientRect('#chat_bottom');
            console.log(queryChat, "=======>chat")
        };
        getTopDistance();
        return () => {
        }
    }, []);
    useEffect(() => {
        return () => {
            setAddState(false)
        }
    }, [state]);

    const handlePlusButtonClick = () => {
        // 处理加号按钮点击事件
        // 弹出三个模块：照片、相机、位置
        console.log(isType, "isType")
        setAddState(!addState)
    };

    const isOnBlur = () => {
        setBottom(0)
    }
    const confirmInfo = (value) => {
        if (value) {
            sendInfo({
                from: `${username ? username : 'apujiyu' + userSerialCode}`,
                msg: value,
                type: 'txt',
                ext: {
                    avatar: avatar,
                    nickName: nickName
                }
            })
            setInputValue()
        }
    }
    const isFourceHeight = (e) => {
        // setAddState(false)
        setBottom(e.detail.height)
        console.log(e.detail.height)
    }
    const selectorQueryClientRect = (selector) => new Promise(resolve => {
        const query = Taro.createSelectorQuery();
        query.select(selector).boundingClientRect((res) => {
            resolve(res);
        }).exec();
    });

    const receiveMsg = (e) => {
        console.log(e, "我发送了消息")
        setAddState(!addState)
        sendInfo({ ...e })
    }

    const callUser = () => {
        agentCall();
    }

    return (
        <View className={`chat_box`} id='chat_bottom' style={{ bottom: `${bottom > 0 ? bottom - bottomSafeHeight : bottom}PX` }}>

            <View className='some_dom'>
                {
                    !voiceState &&
                    <Textarea
                        ref={inputRef}
                        count={false}
                        className='input-box'
                        auto-height
                        confirmType='send'
                        value={inputValue}
                        onInput={(e) => setInputValue(e.detail.value)}
                        onFocus={() => setAddState(false)}
                        adjustPosition={false} //键盘弹起时，是否自动上推页面 
                        onBlur={() => isOnBlur()} //失去焦点触发
                        // onBlur={() => confirmInfo({ detail: { value: '这就是爱情' } })} //失去焦点触发
                        show-confirm-bar={systemInfo.platform === 'ios' ? false : true}
                        onConfirm={(e) => confirmInfo(e.detail.value)}
                        onKeyboardHeightChange={(e) => isFourceHeight(e)} //键盘高度发生变化的时候触发此事件
                        placeholder='和TA聊一聊'
                    />
                }
                {
                    <>
                        {
                            platform === 'pc' ?
                                <View onClick={() => confirmInfo(inputValue)} className='pc_send'>发送</View> :
                                <View className='emoji-button' onClick={callUser}>
                                    <Image src={`${Taro.$baseCdnUrl}/interView/api_call_icon.png`}></Image>
                                </View>
                        }
                    </>
                }

                <View className='plus-button' onClick={handlePlusButtonClick}>
                    {/* 加号按钮 */}
                    <Image src={`${Taro.$baseCdnUrl}/chatRoom/${addState ? 'keyboard_icon' : 'look_icon'}.webp`}></Image>
                </View>
            </View>
            {
                addState && <ChooseType isType={isType} onPost={receiveMsg} />
            }
        </View>
    );
});

export default inject('store')(ChatInput);
