import { useState, useEffect } from 'react';
// import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, PickerView, PickerViewColumn, Button } from '@tarojs/components';
import { AtFloatLayout, } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss';

const Picker = observer(({ data = [], onChange, showPicker, onClose, title, type, pickerList = [], store }) => {
    const [value, setVal] = useState([]);
    const [chooseIndex, setChoose] = useState([]);
    const role = store.userStore.role
    useEffect(() => {
        if (data.length) {
            setVal(data)
            console.log(data, pickerList)
            // 匹配默认选择 
            if (type === 'address') {
                const indexes = [];
                for (let i = 0; i < pickerList.length; i++) {
                    let foundIndex = -1;
                    for (let j = 0; j < data.length; j++) {
                        const innerArray = data[j];
                        let innerIndex = -1
                        if (Array.isArray(innerArray)) {
                            let list = innerArray.map((item) => {
                                return item.label
                            })
                            innerIndex = list.indexOf(pickerList[i]);
                        } else {
                            innerIndex = innerArray.indexOf(pickerList[i]);
                        }
                        if (innerIndex !== -1) {
                            foundIndex = innerIndex;
                            break;
                        }
                    }
                    indexes.push(foundIndex);
                }
                console.log("indexes", indexes);
                setChoose(indexes)
            } else if (type === "time") {
                setChoose(pickerList)
            } else{
                setChoose(pickerList)
            }
        }
    }, [data, pickerList]);

    const handleChange = (e) => {
        let val = e.detail.value;
        if (type === 'address') { //省市区
            const currentValue = value[0];
            let city = [];
            let area = [];
            // 解决
            let index = -1;
            for (let i = 0; i < chooseIndex.length; i++) {
                if (chooseIndex[i] !== val[i]) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                for (let i = index; i < val.length; i++) {
                    val[i] = i === index ? val[i] : 0;
                }
            }
            console.log(currentValue)
            city = currentValue[val[0]].children;
            if (data.length === 3) {
                area = city[val[1]].children;
                setVal([currentValue, city, area]);
            } else {
                setVal([currentValue, city]);
            }

        }
        setChoose(val);
    }
    const sure = (e) => {
        // e.stopPropagation()
        onClose()
        let list = chooseIndex.map((r, i) => value[i][r > -1 ? r : 0])
        console.log("sure_listlistlist",list);
        onChange({ type, data: list })
    }
    return (
        <>
            <AtFloatLayout isOpened={showPicker} className='picker_layout' catchMove onClose={() => onClose()}>
                <View className='title_box'>
                    <View>{title}</View>
                </View>
                <PickerView indicatorStyle='height: 50px;' immediateChange className='picker' value={chooseIndex} onChange={handleChange}>
                    {
                        value.map((l, index) => {
                            return (
                                <PickerViewColumn key={index}>
                                    {l.map((item, idx) => <View key={idx} style='line-height: 100rpx'>{item.label || item}</View>)}
                                </PickerViewColumn>
                            )
                        })
                    }
                </PickerView>
                <Button className={['sure', (role === 'boss' || role === 'agent') && 'boss_btn']} hoverClass='isActive' onClick={(e) => sure(e)}>确定</Button>
            </AtFloatLayout>

        </>

    );
});

export default inject('store')(Picker);
