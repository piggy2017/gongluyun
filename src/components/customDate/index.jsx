/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-05 15:39:11
 * @LastEditors: 孙林
 * @LastEditTime: 2025-07-04 11:49:49
 * @Description: 自定义选择日期或者日期范围
 */
import React, { useState, useEffect, useReducer } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Block, RootPortal, Picker } from '@tarojs/components';
import { AtFloatLayout, AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss';

import DatePicker from '@/components/datePicker'

/*
 * defaultToday: 是否默认选中 今日
 */

const CustomDate = observer(({ showPicker, defaultToday, onClose, onChange, store }) => {
    const filterList = [                 // 时间筛选列表
        { text: "全部日期", code: "" },
        { text: "今日", code: "TODAY" },
        { text: "昨日", code: "YESTERDAY" },
        { text: "本周", code: "THIS_WEEK" },
        { text: "上周", code: "LAST_WEEK" },
        { text: "明天", code: "TOMORROW" },
        { text: "本月", code: "THIS_MONTH" },
    ];
    useEffect(() => {
        if (defaultToday) {
            setFilterTime('今日');
            setDateRange('TODAY');
        }
    }, [defaultToday])

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterTime, setFilterTime] = useState('全部日期');
    const [dateRange, setDateRange] = useState('');

    // const [statusDate, setstatusDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);                // 是否显示转项目的日期选择
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);          // 是否显示转项目的日期选择

    const clickFilterDate = (obj, index) => {
        setFilterTime(obj.text);
        setDateRange(obj.code);
        setEndDate('');
        setStartDate('');
    }

    const onCustomDateChange = (e) => {
        console.log("onCustomDateChange", e);
        setFilterTime('');
        setDateRange('');
        setStartDate(e.detail.value);  // .replace(/-/g, '.')
    }

    const onCustomDateEndChange = (e) => {
        console.log("onCustomDateEndChange", e);
        setFilterTime('');
        setDateRange('');
        setEndDate(e.detail.value);
    }

    const postData = () => {   // 点击确定按钮
        console.log("startDate:",startDate);
        console.log("endDate:",endDate);
        if (!filterTime && (!startDate || !endDate)) {
            return Taro.showToast({ title: `请选择${startDate ? '结束' : '开始'}时间`, icon: "none", duration: 2000 });
        }
        if (startDate && endDate && startDate > endDate) {
            return Taro.showToast({ title: '开始时间不能大于结束时间', icon: "none", duration: 2000 });
        }
        let params = {
            dateRange,
            filterTime,
            startDate,
            endDate
        }
        onClose();
        onChange(params);
    }

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        setFilterTime('');
        setDateRange('');
        setStartDate(e);
    }

    const dateEndPickerSelect = e => {
        console.log("seleceEndDate", e);
        setFilterTime('');
        setDateRange('');
        setEndDate(e);
    }

    return (
        <>
            <AtFloatLayout catchMove className='data_init_layout' isOpened={showPicker} onClose={() => onClose()}>
                <View className='filter_wrapper'>
                    <View className='filter_wrapper_bg'>
                        <View className='filter_title'>
                            <View >按时间筛选</View>
                            <AtIcon value='close' size='14' color='#222222' onClick={() => onClose()}></AtIcon>
                        </View>
                        <View className='filter_wrapper_content'>
                            {
                                filterList.map((item, index) => {
                                    return (
                                        <View
                                            key={index}
                                            className={`filter_wrapper_item ${filterTime === item.text ? 'filter_wrapper_item_active' : ''}`}
                                            onClick={() => clickFilterDate(item, index)}
                                        >{item.text}</View>
                                    )
                                })
                            }

                            {/* <View className={`custom_filter_date`}>
                                <Picker mode='date' onChange={onCustomDateChange}>
                                    <View className={`picker ${startDate ? 'picker_active' : ''}}`}>
                                        {startDate ? startDate + '' : '开始日期'}
                                    </View>
                                </Picker>
                                <View>-</View>
                                <Picker mode='date' onChange={onCustomDateEndChange}>
                                    <View className={`picker ${endDate ? 'picker_active' : ''}}`}>
                                        {endDate ? endDate + '' : '结束日期'}
                                    </View>
                                </Picker>
                            </View> */}
                            <View className='custom_filter_date'>
                                <View className={`picker ${startDate ? 'picker_active' : ''}}`} onClick={() => { setShowDatePicker(true) }}>
                                    {startDate ? startDate + '' : '开始日期'}
                                </View>
                                <View>-</View>
                                <View className={`picker ${endDate ? 'picker_active' : ''}}`} onClick={() => { setShowEndDatePicker(true) }}>
                                    {endDate ? endDate + '' : '结束日期'}
                                </View>
                            </View>
                        </View>

                        <View className='filter_wrapper_btn' onClick={postData}>确定</View>
                    </View>
                </View>
            </AtFloatLayout>
            <Block>
                <RootPortal>
                    <DatePicker defaultValue={startDate} type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>
                </RootPortal>
            </Block>
            <Block>
                <RootPortal>
                    <DatePicker defaultValue={endDate} type='Single' showPicker={showEndDatePicker} onClose={() => { setShowEndDatePicker(false) }} onSelectDate={dateEndPickerSelect}></DatePicker>
                </RootPortal>
            </Block>
        </>
    );
});

export default inject('store')(React.memo(CustomDate, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));
