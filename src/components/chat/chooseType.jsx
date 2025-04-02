import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image, } from '@tarojs/components';
import './index.scss';

const ChatInput = observer(({ onPost, store, isType = 'groupChat' }) => {
    const { userStore: { userInfo: { avatar, nickName } }, } = store

    const handlePhotoClick = async (type) => {
        let sourceType = {
            1: 'album',
            2: 'camera'
        }
        try {
            const res = await Taro.chooseImage({
                count: 1, // 最多可选择的图片数量
                sourceType: [sourceType[type]], // 图片来源，可选值：album（相册），camera（相机）
                sizeType: ['compressed'], // 图片尺寸类型，可选值：original（原图），compressed（压缩图）
            });
            sendPrivateImg(res);

        } catch (error) {
            console.log('选择照片失败：', error);
        }
    };
    const sendPrivateImg = (img) => {
        var tempFilePaths = img.tempFilePaths;
        var token = Taro.WebIM.conn.context.accessToken;
        Taro.getImageInfo({
            src: img.tempFilePaths[0],
            success(res) {
                var allowType = {
                    jpg: true,
                    jpeg: true,
                    gif: true,
                    png: true,
                    bmp: true,
                    webp: true
                };
                var str = Taro.WebIM.conn.appKey.split("#");
                var width = res.width;
                var height = res.height;
                var index = res.path.lastIndexOf(".");
                var filetype = (~index && res.path.slice(index + 1)) || "";
                var domain = Taro.WebIM.conn.apiUrl + "/";
                console.log(filetype, "filetype")
                if (filetype.toLowerCase() in allowType) {
                    Taro.uploadFile({
                        url: domain + str[0] + "/" + str[1] + "/chatfiles",
                        filePath: tempFilePaths[0],
                        name: "file",
                        header: {
                            "Content-Type": "multipart/form-data",
                            Authorization: "Bearer " + token,
                        },
                        success(result) {
                            if (result.statusCode === 400) {
                                // 图片上传阿里云检验不合法
                                var errData = JSON.parse(result.data);
                                if (errData.error === "content improper") {
                                    Taro.showToast({
                                        title: "图片不合法",
                                    });
                                    return false;
                                }
                            }
                            var data = result.data;
                            var dataObj = JSON.parse(data);
                            var option = {
                                type: "img",
                                chatType: isType,
                                width: width,
                                height: height,
                                url: dataObj.uri + "/" + dataObj.entities[0].uuid,
                                ext: {
                                    avatar: avatar,
                                    nickName: nickName
                                }
                            };
                            onPost(option)
                        },
                    });
                }
            },
        });
    }
    const handleButtonClick = async () => {
        try {
            const res = await Taro.chooseLocation();
            // 获取到用户选择的位置信息
            const { latitude, longitude, name, address } = res;
            console.log('选择的位置：', res, latitude, longitude, name, address);
            let option = {
                type: "loc",
                chatType: isType,
                addr: address,
                buildingName: name,
                lat: latitude, // 纬度
                lng: longitude, // 经度
                ext: {
                    avatar: avatar,
                    nickName: nickName
                }
            };
            onPost(option)
        } catch (error) {
            console.log('选择位置失败：', error);
            if (error.errMsg == "getLocation:fail auth deny") {
                Taro.openSetting({
                    success: (res) => {
                        // 授权弹窗点击确定
                        if (res.authSetting['scope.userLocation']) {
                            // 用户同意了位置授权
                            // 执行相关逻辑
                        } else {
                            // 用户仍然拒绝了位置授权
                            // 可以提示用户或执行其他操作
                        }
                    }
                });
            }
        }
    };

    return (
        <>
            <View className='bottom_dom'>
                <View onClick={() => handlePhotoClick(1)}> <Image src={`${Taro.$baseCdnUrl}/chatRoom/chat_icon_photo.png`}></Image><View>照片</View></View>
                <View onClick={() => handlePhotoClick(2)}> <Image src={`${Taro.$baseCdnUrl}/chatRoom/camera_back.webp`}></Image><View>相机</View></View>
                <View onClick={handleButtonClick}> <Image src={`${Taro.$baseCdnUrl}/chatRoom/chat_icon_address.png`}></Image><View>定位</View></View>
            </View>
        </>

    );
});

export default inject('store')(ChatInput);
