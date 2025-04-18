/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-05 15:39:11
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-17 17:30:14
 * @Description: 时间选择器 -- 可选择当前月和接下来的6个月的月份数据
 */
import React, { useState, useEffect, useReducer } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Button, Text } from '@tarojs/components';
import { AtFloatLayout, AtIcon } from 'taro-ui'
import dayjs from 'dayjs';
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss';

const DatePicker = observer(({ type = 'Single', showPicker, onClose, onSelectDate, store, defaultValue, activeColor, isAllChoose = false }) => {
    let [forceUpdate, refreshForceUpdate] = useReducer(x => x + 1, 0);

    const [dateArray, setDateArray] = useState([]);        // 日期数组
    const [weekList, setweekList] = useState(['日', '一', '二', '三', '四', '五', '六']);
    const [currentIndex, setcurrentIndex] = useState(6);   // 当前选中月份的下标
    const [currentDate, setcurrentDate] = useState('');    // Single 当前选中的日期

    const [today, setToday] = useState('');
    const [chooseFirstDay, setChooseFirstDay] = useState('');           // 多选的时候选中的第一天
    const [chooseLastDay, setChooseLastDay] = useState('');             // 多选的时候选中的最后一天

    useEffect(() => {
        // 获取当前日期并格式化
        const formattedDate = dayjs().format('YYYY-MM-DD');
        console.log("今天--formattedDate", formattedDate);
        setToday(formattedDate);
        const currentYearMonth = dayjs().format('YYYY-MM');
        // console.log(currentYearMonth);

        // 第一步,获取当前月和接下来的6个月的月份数组
        const monthArr = [currentYearMonth];
        for (let i = 1; i < 7; i++) {
            const nextMonth = dayjs().add(i, 'month').format('YYYY-MM');
            monthArr.push(nextMonth);
        }
        // console.log("monthArr", monthArr);
        // 获取当前日期的过去六个月份，格式为YYYY-MM
        for (let i = 1; i < 7; i++) {
            const previousMonth = dayjs().subtract(i, 'month').format('YYYY-MM');
            // console.log(previousMonth); // 输出上一个月的月份，格式为YYYY-MM
            // 将上一个月的月份添加到月份数组中
            monthArr.unshift(previousMonth);
        }
        // 第二步,根据每个月的月份获取该月的日期数组
        const dateArr = [];
        monthArr.forEach((item, index) => {
            const dateItem = Array.from({ length: dayjs(item).daysInMonth() }, (_, index) =>
                dayjs(`${item}-${index + 1}`).format('YYYY-MM-DD')
            );
            dateArr.push(dateItem);
        })
        // console.log("dateArr", dateArr);

        // 第三步,获取当前是几号
        const currentDate = dayjs().format('DD');
        // console.log("currentDate", currentDate);

        // 第四部,根据以上的数据,封装最终使用的数组
        const finishArr = [];
        for (let i = 0; i < monthArr.length; i++) {
            let obj = {
                month: monthArr[i],
                value: i,
                label: monthArr[i].split('-')[0] + '年' + monthArr[i].split('-')[1] + '月',
                children: []
            }
            let childrenArr = dateArr[i];
            for (let j = 0; j < childrenArr.length; j++) {
                let childrenObj = {
                    label: childrenArr[j],
                    value: j + 1,
                    active: false,
                    isFirst: false,
                    isEnd: false
                }
                if (isAllChoose) {
                    childrenObj.canSelect = true;
                } else {
                    childrenObj.canSelect = true;    // 之前的日期也可以选
                    // if ((i === 6 && currentDate > j + 1) || i < 6) {  // 不可选的日期
                    //     childrenObj.canSelect = false;
                    // } else {
                    //     childrenObj.canSelect = true;
                    // }
                }

                if (defaultValue && childrenObj.label === defaultValue) {
                    childrenObj.active = true;
                    setcurrentDate(childrenObj.label);
                }
                if (j === 0) {
                    // 获取每个月的第一天属于星期几?
                    const firstDay = dayjs(childrenArr[0]).day();
                    // console.log("firstDay", firstDay);
                    childrenObj.firstDay = firstDay;
                }
                obj.children.push(childrenObj)
            }
            finishArr.push(obj);
        }
        // console.log("finishArr", defaultValue, finishArr);
        setDateArray(finishArr);
        refreshForceUpdate();

    }, [defaultValue])

    const sure = (e) => {
        if (type === "Single") {
            if (currentDate === '') {
                return Taro.showToast({ title: '请选择日期', icon: 'none', duration: 2000 });
            } else {
                onSelectDate(currentDate);
            }
        } else if (type === "Multiple") {
            console.log("chooseFirstDay", chooseFirstDay);
            console.log("chooseLastDay", chooseLastDay);
        }
        onClose();
    }

    const changeMouth = (type) => {
        console.log("changeMouth", type);
        if (type === 'add') {
            if (currentIndex < dateArray.length - 1) {
                setcurrentIndex(currentIndex + 1);
            }
        } else {
            if (currentIndex > 0) {
                setcurrentIndex(currentIndex - 1);
            } else {
                Taro.showToast({
                    title: '暂无更多月份',
                    icon: 'none',
                    duration: 2000
                })
            }
        }
    }

    const clickItem = (item, index) => {
        console.log("clickItem", item, index);
        if (item.canSelect) {
            if (type === "Single") {  // 如果类型是单选,需要把其他所有的选项的active都设置为false,再把当前点击的设为true
                setDateArray(dateArray => {
                    let arr = dateArray;
                    for (let i = 0; i < arr.length; i++) {
                        for (let j = 0; j < arr[i].children.length; j++) {
                            arr[i].children[j].active = false;
                        }
                    }
                    arr[currentIndex].children[index].active = true;
                    return arr;
                });
                setcurrentDate(item.label);
                refreshForceUpdate();
            } else if (type === "Multiple") {   // 未完成,需要后续开发
                if (chooseFirstDay === "") {
                    setChooseFirstDay(item.label);
                    setDateArray(dateArray => {
                        let arr = dateArray;
                        arr[currentIndex].children[index].active = true;
                        arr[currentIndex].children[index].isFirst = true;
                        return arr;
                    });
                } else {
                    // 判断当前点击的item是否等于chooseFirstDay,如果等于不做处理,如果不等于,则需要把chooseFirstDay到当前点击的item之间的所有的item的active(即使跨月)都设置为true,并把当前点击的设置为isEnd和chooseLastDay
                    if (chooseFirstDay !== item.label) {
                        setDateArray(dateArray => {
                            let arr = dateArray;
                            let firstDayIndex = 0;
                            let lastDayIndex = 0;
                            for (let i = 0; i < arr.length; i++) {
                                for (let j = 0; j < arr[i].children.length; j++) {
                                    if (arr[i].children[j].label === chooseFirstDay) {
                                        firstDayIndex = j;
                                    }
                                    if (arr[i].children[j].label === item.label) {
                                        lastDayIndex = j;
                                    }
                                }
                            }
                            for (let i = 0; i < arr.length; i++) {
                                for (let j = 0; j < arr[i].children.length; j++) {
                                    if (i === currentIndex) {
                                        if (j >= firstDayIndex && j <= lastDayIndex) {
                                            arr[i].children[j].active = true;
                                        }
                                    } else if (i > currentIndex) {
                                        if (j <= lastDayIndex) {
                                            arr[i].children[j].active = true;
                                        }
                                    } else if (i < currentIndex) {
                                        if (j >= firstDayIndex) {
                                            arr[i].children[j].active = true;
                                        }
                                    }
                                }
                            }
                            arr[currentIndex].children[index].active = true;
                            arr[currentIndex].children[index].isEnd = true;

                            return arr;
                        });
                        setChooseLastDay(item.label);
                    }

                }
            }
        }
    }
    return (
        <>
            <AtFloatLayout isOpened={showPicker} className='date_layout' catchMove onClose={() => onClose()}>
                <View className='date_layout_wrapper'>
                    <View style='height:36rpx;'></View>
                    <View className='title_box'>
                        <AtIcon value='chevron-left' size='20' color={`${activeColor ? activeColor : '#0483FF;'}`} onClick={() => changeMouth("reduce")}></AtIcon>
                        {
                            dateArray.length > 0 && <View>{dateArray[currentIndex].label}</View>
                        }
                        <AtIcon value='chevron-right' size='20' color={`${activeColor ? activeColor : '#0483FF;'}`} onClick={() => changeMouth("add")}></AtIcon>
                    </View>
                    <View className='week_wrap'>
                        {
                            weekList.map((item, index) => {
                                return <View className='week_item' key={index}>{item}</View>
                            })
                        }
                    </View>
                    {
                        dateArray.length > 0 &&
                        <View className='dateArea_wrap'>
                            {
                                dateArray[currentIndex].children.map((item, index) => {
                                    return <View
                                        style={`margin-left:${index === 0 ? `${item.firstDay * 100}rpx` : ''};--activeColor:${activeColor};`}
                                        className={[
                                            'dateArea_item',
                                            `${(item.label === today && !item.active) ? 'today' : ''}`,
                                            `${item.canSelect ? '' : 'disabledBtn'}`,
                                            `${(item.active && type === 'Single' && !activeColor) ? 'singleActiveItem' : (item.active && type === 'Single' && activeColor) ? 'singleActiveItem2' : ''}`,
                                            `${item.isFirst && type === 'Multiple' ? 'firstActiveItem' : ''}`,
                                            `${item.isEnd && type === 'Multiple' ? 'endActiveItem' : ''}`,
                                            `${item.active && type === 'Multiple' ? 'multipleActiveItem' : ''}`
                                        ]}
                                        key={index}
                                        onClick={() => clickItem(item, index)}
                                    >
                                        {item.value} 
                                        <Text>{item.label === today && '今天'}</Text>
                                    </View>
                                })
                            }
                        </View>
                    }

                    <Button style={`background:${activeColor ? activeColor : '#0483FF;'}`} className='sure_btn_date' onClick={(e) => sure(e)}>确定</Button>
                </View>
            </AtFloatLayout>
        </>
    );
});

// export default inject('store')(DatePicker);
// 包裹 inject 和 memo
export default inject('store')(React.memo(DatePicker, (prevProps, nextProps) => {
    // 自定义比较函数，只有 props 发生变化时才重新渲染
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));
