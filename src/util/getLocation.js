/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:25:16
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-11 15:25:32
 * @Description: 
 */

import Taro from '@tarojs/taro';
import QQMapWX from './qqmap-wx-jssdk.min.js'

export const reverseGeocoder = (latitude, longitude) => {
    return new Promise((resolve, reject) => {
        const qqmapsdk = new QQMapWX({
          key: 'KOCBZ-PNZWL-WOPP2-M2EJW-5SNH7-EQFH4'
        });
        qqmapsdk.reverseGeocoder({   // 逆地址解析（从经纬度转换为地址信息）
            location: `${latitude},${longitude}`,
            success: (res) => {
                console.log("腾讯地图 逆地址解析 解析成功",res);
                // const address = res.originalData.result.addressComponent;
                const address = res.result.ad_info;
                resolve(address);
            },
            fail: (err) => {
                console.log("腾讯地图 逆地址解析 解析失败",err);
                reject(err);
            }
        });
    });
}
export const geocode = (address) => {
    return new Promise((resolve, reject) => {
      const qqmapsdk = new QQMapWX({
        key: 'KOCBZ-PNZWL-WOPP2-M2EJW-5SNH7-EQFH4'
      });
      qqmapsdk.geocoder({  // 地址解析，简单来讲就是将结构化地址（省/市/区/街道/门牌号）解析为对应的经纬度坐标
        address: address,
        success: (res) => {
          console.log("地址解析 成功",res);
          const location = res.result.location;   // result.originalData.
          resolve(location);
        },
        fail: (err) => {
          console.log("地址解析 失败",err);
          reject(err);
        }
      });
    });
  }
export const getLocation = () => {
    return new Promise((resolve, reject) => {
        Taro.getLocation({
            type: 'gcj02', // 使用GPS坐标系
            success: (r) => {
              console.log("getLocation",r)
                const { latitude, longitude } = r;
                resolve({ latitude, longitude });
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}