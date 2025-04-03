/*
 * @Author: yinzhengchao yinzhengchao@apujiyu.com
 * @Date: 2024-01-17 14:00:36
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-31 13:53:02
 * @FilePath: /apu_mini/src/pages/personal/myResource/Skeleton.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 导入React和CSS样式
// import {  } from 'react';
// import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';


// 创建骨架屏组件
const Skeleton = ({ firstHeight = 0 }) => {
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return (
        <>
            <View className='skeleton1' style={{ marginTop: firstHeight }}>
                {/* <View className='skeleton1-avatar'></View> */}
                {
                    listNumber.map((r, index) => {
                        return <View className='skeleton1-content' key={index}>
                            {/* <View className='skeleton1-line'></View> */}
                            <View className='skeleton1-line'>
                                <View className='skeleton1-line-child'>
                                    <View></View>
                                    <View>
                                        <View></View>
                                        <View></View>
                                    </View>
                                    <View></View>
                                </View>
                            </View>
                        </View>
                    })
                }

            </View>
        </>

    );
};

export default Skeleton;