/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 14:51:53
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-10 15:58:14
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
    title: 标题,默认不显示
    bgColor: 背景颜色,默认白色
    placeholder: 当fixed=true时，是否显示占位
*/
const Navbar = observer(({ store, fixed = false, back = true, title = '', bgColor, placeholder = false, customBack }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight, bottomSafeAreaHeight },
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
                            back && <Image src={`${Taro.$cdnBackIcon}`} onClick={() => {
                                if(customBack){
                                    customBack();
                                }else{
                                    Taro.navigateBack({ delta: 1 })
                                }
                                
                            }}></Image>
                        }
                    </View>
                    <View className='navbar_title'>{title}</View>
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