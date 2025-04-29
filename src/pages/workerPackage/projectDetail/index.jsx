/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-29 11:12:00
 * @Description:
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Text, Button, RichText, Block, Canvas, Swiper, SwiperItem } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { replaceNewLinesWithBr, getQueryString, getImageInfo, canvasDrawFillRoundRect, loadImage } from '@/util/utils'
import { decryptData, encryptData } from '@/util/crypto'
import drawQrcode from '@/util/drawQrcode.js'

import Navbar from '@/components/navbar';
import './index.scss'

import { getRecruitmentInfo, signUpAdd, env, bgImages } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        businessStore: { },
        userStore: { isLogin, userInfo, setRole, enterParams, setEnterParams },
        ChatStore: { sessionList, setSessionList },
    } = store

    const [detail, setDetail] = useState({});
    const [isOpened, setIsOpened] = useState(false);

    const [showShareModel, setShowShareModel] = useState(false);   //  是否显示分享弹窗
    const [showSwiper, setShowSwiper] = useState(false);           //  是否显示海报swiper
    const [canvasBg, setCanvasBg] = useState([]);                  //  canvas背景图
    const [codesrc, setCodesrc] = useState('');                    //  二维码图片
    const [swiperImages, setSwiperImages] = useState([]);          //  绘制的海报swiper图片
    const [currentSwiper, setcurrentSwiper] = useState(0);         //  当前swiper下标

    useEffect(() => {
        const allCanvsBgs = bgImages.map(item => getImageInfo(item));
        Promise.all(allCanvsBgs).then(res => {
            // console.log("allCanvsBgs", res);
            setCanvasBg(res);
        }).catch(err => {
            console.error("allCanvsBgs_err", err)
        })
    }, []);

    useEffect(() => {
        if (codesrc && canvasBg.length === 4) {
            const swiperList = canvasBg.map((i, index) => toDrawPhoto(`canvas${index + 1}`, codesrc, i));
            Promise.all(swiperList).then(res => {
                console.log("swiperList", res);
                setSwiperImages(res);
            }).catch(err => {
                console.error("swiperList_err", err)
            })
        }
    }, [codesrc, canvasBg]);

    useEffect(() => {
        const { inviteRole, recruitSerialCode, agentSerialCode, source, q } = route.params;
        console.log("进入到岗位详情页,查看携带的参数", route.params);
        if (inviteRole === 'SEEK') {
            setRole('SEEK');
            Taro.setStorageSync('role', 'SEEK');
        }
        if (recruitSerialCode) {
            getDetail(recruitSerialCode);
        }
        // 缓存进入页面的参数------》管道收益
        if (source && agentSerialCode) {
            setEnterParams({ source, agentSerialCode })
        }
        if (q) {
            let query = getQueryString(decodeURIComponent(q));
            console.log("项目详情解析出的二维码参数", query);
            setEnterParams(query);
            getDetail(query.recruitSerialCode);
            setRole('SEEK');
            Taro.setStorageSync('role', 'SEEK');
        }

    }, [])

    const getDetail = async (recruitSerialCode) => {
        Taro.showLoading({ title: '加载中...' });
        const { code, data, msg } = await getRecruitmentInfo({ recruitSerialCode });
        Taro.hideLoading();
        console.log("getRecruitmentInfo", code, data);
        if (code === 200) {
            if (data.introduction) {
                data.introductionTrans = replaceNewLinesWithBr(data.introduction);
            }
            setDetail(data);
            if (!codesrc) {  // 如果还没绘制过二维码，则绘制
                const res = await generateQrcode(data.recruitSerialCode);
                setCodesrc(res);
            }
        }
    }

    const copyDetail = () => {
        Taro.setClipboardData({
            data: detail.introduction,
            success: function (res) {
                Taro.showToast({
                    title: '复制成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    }

    const signUpFunc = async () => {    // 报名
        if (!isLogin) {
            return setIsOpened(true)
        }
        if (!detail.signUp) {
            let params = {
                source: 'SIGN',
                recruitSerialCode: detail.recruitSerialCode,
                signUpChannel: 'IN_WECHAT_MINI',
                agentSerialCode: enterParams.agentSerialCode
            }
            console.log("报名——params", params, enterParams);
            Taro.showLoading({ title: '报名中...' });
            const { code, data, msg } = await signUpAdd(params);
            Taro.hideLoading();
            if (code === 200) {
                // Taro.showToast({ title: '报名成功', icon: 'success', duration: 2000 });
                setDetail({ ...detail, signUp: true })
            }
        }
    }

    const callFunc = () => {   // 拨打电话
        if (!isLogin) {
            return setIsOpened(true)
        }
        Taro.makePhoneCall({
            phoneNumber: decryptData(detail.recruitPhone),
        }).then(async () => {
            console.log('拨打电话成功');
        }).catch((err) => {
            console.log('拨打电话失败', err);
        });
    }

    const onClose = (e) => {
        if (e === 'success') {
            // forceUpdate()
        }
        setIsOpened(false)
    }

    Taro.useShareAppMessage(res => {
        console.log("求职者分享 userInfo.userSerialCode", userInfo, userInfo?.userSerialCode);
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        let url = `/pages/workerPackage/projectDetail/index?recruitSerialCode=${detail.recruitSerialCode}&inviteRole=SEEK&source=WECHAT_MINI_SHARE&agentSerialCode=${userInfo?.userSerialCode ? userInfo.userSerialCode : ''}`;
        return {
            title: detail.areaName + detail.recruitTitle,
            imageUrl: `${Taro.$cdnUrl}/supplier/supplier_81.webp`, // 图片 URL
            path: url
        }
    })

    Taro.useShareTimeline(() => {   // 分享到朋友圈
        return {
            title: detail.areaName + detail.recruitTitle,
            query: `recruitSerialCode=${detail.recruitSerialCode}&inviteRole=SEEK&source=WECHAT_MINI_SHARE&agentSerialCode=${userInfo?.userSerialCode ? userInfo.userSerialCode : ''}`
        }
    })

    const generateQrcode = async (_recruitSerialCode) => {  // 获取二维码图片
        try {
            const result = await new Promise((resolve, reject) => {
                wx.createSelectorQuery()
                    .select('#codeCanvas')
                    .fields({ node: true, size: true })
                    .exec(res => {
                        if (res && res[0] && res[0].node) {
                            resolve(res);
                        } else {
                            reject(new Error('Failed to get canvas node!!'));
                        }
                    });
            })
            let canvas = result[0].node;
            let _url = env == 'prod' ? 'https://sa-api.apujiyu.com/projectDetailQZWZ' : 'https://sa-test.apujiyu.com/projectDetail';
            let _text = `${_url}?recruitSerialCode=${_recruitSerialCode}&agentSerialCode=${userInfo.userSerialCode}&inviteRole=SEEK&source=WECHAT_MINI_SHARE`;
            drawQrcode({
                canvas: canvas,
                canvasId: 'codeCanvas',
                width: 520,
                padding: 30,
                background: '#ffffff',
                foreground: '#000000',
                text: _text   //`https://sa-api.apujiyu.com/signIn?title=${_title}&recruitSerialCode=${_recruitSerialCode}`
            })
            Taro.hideLoading();

            const _tempFilePath = await new Promise((resolve, reject) => {
                Taro.canvasToTempFilePath({
                    canvasId: 'codeCanvas',
                    canvas: canvas,
                    x: 0,
                    y: 0,
                    width: 520,
                    height: 520,
                    destWidth: 520,
                    destHeight: 520,
                    success(res) {
                        resolve(res.tempFilePath);
                    },
                    fail(err) {
                        reject(err);
                    }
                })
            })
            console.log('获取到的二维码地址', _tempFilePath);
            return _tempFilePath;
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    const toDrawPhoto = async (canvasId, _codeSrc, _canvasBg) => {
        try {
            const res = await new Promise((resolve) => {
                wx.createSelectorQuery()
                    .select(`#${canvasId}`)
                    .fields({ node: true, size: true })
                    .exec(resolve);
            });

            const canvas = res[0].node;
            // 初始化画布大小
            canvas.width = 750;
            canvas.height = 1334;

            const context = canvas.getContext('2d');

            // 绘制背景图片
            const bgImg = await loadImage(canvas, _canvasBg);
            context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // 绘制岗位标题
            context.font = '43px PingFang SC';          // 设置字体大小和样式
            context.fillStyle = '#222222';              // 设置文字颜色
            context.textAlign = 'left';                 // 设置文本对齐方式
            context.textBaseline = 'top';               // 设置文本基线
            context.fillText(detail.recruitTitle.length > 14 ? detail.recruitTitle.slice(0, 14) + '...' : detail.recruitTitle, 54, 864);

            // 绘制岗位薪资

            context.font = '49px';
            context.fillStyle = '#FF5C00';
            context.fillText(detail.recruitSalaryRange.split('元/')[0], 54, 933);
            let metricsWidth = context.measureText(detail.recruitSalaryRange.split('元/')[0]).width;
            if (detail.recruitSalaryRange.split('元/')[1]) {
                context.font = '28px PingFang SC';
                context.fillStyle = '#FF5C00';
                context.fillText('元/' + detail.recruitSalaryRange.split('元/')[1], 58 + metricsWidth, 946);
            }

            // 绘制岗位标签
            let _tags = detail.tags ? [...detail.jobReq, ...detail.tags] : [...detail.jobReq];
            let tagObjs = [];
            let tagsWidth = 642;
            let startX = 54;
            let gap = 11;
            for (let i = 0; i < _tags.length; i++) {
                let obj = {
                    text: _tags[i],
                    textWidth: _tags[i].length * 28,
                    boxWidth: _tags[i].length * 28 + 36,
                }
                tagObjs.push(obj);
            }
            let _tagObjswitdh = 0;
            let finishTag = [];                                 // 最终需要绘制的tags
            for (let i = 0; i < tagObjs.length; i++) {
                _tagObjswitdh += tagObjs[i].boxWidth + gap;     // 计算所有标签的宽度总和
                if (_tagObjswitdh < tagsWidth) {
                    finishTag.push(tagObjs[i]);
                } else {
                    break;
                }
            }
            // console.log("最终需要绘制的标签finishTag:", finishTag);
            let currentX = startX;                              // 标签矩形初始化起始位置
            let currentTextX = startX + 18;                     // 标签文字初始化起始位置

            for (let i = 0; i < finishTag.length; i++) {
                canvasDrawFillRoundRect(context, {              // 绘制带有圆角的矩形
                    fillColor: "#FFF6ED",
                    radius: 4,
                    xx: currentX, yy: 1003,
                    ww: finishTag[i].boxWidth, hh: 45
                });
                currentX += finishTag[i].boxWidth + gap;        // 更新下一个标签的X坐标
                context.font = '28px PingFang SC';
                context.fillStyle = '#E35A0D';
                context.fillText(finishTag[i].text, currentTextX, 1010);
                currentTextX += finishTag[i].boxWidth + gap;    // 更新下一个文字的X坐标
            }

            // 绘制项目地区
            context.font = '32px PingFang SC';
            context.fillStyle = '#333333';
            context.fillText(detail.areaName, 56, 1070);

            // 绘制二维码图片
            const codeImg = await loadImage(canvas, _codeSrc);
            Taro.hideLoading();
            context.drawImage(codeImg, 539, 1126, 148, 148);

            // 将 canvas 绘制的图片导出为临时文件路径
            const tempFilePath = await new Promise((resolve, reject) => {
                Taro.canvasToTempFilePath({
                    canvas: canvas,
                    success: (res) => resolve(res.tempFilePath),
                    fail: (err) => reject(err)
                });
            });
            // console.log("导出的图片路径tempFilePath:", tempFilePath);
            return tempFilePath;
        } catch (error) {
            // console.error('Error in toDrawPhoto:', error);
        }
    };

    const previewImg = (imgSrc, list) => {
        Taro.previewImage({
            current: imgSrc,            // 当前显示图片的链接
            urls: list          // 需要预览的图片列表
        })
    }

    const savePhoto = (src) => {    // 保存海报
        Taro.saveImageToPhotosAlbum({
            filePath: src,
            success(res) {
                Taro.showToast({ title: '保存成功', icon: 'success', duration: 2000 })
            },
            fail(res) {
                Taro.showToast({ title: res, icon: 'none', duration: 2000 })
            }
        })
    }

    const goChat = () => {
        if (!isLogin) {
            return setIsOpened(true)
        }
        let params = {
            recruitSerialCode: detail.recruitSerialCode,
            realUser: detail.realUser,
            title: detail.recruitTitle,
            recruitTitle: detail.recruitTitle,
            recruitSalaryRange: detail.recruitSalaryRange,
            jobReq: detail.jobReq,
            tags: detail.tags,
            userAvatar: detail.userAvatar ? detail.userAvatar : '',
            areaName: detail.areaName,
            createDate: detail.createDate,
            serialCode: detail.contractsSerialCode ? detail.contractsSerialCode : '',       // 发送岗位卡片消息后,企业端需要用serialCode查询岗位详情
            distance: detail.distance ? detail.distance : '',
            phone: detail.recruitPhone ? decryptData(detail.recruitPhone) : '',
            userNickName: detail.userNickName ? detail.userNickName : '',
        }
        let _customExts = { ...params, source: 'IN_WECHAT_MINI' };
        let option = {
            canGroupId: `apujiyu${detail.userSerialCode}`,                                          //`apujiyu${detail.userSerialCode}`,   // + coverSerialCode
            chatType: "singleChat",
            type: "custom",
            to: `apujiyu${detail.userSerialCode}`,                                                  //  `apujiyu${detail.userSerialCode}`,
            from: `apujiyu${userInfo.userSerialCode}`,                               //`apujiyu${userInfo.userSerialCode}`,    // userInfo.userSerialCode
            customEvent: "job",
            ext: {
                ...params,
                applyDate: "",
            },
            customExts: _customExts
        }
        let msg = Taro.WebIM.message.create(option);
        console.log("发送自定义消息体", msg)
        Taro.WebIM.conn.send(msg).then(res => {
            console.log("自定义岗位卡片发送成功: 成功", res);
            setTimeout(() => {
                let _phone = detail.recruitPhone ? decryptData(detail.recruitPhone) : '';
                let url = `/pages/messagePackage/consult/index?recruitSerialCode=${detail.recruitSerialCode}&conversationId=${'apujiyu' + detail.userSerialCode}&userSerialCode=${detail.userSerialCode}&nickname=${detail.userNickName}&phone=${_phone}`
                Taro.navigateTo({
                    url: url
                })
            }, 1000);
            storageMessage(option);
        }).catch(e => {
            console.log("自定义岗位卡片发送成功: 失败 ", e);
        });
    }

    const storageMessage = (option) => {
        let list = [...sessionList]
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
        console.log("发送岗位卡片过后更新 本地 消息列表", list);
        setSessionList([...list])
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='岗位详情' customBack={() => {
                console.log("1")
                let historyPages = Taro.getCurrentPages();    // 历史页面 路由跳转数
                if (historyPages.length === 1) Taro.switchTab({ url: "/pages/workerIndex/index" });
                else Taro.navigateBack({ delta: 1 });         // 多页面跳转
            }}></Navbar>

            <View className='base_info'>
                <View style={`height:72rpx;`}></View>
                <View className='base_info_content'>
                    <View className='base_info_content_title'>{detail.recruitTitle}</View>
                    {
                        detail.recruitSalaryRange &&
                        <View className='base_info_content_range'>
                            {detail.recruitSalaryRange.split('元/')[0]}
                            {
                                detail.recruitSalaryRange.split('元/')[1] && <Text>元/{detail.recruitSalaryRange.split('元/')[1]}</Text>
                            }
                        </View>
                    }
                    <View className='base_info_content_tags'>
                        {
                            (detail.recruitSalaryType === 'DAY' || detail.recruitSalaryType === 'FIXED') &&
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_4${detail.recruitSalaryType === 'DAY' ? 1 : 2}.webp`}></Image>
                        }

                        {
                            detail.jobReq && detail.tags &&
                            <>
                                {
                                    [...detail.jobReq, ...detail.tags].map((r, i) => {
                                        return <View className='base_info_content_tags_item' key={i}>{r}</View>
                                    })
                                }
                            </>
                        }
                    </View>

                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_34.webp`}></Image>
                        <View>岗位类型：{detail.jobTypeName}</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_38.webp`}></Image>
                        <View>岗位薪资：{detail.recruitSalaryRange}</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_35.webp`}></Image>
                        <View>招聘人数：{detail.numberRecruits}人</View>
                    </View>
                    <View className='info_item'>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_36.webp`}></Image>
                        <View>工作地址：{detail.areaName}{detail.detailedAddress}</View>
                    </View>
                </View>
            </View>
            <View className='hr'></View>

            <View className='job_desc'>
                <View className='job_desc_title'>
                    <View>职位描述</View>
                    <View className='job_desc_title_right' onClick={copyDetail}>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_39.webp`}></Image>
                        <View>复制详情</View>
                    </View>
                </View>
                <View className='job_introduce'>
                    <RichText nodes={detail.introductionTrans}></RichText>
                </View>
                {
                    detail.jobImages?.length > 0 &&
                    <View className='job_desc_images'>
                        {
                            detail.jobImages.map((item, index) => {
                                return (
                                    <Image onClick={() => previewImg(item, detail.jobImages)} className='job_desc_images_i' key={index}></Image>
                                )
                            })
                        }
                    </View>
                }
                {/* <View className='line_hr'></View>
                <View className='job_desc_compony'>
                    <View>公司名称</View>
                    <View className='job_desc_compony_name'>{detail.company}</View>
                </View> */}
            </View>
            <View style={`height:240rpx;`}></View>

            <View className='bottom_wrapper'>
                <View style={`height:20rpx;`}></View>
                <View className='page_bottom_btns'>
                    <View className='btn_item' onClick={() => setShowShareModel(true)}>
                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_52.webp`}></Image>
                        <View>分享</View>
                    </View>
                    <View className='btn_item' onClick={goChat}>
                        <Image src={`${Taro.$cdnUrl}/message/message_1.webp`}></Image>
                        <View>私信</View>
                    </View>
                    <View className='bottom_btn' style={`background:rgba(22, 120, 255, 0.11);color:#1678FF`} onClick={callFunc}>
                        <View>电话咨询</View>
                    </View>
                    {
                        detail.signUp ?
                            <View className='bottom_btn' style={`background:#F6F6F6;color:#666`}>
                                <View>已报名</View>
                            </View> :
                            <View className='bottom_btn' style={`background:#1678FF;color:#ffffff`} onClick={signUpFunc}>
                                <View>立即报名</View>
                            </View>
                    }

                </View>

                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Block>
                {
                    showShareModel &&
                    <View className='share_modal'>
                        <View className='share_modal_wrapper'>
                            {
                                showSwiper && swiperImages.length > 0 &&
                                <>
                                    <View className='share_modal_swiper'>
                                        <Swiper
                                            className='swiper_wrap_mySwiper'
                                            circular
                                            current={currentSwiper} onChange={(e) => setcurrentSwiper(e.detail.current)}
                                        >
                                            {
                                                swiperImages.map((item, index) => {
                                                    return (
                                                        <SwiperItem className='swiper_wrap_item' key={index} onClick={() => previewImg(item, swiperImages)}>
                                                            <Image src={item}></Image>
                                                        </SwiperItem>
                                                    )
                                                })
                                            }
                                        </Swiper>
                                    </View>
                                    <View className='swiper_dots'>
                                        {
                                            swiperImages.map((item, index) => {
                                                return (
                                                    <View className={currentSwiper === index ? 'swiper_dot swiper_dot_active' : 'swiper_dot'} key={index}></View>
                                                )
                                            })
                                        }
                                    </View>
                                </>
                            }

                            <View className='share_modal_area'>
                                <View className='share_modal_title'>
                                    <View>分享至</View>
                                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_66.webp`} onClick={() => {
                                        setShowShareModel(false);
                                        setShowSwiper(false);
                                    }}></Image>
                                </View>
                                <View className='share_modal_list'>
                                    <Button className='share_modal_item' open-type='share'>
                                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_63.webp`}></Image>
                                        <View>微信好友</View>
                                    </Button>
                                    <View className='share_modal_item' onClick={() => {
                                        Taro.showModal({ title: '提示', content: '请点击右上角“...”选择分享到朋友圈', showCancel: false });
                                    }}>
                                        <Image src={`${Taro.$cdnUrl}/supplier/supplier_64.webp`}></Image>
                                        <View>朋友圈</View>
                                    </View>
                                    {
                                        showSwiper && swiperImages.length > 0 &&
                                        <View className='share_modal_item' onClick={() => savePhoto(swiperImages[currentSwiper])}>
                                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_65.webp`}></Image>
                                            <View>保存图片</View>
                                        </View> ||
                                        <View className='share_modal_item' onClick={() => setShowSwiper(true)}>
                                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_67.webp`}></Image>
                                            <View>生成海报</View>
                                        </View>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                }
            </Block>

            <Block>
                <View className='Canvas_wrapper'>
                    <Canvas style="width: 520px; height: 520px;" className='codeCanvas' id='codeCanvas' type='2d'></Canvas>
                    <Canvas type='2d' id='canvas1' className='canvas_item'></Canvas>
                    <Canvas type='2d' id='canvas2' className='canvas_item'></Canvas>
                    <Canvas type='2d' id='canvas3' className='canvas_item'></Canvas>
                    <Canvas type='2d' id='canvas4' className='canvas_item'></Canvas>
                </View>
            </Block>

            <Taro.GlobalLogin isOpened={isOpened} onClose={onClose} />
        </View>
    )
})

export default inject('store')(Index)
