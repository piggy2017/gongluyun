/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-23 11:41:37
 * @LastEditors: 孙林
 * @LastEditTime: 2025-08-05 11:52:56
 * @Description: 更改用户状态  未到面 已到面 面试失败 面试通过 已离职 已入职
 */

import React, { useState, useEffect, useReducer } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { View, Block, Textarea, Text, Image, RootPortal } from '@tarojs/components';
import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import DatePicker from '@/components/datePicker'
import './index.scss';

const NewUpdateStatus = observer(({ showPicker, onChange, currentStatus, bottomHeight, onClose, type = 1, store }) => {
    // 默认 type=1 名单反馈、列表反馈页面、客户详情,第一个状态是未到面      type=2 名单 第一个状态是已约面
    const {
        baseStore: { bottomSafeAreaHeight, setKeyBoardHeight },
        userStore: { myPermissions, role },
    } = store
    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const [status, setStatus] = useState('');

    const [showModel, setShowModel] = useState(false);
    const [failReason, setFailReason] = useState(''); // 面试失败原因
    const [modelTitle, setModelTitle] = useState(''); //

    const [statusList, setStatusList] = useState([]);
    // const [myStatus, setMyStatus] = useState('');
    const [showExchange, setShowExchange] = useState(false);
    const [statusDate, setstatusDate] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false);         

    useEffect(() => {
        let list = [{ name: '待处理', state: 'PENDING', },
        { name: '已联系', state: 'CONTACT', },
        { name: '不合适', state: 'UNSUITABLE', },
        { name: "已约面", state: "SCHEDULED_INTERVIEW", },
        { name: '未到面', state: 'NOT_INTERVIEW', },
        { name: '已签到', state: 'ARRIVE_INTERVIEW', },
        { name: '待定', state: 'UNDETERMINED', },
        { name: '名单满储备下次', state: 'FULL', },
        { name: '名单审核不通过', state: 'REVIEW_NOT_PASSED', },
        { name: '面试失败', state: 'INTERVIEW_FAILED', },
        { name: '面试通过', state: 'INTERVIEW_PASSED', },
        { name: '中途放弃', state: 'GIVE_HALFWAY', },
        { name: '未入职', state: 'NOT_EMPLOYED', },
        { name: '已入职', state: 'EMPLOYED', },
        { name: '已离职', state: 'RESIGN', },
            // { name: '可结算', state: 'SETTLEMENT', },
        ]
        let _statusList = [];
        if (role === 'ADMIN') {
            _statusList = list;
        } else if (role === 'ON_SITE' || role === 'CHANNEL') {
            _statusList = list.filter(item => item.state !== 'PENDING' && item.state !== 'CONTACT' && item.state !== 'UNSUITABLE');
        } else if (role === 'CUSTOMER') {
            // _statusList = list.splice(0, 3);
            _statusList = list;
        }
        if (_statusList.length > 0 && currentStatus) {
            _statusList.forEach(item => {
                item.seleted = false;
                if (item.state === currentStatus) {
                    item.seleted = true;
                }
            })
        }
        setStatusList(_statusList);
    }, [role, currentStatus])

    const chooseStatusFunc = (obj, index) => {
        console.log("chooseStatusFunc", obj, index);
        setStatusList(statusList => {
            statusList.forEach((item, i) => {
                item.seleted = false;
            })
            statusList[index].seleted = true;
            return statusList
        })
        forceUpdate();
        if (obj.state === 'UNSUITABLE' || obj.state === 'REVIEW_NOT_PASSED' || obj.state === 'INTERVIEW_FAILED' || obj.state === 'GIVE_HALFWAY' || obj.state === 'RESIGN' || obj.state === 'EMPLOYED' || obj.state === 'NOT_EMPLOYED') { // 面试失败、已离职
            setShowModel(true);
            setStatus(obj.state);
        }
        else {
            onChange(obj.state);
            setTimeout(() => {
                onClose();
            }, 200);
        }
    }

    const postReasonFunc = () => {
        if (status === 'RESIGN' || status === 'EMPLOYED') {   // 已入职、离职 ,必须输入时间
            if (!statusDate) {
                return Taro.showToast({ title: `请选择${status === 'RESIGN' ? '离职' : '入职'}时间`, icon: 'none' });
            } else {
                onChange(status, failReason, statusDate);
                setShowModel(false);
                setTimeout(() => {
                    onClose();
                    setFailReason('');
                }, 200);
                return;
            }
        }
        onChange(status, failReason);
        setShowModel(false);
        setTimeout(() => {
            onClose();
            setFailReason('');
        }, 200);
    }

    const datePickerSelect = (e) => {
        console.log("seleceDate", e);
        setstatusDate(e);
    }

    return (
        <>
            {
                showPicker &&
                <AtFloatLayout catchMove className='edit_status_init_layout' isOpened={showPicker} onClose={onClose}>
                    <View className='filter_wrapper'>
                        <View className='filter_wrapper_bg'>
                            <View className='filter_title'>
                                <View>修改状态</View>
                                <AtIcon value='close' size='14' color='#222222' onClick={onClose}></AtIcon>
                            </View>
                            <View className='filter_wrapper_content'>
                                {
                                    statusList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className={`filter_wrapper_item ${item.seleted ? 'filter_wrapper_item_active' : ''}`}
                                                onClick={() => chooseStatusFunc(item, index)}
                                            >{item.name}</View>
                                        )
                                    })
                                }
                            </View>
                            {/* <View className='post_btn' onClick={editStatusFunc}>确定</View> */}
                            <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                        </View>
                    </View>
                </AtFloatLayout>
            }

            <Block>
                {
                    showModel &&
                    // <RootPortal>
                    <AtFloatLayout catchMove className='status_init_layout' isOpened={showModel} onClose={() => { setShowModel(false) }}>
                        <View className='filter_wrapper'>
                            <View className='filter_wrapper_bg'>
                                <View className='filter_title'>
                                    <View></View>
                                    <View>填写反馈原因</View>
                                    <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowModel(false) }}></AtIcon>
                                </View>
                                {
                                    (status === 'RESIGN' || status === 'EMPLOYED') &&
                                    <View className='choose_status_date'>
                                        <View className='choose_status_date_label'>{status === 'RESIGN' ? '离职' : '入职'}时间</View>
                                        <View className='choose_status_date_right' onClick={() => { setShowDatePicker(true) }}>
                                            <View style={{ color: statusDate ? '#222222' : '#777777' }}>{statusDate ? statusDate : `请选择${status === 'RESIGN' ? '离职' : '入职'}时间`}</View>
                                            <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                                        </View>
                                    </View>
                                }
                                <View className='input_wrapper'>
                                    <Textarea count={false}
                                        focus={true}
                                        className='float_input'
                                        auto-height
                                        confirmType='return'
                                        value={failReason}
                                        onInput={(e) => setFailReason(e.detail.value)}
                                        adjustPosition={true} //键盘弹起时，是否自动上推页面
                                        showConfirmBar={false}
                                        maxlength={50}
                                        autoHeight
                                        placeholder={`${(status === 'EMPLOYED' || status === 'NOT_EMPLOYED') ? '请填写备注...' : '请描述具体原因...'}`}
                                        onKeyboardHeightChange={(e) => {
                                            let currHeight = e.detail.height;
                                            console.log('currHeight', currHeight)
                                            if (currHeight > 0) {
                                                setKeyBoardHeight(currHeight);
                                            }
                                        }}
                                    >
                                    </Textarea>
                                    <View className='input_number'><Text>{failReason.length}</Text>/50</View>
                                </View>
                                {/* style={`background:${failReason.length > 0 ? '#0483FF' : '#CDE1FF'}`} */}
                                <View className='post_btn' onClick={postReasonFunc}>提交</View>
                                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                            </View>
                        </View>
                    </AtFloatLayout>
                    // </RootPortal>
                }
                {
                    // showExchange &&
                    // <RootPortal>
                    //     <AtFloatLayout catchMove className='exchangeJob_init_layout' isOpened={showExchangeModel} onClose={() => { setShowExchangeModel(false) }}>
                    //         <View className='exchangeJob_wrapper'>
                    //             <View className='filter_wrapper_bg'>
                    //                 <View className='filter_title'>
                    //                     <View>转项目</View>
                    //                     <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowExchangeModel(false) }}></AtIcon>
                    //                 </View>

                    //                 <View className='exchangeJob_content'>
                    //                     <View className='exchangeJob_content_item'>
                    //                         <View className='exchangeJob_content_item_label'>
                    //                             <View className='exchangeJob_content_item_label_icon'></View>
                    //                             <View>岗位</View>
                    //                         </View>
                    //                         <View className='exchangeJob_content_item_right' onClick={() => {
                    //                             Taro.navigateTo({
                    //                                 url: `/pages/talentsPackage/filterJob/index?type=7&title=选择岗位`
                    //                             })
                    //                         }}>
                    //                             <View>{exchangeJobInfo.title}</View>
                    //                             <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    //                         </View>
                    //                     </View>
                    //                     <View className='exchangeJob_content_hr'></View>
                    //                     <View className='exchangeJob_content_item'>
                    //                         <View className='exchangeJob_content_item_label'>
                    //                             <View className='exchangeJob_content_item_label_icon'></View>
                    //                             <View>当前状态</View>
                    //                         </View>
                    //                         <View className='exchangeJob_content_item_right'>
                    //                             <View>{clientInfos && clientInfos.seekState ? getStatus(clientInfos.seekState) : ''}</View>
                    //                             {/* <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image> */}
                    //                         </View>
                    //                     </View>
                    //                     <View className='exchangeJob_content_hr'></View>
                    //                     <View className='exchangeJob_content_item'>
                    //                         <View className='exchangeJob_content_item_label'>
                    //                             <View className='exchangeJob_content_item_label_icon'></View>
                    //                             {
                    //                                 clientInfos &&
                    //                                 <View>{clientInfos.seekState === 'EMPLOYED' ? '入职时间' : '离职时间'}</View>
                    //                             }
                    //                         </View>
                    //                         <View className='exchangeJob_content_item_right' onClick={() => { setShowDatePicker(true) }}>
                    //                             <View>{dateText}</View>
                    //                             <Image src={`${Taro.$cdnUrl}/index/mine_icon11.webp`}></Image>
                    //                         </View>
                    //                     </View>
                    //                 </View>
                    //                 <View className='exchangeJob_content_btn' onClick={() => postExchangeFunc()}>确定</View>
                    //                 <View style={`height:${bottomSafeAreaHeight}px;`}></View>
                    //             </View>
                    //         </View>
                    //     </AtFloatLayout>
                    // </RootPortal>
                }
            </Block>
            <Block>
                <RootPortal>
                    <DatePicker defaultValue={statusDate} type='Single' showPicker={showDatePicker} onClose={() => { setShowDatePicker(false) }} onSelectDate={datePickerSelect}></DatePicker>
                </RootPortal>
            </Block>
        </>
    );
});

export default inject('store')(React.memo(NewUpdateStatus, (prevProps, nextProps) => {
    return prevProps.showPicker === nextProps.showPicker && prevProps.store === nextProps.store;
}));
