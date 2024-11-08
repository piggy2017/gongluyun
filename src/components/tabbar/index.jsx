/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:02:33
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-07 14:36:32
 * @Description: 
 */

import { useEffect, useState, useReducer } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtTabBar } from 'taro-ui'
import { observer, inject } from 'mobx-react';
import "taro-ui/dist/style/components/tab-bar.scss";
import "taro-ui/dist/style/components/noticebar.scss";
import './index.scss';

const Index = observer(({ store, actCurrent }) => {
    const {
        userStore: { role, setRole },
        baseStore: { setTabbarHeight }
    } = store;

    const selectorQueryClientRect = (selector) => new Promise(resolve => {
        const query = Taro.createSelectorQuery();
        query.select(selector).boundingClientRect((res) => {
            resolve(res);
        }).exec();
    });

    useEffect(() => {
        setTimeout(async () => {
            const query_tab = await selectorQueryClientRect('.at-tab-bar');
            if (query_tab) {
                console.log("query_tab", query_tab);
                setTabbarHeight(query_tab.height)
            }
        }, 0);
    }, [role])

    //  https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/tabbar/clue_active.webp
    //  https://apu-mini.oss-accelerate.aliyuncs.com/saasProject/tabbar/clue_active.webp

    const getdefalutIcon = (index) => {
        let map = {
            1: '/tabbar/index_default.webp',
            2: '/tabbar/project_default.webp',
            3: '/tabbar/clue_default.webp',
            4: '/tabbar/mine_default.webp',
            5: '/tabbar/list_default.webp',
        }
        return Taro.$cdnUrl + map[index]
    }
    const getSelectIcon = (index) => {
        let map = {
            1: `/tabbar/index_active.webp`,
            2: `/tabbar/project_active.webp`,
            3: `/tabbar/clue_active.webp`,
            4: `/tabbar/mine_active.webp`,
            5: `/tabbar/list_active.webp`,
        }
        return Taro.$cdnUrl + map[index]
    }
    const changeTab = (e) => {
        console.log("点击自定义tabbar触发——changeTab", e, role)
        // setActCurrent(e)
        if (role === 'ADMIN' || role === 'CUSTOMER' || role === 'SEEK') {
            switch (e) {
                case 0:
                    Taro.switchTab({
                        url: '/pages/index/index'
                    });
                    break;
                case 1:
                    Taro.switchTab({
                        url: '/pages/projectManage/index'
                    });
                    break;
                case 2:
                    Taro.switchTab({
                        url: '/pages/clue/index'
                    });
                    break;
                case 3:
                    Taro.switchTab({
                        url: '/pages/mine/index'
                    });
                    break;
            }
        }else if(role === 'ON_SITE'){
            switch (e) {
                case 0:
                    Taro.switchTab({
                        url: '/pages/index/index'
                    });
                    break;
                case 1:
                    Taro.switchTab({
                        url: '/pages/projectManage/index'
                    });
                    break;
                case 2:
                    Taro.switchTab({
                        url: '/pages/onSiteList/index'
                    });
                    break;
                case 3:
                    Taro.switchTab({
                        url: '/pages/mine/index'
                    });
                    break;
            }
        }
    }
    const getTabList = () => {

        if (role === 'ADMIN' || role === 'CUSTOMER' || role === 'SEEK') {
            return [
                { title: '工作台', image: getdefalutIcon(1), selectedImage: getSelectIcon(1) },
                { title: '项目管理', image: getdefalutIcon(2), selectedImage: getSelectIcon(2) },
                { title: '线索', image: getdefalutIcon(3), selectedImage: getSelectIcon(3) },
                { title: '我的', image: getdefalutIcon(4), selectedImage: getSelectIcon(4) },
            ]
        } else if (role === 'ON_SITE') {
            return [
                { title: '工作台', image: getdefalutIcon(1), selectedImage: getSelectIcon(1) },
                { title: '项目管理', image: getdefalutIcon(2), selectedImage: getSelectIcon(2) },
                { title: '名单', image: getdefalutIcon(5), selectedImage: getSelectIcon(5) },
                { title: '我的', image: getdefalutIcon(4), selectedImage: getSelectIcon(4) },
            ]
        }
    }
    return (
        <AtTabBar
            fixed
            color='#666666'
            fontSize={11}
            selectedColor='#1678FF'
            tabList={getTabList()}
            onClick={changeTab}
            current={actCurrent}
        />
        // <View style={{ backgroundColor: '#fff' }}>

        // </View>

    )
})

export default inject('store')(Index)
