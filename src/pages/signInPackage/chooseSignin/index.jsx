/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 09:47:15
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-16 14:54:41
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro';
import { View, Image, Text, Input, ScrollView, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import Navbar from '@/components/navbar';
import './index.scss'


const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
        businessStore: { signinSelectJob, setSigninSelectJob }
    } = store
    const [list, setList] = useState([]);

    useEffect(() => {
        if (signinSelectJob) {
            let _list = JSON.parse(JSON.stringify(signinSelectJob));
            setList(_list);
        }
    }, [signinSelectJob])

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight + 10 + bottomSafeAreaHeight}px - 116rpx)`;
    }

    const chooseItem = (obj, index) => {
        console.log("chooseItem", obj, index);
        setList(list => {
            let _list = JSON.parse(JSON.stringify(list));
            _list[index].selected = !_list[index].selected;
            return _list;
        })
    }

    const postDataFunc = () => {
        let _hasSeleted = list.some(item => item.selected);
        if (_hasSeleted) {
            console.log("_hasSeletedlist", list)
            setSigninSelectJob(list);
            setTimeout(() => {
                Taro.navigateBack({ delta: 1 });
            }, 300);

        } else {
            Taro.showToast({ title: '请选择报名岗位', icon: 'none' });
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFF' title='报名岗位'></Navbar>

            <ScrollView
                scrollY
                className='scrollWrapper'
                style={{ height: getHeight() }}
                scrollWithAnimation
                showScrollbar={false}
                enablePassive
                refresherEnabled
                lowerThreshold={300}
            >
                {
                    list.length > 0 && list.map((item, index) => {
                        return <View className='job_item flex-row-between' key={index} onClick={() => chooseItem(item, index)}>
                            <View className='job_item_name row-show-1'>{item.title}</View>
                            {
                                item.selected && <Image src={`${Taro.$cdnUrl}/index/index_icon13.webp`}></Image>
                            }
                        </View>
                    })
                }
            </ScrollView>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                <View className='post_btn' onClick={postDataFunc}>确定</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
