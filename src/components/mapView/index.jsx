/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-01-04 10:09:58
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-31 16:39:12
 * @Description: 
 */
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Map } from '@tarojs/components';
import './index.scss';

const MapView = (observer(({ data, index, store }) => {
    const [location, setLocation] = useState(false);
    useEffect(() => {
        setLocation(data)
    }, [data]);

    const openMap = (e) => {
        console.log(e)
        Taro.openLocation({
            latitude: location.lat,
            longitude: location.lng,
            name: location.buildingName,
            address: location.addr
        })
    }

    return (
        <View className='location-card'>
            <View className='info' onClick={() => console.log('我惦记了')}>
                <View className='title'>{location.buildingName}</View>
                <View className='address'>{location.addr}</View>
            </View>
            <Map
                className='map'
                id={`map${index}`}
                latitude={location.lat}
                longitude={location.lng}
                enableZoom={false}
                enableScroll={false}
                markers={[{
                    latitude: location.lat,
                    longitude: location.lng,
                    // iconPath: '路径/to/标记图标',
                    width: 10,
                    height: 15
                }]}
                onTap={openMap}
                show-location
                scale={16}
            />
            <View className='top_view'></View>
        </View>
    );
}));

export default inject('store')(MapView);
