/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-03-10 17:58:09
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-10 18:02:04
 * @Description: 列表加载更多loading组建
 */
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import "taro-ui/dist/style/components/icon.scss";
import './index.scss';

const LoadMore = observer(({ goonLoad, store }) => {

    return (
        <>
            <View className='loading_text'>
                {
                    goonLoad ?
                        <>
                            <AtIcon value='loading-3' size='16' color='#8E8E93'></AtIcon>
                            加载中
                        </> :
                        "数据已经到底了"
                }
            </View>
        </>
    );
});

// export default inject('store')(AgePicker);
export default inject('store')(React.memo(LoadMore, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.goonLoad === nextProps.goonLoad && prevProps.store === nextProps.store;
}));