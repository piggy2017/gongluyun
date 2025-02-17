/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 14:51:53
 * @LastEditors: 孙林
 * @LastEditTime: 2025-02-17 17:14:13
 * @Description: 
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import './index.scss';

/*
    fixed: 是否固定在顶部，默认不固定
    back: 是否显示返回按钮,默认显示
    whiteIcon: 返回按钮是否为白色，默认为黑色
    title: 标题,默认不显示
    bgColor: 背景颜色,默认白色
    titleColor: 标题颜色,默认黑色
    placeholder: 当fixed=true时，是否显示占位
*/
const Navbar = observer(({ store, fixed = false, back = true, title = '', bgColor, placeholder = false, whiteIcon = false, titleColor, customBack }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight },
    } = store

    useEffect(() => {
        console.log("bgColor,fixed,title", bgColor, fixed, title);
    }, [bgColor, fixed, title])
    return (
        <>
            <View className={`navbar ${fixed ? 'navbar_fixed' : ''}`} style={`background-color:${bgColor ? bgColor : '#fff'}`}>
                <View className='my_header_hr' style={`--statusBarHeight:${statusTitleHeight}px;`}></View>
                <View className='my_header_content' style={`--navContentHeight:${contenTitleHeight}px;`}>
                    <View className='navbar_back'>
                        {
                            back && <Image src={`${whiteIcon ? Taro.$cdnBlackBackIcon : Taro.$cdnBackIcon}`} onClick={() => {
                                // if(customBack){
                                //     customBack();
                                // }else{
                                //     Taro.navigateBack({ delta: 1 })
                                // }

                                let historyPages = Taro.getCurrentPages();   //历史页面 路由跳转数
                                if (historyPages.length === 1) Taro.switchTab({ url: `/pages/index/index` });
                                else Taro.navigateBack({ delta: 1 });//多页面跳转

                            }}></Image>
                        }
                    </View>
                    <View className='navbar_title' style={`color:${titleColor ? titleColor : '#000000'}`}>{title}</View>
                </View>
            </View>
            {
                fixed && placeholder && <View className='placeholder' style={`height:${statusTitleHeight + contenTitleHeight}px`}></View>
            }
        </>
    );
});

export default inject('store')(React.memo(Navbar, (prevProps, nextProps) => {
    return prevProps.store === nextProps.store;
}));