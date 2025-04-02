/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:02:33
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-31 14:27:24
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
        ChatStore: { unReadTotal },
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
            6: '/supplier/supplier_32.webp',
            7: '/supplier/supplier_72.png',
            8: '/message/message_2.webp'
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
            6: '/supplier/supplier_31.webp',
            7: '/supplier/supplier_73.png',
            8: '/message/message_3.webp'
        }
        return Taro.$cdnUrl + map[index]
    }
    const changeTab = (e) => {
        console.log("点击自定义tabbar触发——changeTab", e, role)
        // setActCurrent(e)
        if (role === 'ADMIN' || role === 'CUSTOMER') {
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
                        url: '/pages/message/index'
                    });
                    break;
                case 4:
                    Taro.switchTab({
                        url: '/pages/mine/index'
                    });
                    break;
            }
        } else if (role === 'ON_SITE') {
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
                        url: '/pages/message/index'
                    });
                    break;
                case 4:
                    Taro.switchTab({
                        url: '/pages/mine/index'
                    });
                    break;
            }
        } else if (role === 'CHANNEL') {    // 渠道
            switch (e) {
                case 0:
                    Taro.switchTab({
                        url: '/pages/channelIndex/index'
                    });
                    break;
                case 1:
                    Taro.switchTab({
                        url: '/pages/message/index'
                    });
                    break;
                case 2:
                    Taro.switchTab({
                        url: '/pages/mine/index'
                    });
                    break;
            }
        } else if (role === 'SUPPLIER') {
            switch (e) {
                case 0:
                    Taro.switchTab({
                        url: '/pages/supplierProject/index'
                    });
                    break;
                case 1:
                    Taro.switchTab({
                        url: '/pages/mine/index'
                    });
                    break;
            }
        } else if (role === 'SEEK') {
            switch (e) {
                case 0:
                    Taro.switchTab({
                        url: '/pages/workerIndex/index'
                    });
                    break;
                case 1:
                    Taro.switchTab({
                        url: '/pages/message/index'
                    });
                    break;
                case 2:
                    Taro.switchTab({
                        url: '/pages/mine/index'
                    });
                    break;
            }
        }
    }
    const getTabList = () => {
        if (role === 'ADMIN' || role === 'CUSTOMER') {
            return [
                { title: '工作台', image: getdefalutIcon(1), selectedImage: getSelectIcon(1) },
                { title: '项目管理', image: getdefalutIcon(2), selectedImage: getSelectIcon(2) },
                { title: '线索', image: getdefalutIcon(3), selectedImage: getSelectIcon(3) },
                { title: '消息', text: unReadTotal || '', max: 99, image: getdefalutIcon(8), selectedImage: getSelectIcon(8) },
                { title: '我的', image: getdefalutIcon(4), selectedImage: getSelectIcon(4) },
            ]
        } else if (role === 'ON_SITE') {
            return [
                { title: '工作台', image: getdefalutIcon(1), selectedImage: getSelectIcon(1) },
                { title: '项目管理', image: getdefalutIcon(2), selectedImage: getSelectIcon(2) },
                { title: '名单', image: getdefalutIcon(5), selectedImage: getSelectIcon(5) },
                { title: '消息', text: unReadTotal || '', max: 99, image: getdefalutIcon(8), selectedImage: getSelectIcon(8) },
                { title: '我的', image: getdefalutIcon(4), selectedImage: getSelectIcon(4) },
            ]
        } else if (role === 'CHANNEL') {  // 渠道
            return [
                { title: '供应商', image: getdefalutIcon(7), selectedImage: getSelectIcon(7) },
                { title: '消息', text: unReadTotal || '', max: 99, image: getdefalutIcon(8), selectedImage: getSelectIcon(8) },
                { title: '我的', image: getdefalutIcon(4), selectedImage: getSelectIcon(4) },
            ]
        }
        else if (role === 'SUPPLIER') {  // 供应商 并且未开通公路云
            return [
                { title: '项目管理', image: getdefalutIcon(2), selectedImage: getSelectIcon(2) },
                { title: '我的', image: getdefalutIcon(4), selectedImage: getSelectIcon(4) },
            ]
        } else if (role === 'SEEK') {          // 求职者
            return [
                { title: '首页', image: getdefalutIcon(6), selectedImage: getSelectIcon(6) },
                { title: '消息', text: unReadTotal || '', max: 99, image: getdefalutIcon(8), selectedImage: getSelectIcon(8) },
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
    )
})

export default inject('store')(Index)
