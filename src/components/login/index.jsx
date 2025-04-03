/* eslint-disable import/first */
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Input, Image, Text } from '@tarojs/components';
import { AtFloatLayout } from 'taro-ui';
import "taro-ui/dist/style/components/float-layout.scss";
import { observer, inject } from 'mobx-react';
import { decryptData, encryptData } from '@/util/crypto'
import './index.scss';

import { loginPhone, checkSupplier, switchRoles } from '@/util/api';

const Index = observer(({ store, onClose, isOpened, isSupplier }) => {
    const [isShow, setIsOpened] = useState(false);
    const [isNornalLogin, setIsNornalLogin] = useState(1);

    const {
        baseStore: { didPrivacy, setdidPrivacy },
        ChatStore: { setSessionList, setCursor, setHxUser },
        userStore: { setToken, setIsLogin, enterParams, setUserInfo, getRoleAndPermissionFunc, setSupplierCompanyInfo }
    } = store
    useEffect(() => {
        if (isOpened) {
            setIsOpened(isOpened)
        }
        return () => {
            setIsOpened(false)
            setIsNornalLogin(1)
        }
    }, [isOpened])

    const handleClose = (type) => {
        console.log("触发 关闭 login")
        setIsOpened(false)
        onClose(type)
    }

    const handleGetPhoneNumber = async (e) => {
        try {
            const info = await Taro.login();
            const { code, errMsg } = e.detail;
            if (errMsg === 'getPhoneNumber:ok') {
                Taro.showLoading({
                    title: "请求中",
                    mask: true
                })
                let params = {
                    loginCode: info.code,
                    phoneCode: code,
                    loginPlatform: Taro.getSystemInfoSync().platform === 'android' ? 1 : 2
                }

                // 注册时绑定邀请人
                const { source, agentSerialCode } = enterParams;
                console.log("登陆注册时绑定邀请人,agentSerialCode:", agentSerialCode);
                if (source) {
                    params.signUpChannel = source
                }
                if (agentSerialCode) {
                    params.bindUserSerialCode = agentSerialCode
                }

                console.log("一键登录,提交的参数", params)
                const result = await loginPhone(params);
                console.log("手机号码登录结果", result);
                Taro.hideLoading();
                if (result.code === 200) {
                    Taro.showToast({ title: "登录成功", icon: "none", duration: 2000 })
                    setToken(result.data.token);
                    Taro.setStorageSync('token', result.data.token);
                    Taro.setStorageSync('isLogin', 1);
                    // Taro.setStorageSync('role', result.data.user.userRole);
                    Taro.setStorageSync('userInfo', result.data.user);
                    setIsLogin(1);
                    setHxUser(result.data.hxUser);
                    // loginhxIM(result.data.hxUser);
                    setUserInfo(result.data.user);
                    // setRole(result.data.user.userRole);
                    getRoleAndPermissionFunc();
                    handleClose();
                    if (isSupplier) {
                        console.log("供应商登录后,调接口切换到供应商")
                        switchRoles({ userRole: 'SUPPLIER' }).then(res => {
                            console.log("供应商登录后,调接口切换到供应商__", res);
                            if (res.code === 200) {

                            }
                        })
                    }
                    setTimeout(() => {
                        checkIssuppier();
                    }, 100);
                } else {
                    Taro.showToast({ title: result.msg, icon: "none", duration: 2000 })
                }
            }
        } catch (error) {
            console.error('获取用户手机号失败:', error);
        }
    }

    const handleAgree = (type) => {
        if (type) {   // 点击同意
            setdidPrivacy(true);
            setIsNornalLogin(1);
        }
    }

    const checkIssuppier = async () => {
        const { code, data, msg } = await checkSupplier({});
        console.log("checkIssuppier", code, data, msg)
        setSupplierCompanyInfo(data);
    }

    // const loginhxIM = (hxUser) => {
    //     let { username, password } = hxUser
    //     console.log(decryptData(password))
    //     Taro.WebIM.conn.open({
    //         user: username,
    //         pwd: decryptData(password),
    //     }).then(() => {
    //         console.log("login success");
    //         getMessageList()
    //     }).catch((reason) => {
    //         console.log("login fail", reason);
    //     });
    // }

    // const getMessageList = () => {
    //     Taro.WebIM.conn.getServerConversations({ pageSize: 20, cursor: '' }).then((res) => {
    //         setSessionList(res.data.conversations)
    //         const { cursor } = res.data
    //         if (cursor) {
    //             setCursor(cursor)
    //         }
    //     })
    // }


    const viewPrivacy = () => {
        console.log("viewPrivacyviewPrivacy")
        // 打开隐私协议页面
        wx.openPrivacyContract({
            success: () => {   // 打开成功
                console.log('打开隐私协议页面成功')
            },
            fail: () => {   // 打开失败
                console.log('打开隐私协议页面失败')
            },
            complete: () => { }
        })
    }

    return (
        <>
            <AtFloatLayout
                className={`is_layout ${!didPrivacy ? 'is_layout_didPrivacy' : ''} ${isNornalLogin === 2 ? 'phone_layout' : ''}`}
                isOpened={isShow}
                title={didPrivacy ? " " : ""}
                onClose={() => handleClose(null)}
                catchMove>
                {
                    !didPrivacy &&
                    <View className='privacy_wrapper'>
                        <View className='privacy_wrapper_bg'>
                            {/* <View className='privacy_wrapper_bg_top'></View> */}
                            <View className='privacy_wrapper_title'>用户隐私保护提示</View>
                            <View className='privacy_wrapper_content'>
                                在你使用
                                <Text className='privacy_wrapper_name'>千职万职</Text>
                                服务之前，请阅读
                                <Text className='privacy_wrapper_link' onClick={() => viewPrivacy()}>《千职万职小程序隐私保护指引》</Text>
                                如你同意该指引，请点击“同意并继续”开始使用本小程序。
                            </View>

                            <View className='privacy_wrapper_btns'>
                                <Button
                                    id="disagree-btn"
                                    className='privacy_wrapper_btn_cancel'
                                    // onClick={() => handleDisagree(false)}
                                    onClick={() => handleClose(null)}
                                >拒绝</Button>
                                <Button
                                    id="agree-btn"
                                    className='privacy_wrapper_btn_agree'
                                    openType='agreePrivacyAuthorization'
                                    onClick={() => handleAgree(true)}
                                >
                                    同意并继续</Button>
                            </View>
                        </View>
                    </View> ||
                    didPrivacy && isNornalLogin === 1 &&
                    <View className='login_box'>
                        <View className='login_title'>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_74.webp`}></Image>
                            {/* <View>千职万职</View> */}
                        </View>
                        <View className='login_slogn'>登录后更方便使用小程序</View>
                        <Button className='logn_btn' openType='getPhoneNumber' onGetPhoneNumber={handleGetPhoneNumber}>一键登录</Button>
                        {/* <View className='other_login' onClick={() => setIsNornalLogin(2)}>其他手机号登录</View> */}
                    </View>
                }
            </AtFloatLayout>
        </>
    )
})

export default inject('store')(Index)
