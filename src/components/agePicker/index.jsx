import React,{ useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, PickerView, PickerViewColumn, Button } from '@tarojs/components';
import { AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import './index.scss';

const AgePicker = observer(({ onChange, showPicker, onClose, store }) => {

    const [ageStart, setAgeStart] = useState([]);
    const [ageEnd, setAgeEnd] = useState([]);
    const [chooseAge, setChooseAge] = useState([0, 0]);
    const [ageText, setAgeText] = useState('');

    useEffect(() => {
        let _list = [];
        for (let i = 18; i <= 65; i++) {
          _list.push(i)
        }
        setAgeStart(_list);
        setAgeEnd(_list);
      }, [])

    const handleChangeAge = (e) => {
        console.log("handleChangeAge", e.detail.value);
        setAgeText(e.detail.value[0] + 18 + '-' + (e.detail.value[1] + 18));
        setChooseAge(e.detail.value);
      }
    
      const sureAge = () => {
        console.log("chooseAge", chooseAge, ageText);
        if (chooseAge[0] > chooseAge[1]) {
          return Taro.showToast({
            title: '年龄区间选择有误,开始的年龄不能大于结束的年龄',
            icon: 'none',
          })
        }
        if (chooseAge[0] === 0 && chooseAge[1] === 0) {
          setChooseAge([0, 0]);
          onChange([18,18])
        } else {
          setChooseAge([ageText.split('-')[0] * 1 - 18, ageText.split('-')[1] * 1 - 18]);
          onChange([ageText.split('-')[0] * 1 , ageText.split('-')[1] * 1])
        }
        onClose();
      }

    return (
        <>
            <AtFloatLayout isOpened={showPicker} className='picker_layout' catchMove  onClose={() => onClose()}>
                <View className='title_box'>
                    <View>选择年龄</View>
                </View>
                <View className='at_float_zhi'>至</View>

                <PickerView indicatorStyle='height: 50px;' immediateChange className='picker'
                    value={chooseAge}
                    onChange={handleChangeAge}
                >
                    <PickerViewColumn>
                        {ageStart.map((item, idx) => <View key={idx} style='line-height: 100rpx'>{item}</View>)}
                    </PickerViewColumn>
                    <PickerViewColumn>
                        {ageEnd.map((item, idx) => <View key={idx} style='line-height: 100rpx'>{item}</View>)}
                    </PickerViewColumn>
                </PickerView>
                <Button className='sure_btn' onClick={(e) => sureAge(e)}>保存</Button>
            </AtFloatLayout>
        </>
    );
});

// export default inject('store')(AgePicker);
export default inject('store')(React.memo(AgePicker, (prevProps, nextProps) => {
  // 自定义比较函数，只有 props 发生变化时才重新渲染
  return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));