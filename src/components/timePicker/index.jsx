/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-05 15:07:32
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-06 16:52:54
 * @Description: 时间选择器 -- HH:mm
 */
import React, { useState, useEffect } from 'react';
// import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, PickerView, PickerViewColumn, Button } from '@tarojs/components';
import { AtFloatLayout, } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss';

const TimePicker = observer(({ onChange, showPicker, onClose, store }) => {
    const [value, setVal] = useState([]);
    const [chooseIndex, setChoose] = useState([10, 30]);   // 默认的下标值
    const [hours, setHours] = useState(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24']) // 01-24小时)
    const [minutes, setMinutes] = useState(['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
        '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']) // 00-59分钟

    const handleChange = (e) => {
        let val = e.detail.value;
        console.log("handleChange", val);
        setChoose(val);
    }
    const sure = (e) => {
        console.log("sure", e, chooseIndex);
        const list = [hours[chooseIndex[0]], minutes[chooseIndex[1]]];
        onChange({ data: list });
        onClose();
    }
    return (
        <>
            <AtFloatLayout isOpened={showPicker} className='picker_layout' catchMove onClose={() => onClose()}>
                <View className='title_box'>
                    <View>面试时间</View>
                </View>
                <PickerView indicatorStyle='height: 50px;' immediateChange className='picker' value={chooseIndex} onChange={handleChange}>
                    <PickerViewColumn>
                        {hours.map((item, idx) => <View key={idx} style='line-height: 100rpx'>{item}</View>)}
                    </PickerViewColumn>

                    <PickerViewColumn>
                        {minutes.map((item, idx) => <View key={idx} style='line-height: 100rpx'>{item}</View>)}
                    </PickerViewColumn>
                </PickerView>
                <Button className='sure_btn' onClick={(e) => sure(e)}>确定</Button>
            </AtFloatLayout>
        </>
    );
});

// export default inject('store')(TimePicker);
export default inject('store')(React.memo(TimePicker, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));