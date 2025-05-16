/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-16 17:56:59
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Canvas, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import drawQrcode from '@/util/drawQrcode.js'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'
import { contractsJobSelector, env } from '@/util/api'
const Index = observer(({ store }) => {
    const route = useRouter();

    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { companyInfo },
    } = store

    const [codesrc, setCodesrc] = useState('');
    const [recruitSerialCode, setRecruitSerialCode] = useState('');
    const [showModel, setShowModel] = useState(false);
    const [title, setTitle] = useState('');

    const [list, setList] = useState([]);

    useEffect(() => {
        const { recruitSerialCode, title, type, isAll, list } = route.params;
        console.log("根据选择的岗位列表生成的二维码页面,收到的列表数据", list);
        setRecruitSerialCode(recruitSerialCode);
        setTitle(title);
        Taro.showLoading({ title: '二维码生成中...' })
        setTimeout(() => {
            generateQrcode(recruitSerialCode, title, isAll, list);
        }, 300);
    }, [])

    const generateQrcode = async (_recruitSerialCode, _title, _isAll, _list) => {
        try {
            const result = await new Promise((resolve, reject) => {
                wx.createSelectorQuery()
                    .select('#myCanvas')
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

            // https://sa-test.apujiyu.com/signInTest 测试环境
            // https://sa-api.apujiyu.com/signIn 正式环境
            
            let _url = env == 'prod' ? 'https://sa-api.apujiyu.com/signInQZWZ' : 'https://sa-test.apujiyu.com/signInTestQZWZ'
            let _text = _isAll ? `${_url}?isAll=${_isAll}&companySerialCode=${companyInfo.companySerialCode}&list=${_list}` : `${_url}?title=${_title}&companySerialCode=${companyInfo.companySerialCode}&recruitSerialCode=${_recruitSerialCode}`

            drawQrcode({
                canvas: canvas,
                canvasId: 'myCanvas',
                width: 520,
                padding: 30,
                background: '#ffffff',
                foreground: '#000000',
                text: _text   //`https://sa-api.apujiyu.com/signIn?title=${_title}&recruitSerialCode=${_recruitSerialCode}`
            })
            Taro.hideLoading();

            const _tempFilePath = await new Promise((resolve, reject) => {
                Taro.canvasToTempFilePath({
                    canvasId: 'myCanvas',
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
            console.log('二维码临时路径：', _tempFilePath);
            setCodesrc(_tempFilePath);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    const getList = async () => {
        Taro.showLoading({ title: '加载中...' });
        let params = {
            pageNo: 1,
            pageSize: 50,
            searchInfo: ''
        }
        const { code, data } = await contractsJobSelector(params);
        console.log("getClueList", code, data);
        Taro.hideLoading();
        if (code === 200 && data.responses?.length > 0) {
            for (let i = 0; i < data.responses.length; i++) {
                data.responses[i].selected = false;
                if (data.responses[i].recruitSerialCode === recruitSerialCode) {
                    data.responses[i].selected = true;
                }
            }
            setList([...data.responses]);
        } else {
            setList([]);
        }
    }

    const chooseJob = (obj, index) => {
        setList(list => {
            let _list = list.map((item, i) => {
                item.selected = false;
                return item
            })
            _list[index].selected = true
            return _list
        });
        setTitle(obj.title);
        setRecruitSerialCode(obj.recruitSerialCode);
        setShowModel(false);
        generateQrcode(obj.recruitSerialCode, obj.title);
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='签到码'></Navbar>
            <Canvas style="width: 520px; height: 520px;" className='myCanvas' id='myCanvas' type='2d'></Canvas>
            <View className='code_content'>
                {
                    route.params.type &&
                    <View className='content_title' onClick={() => {
                        setShowModel(true)
                        if (list.length == 0) {
                            getList();
                        }
                    }}>
                        <View>{title}</View>
                        <AtIcon value='chevron-right' size='14' color='#222222'></AtIcon>
                    </View>
                }

                <Image src={codesrc}></Image>
                <View>求职者扫一扫上面二维码</View>
                <View>把已约面更新为已到面</View>
            </View>


            <Block>
                <AtFloatLayout catchMove className='role_init_layout' isOpened={showModel} onClose={() => { setShowModel(false) }}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>切换岗位</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowModel(false) }}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    list.length > 0 && list.map((item, index) => {
                                        return (
                                            <View onClick={() => { chooseJob(item, index) }} className='job_item flex-row-between' key={index}>
                                                <View className='job_item_name row-show-1'>{item.title}</View>
                                                {
                                                    item.selected && <Image src={`${Taro.$cdnUrl}/index/index_icon13.webp`}></Image>
                                                }
                                            </View>
                                        )
                                    })
                                }

                            </View>
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
