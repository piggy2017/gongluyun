/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-04 11:24:31
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-09 10:56:42
 * @Description: 用于存放系统的相关信息
 */
import { observable,makeAutoObservable } from 'mobx'
import Taro from '@tarojs/taro';
const baseStore = observable({
    systemInfo: {},            // 系统信息
    navHeight: 0,              // 导航栏的高度   == 状态栏的高度 + 导航栏中内容区域的高度
    statusTitleHeight: 0,      // 导航栏中状态栏的高度
    contenTitleHeight: 0,      // 导航栏中内容区域的高度
    tabbarHeight: 0,           // 底部tabbar的高度
    bottomSafeAreaHeight: 0,   // 底部安全区域高度
    windowWidth: 0,
    platform: '',              // 平台类型  ios=iOS微信（包含 iPhone、iPad）  android=Android微信  windows=Windows微信  mac=macOS微信  devtools=微信开发者工具
    setSystemInfo() {          // 在小程序的app.jsx调用
        console.log("获取系统信息xxx",this.tabbarHeight);
        let res = Taro.getSystemInfoSync();
        console.log("获取系统信息", res);
        this.systemInfo = res;
        this.bottomSafeAreaHeight = res.screenHeight - res.safeArea.bottom;
        this.windowWidth = res.windowWidth;
        this.platform = (res.platform === 'windows' || res.platform === 'mac' || res.platform === 'devtools') ? 'pc' : 'ph'

        let buttonInfo = Taro.getMenuButtonBoundingClientRect();
        this.navHeight = res.statusBarHeight + buttonInfo.height + (buttonInfo.top - res.statusBarHeight) * 2;
        this.statusTitleHeight = res.statusBarHeight;
        this.contenTitleHeight = buttonInfo.height + (buttonInfo.top - res.statusBarHeight) * 2;
    },
    setTabbarHeight(value){    // 获取底部tabbar的高度 (进入小程序或者切换角色后会自动计算)
        baseStore.tabbarHeight = value;
    },
});

export default baseStore