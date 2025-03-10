/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-03 13:44:13
 * @Description: 
 */
import { useEffect } from 'react';
import Taro, { useLaunch } from '@tarojs/taro'
import { Provider } from 'mobx-react'
import baseStore from '@/store/base'
import userStore from '@/store/user'
import businessStore from '@/store/business'
import LoginComponent from '@/components/login';
import JoinSupplier from '@/components/joinSupplier';
import ChoosePattern from '@/components/choosePattern';
import LoadMore from './components/loadMore';
import NoData from './components/noData';
import './app.scss'
const store = {
  baseStore,userStore,businessStore
}
function App({ children }) {

  useLaunch(() => {
    console.log('App launched.')
  })

  useEffect(()=>{
    baseStore.setSystemInfo();
    // businessStore.setSourceList();
    Taro.$cdnUrl = 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject';
    Taro.$cdnBackIcon = 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/mine/back_icon.webp';
    Taro.$cdnBlackBackIcon = 'https://apu-mini.oss-cn-hangzhou.aliyuncs.com/saasProject/supplier/supplier_5.webp';
    Taro.$baseCdnUrl = 'https://apu-mini.oss-accelerate.aliyuncs.com';
    Taro.GlobalLogin = LoginComponent;
    Taro.GlobalJoinSupplier = JoinSupplier;
    Taro.ChoosePattern = ChoosePattern;
    Taro.LoadMore = LoadMore;
    Taro.NoData = NoData;
  },[])

  useEffect(() => {
    if (Taro.canIUse('getUpdateManager')) {
      const updateManager = Taro.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            Taro.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              // eslint-disable-next-line no-shadow
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            Taro.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      Taro.showModal({
        title: '提示',
        content: '当前微信版本过低，无法更好体验程序，请升级到最新微信版本后重试。'
      })
    }
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

export default App
