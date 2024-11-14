/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-10-30 10:53:28
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-14 11:12:17
 * @Description:  求职者选择求职偏好
 */
/* eslint-disable react/jsx-key */
import React, { useState, useEffect, memo } from 'react';
import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { AtFloatLayout, AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/float-layout.scss";
import { View, Image, ScrollView } from '@tarojs/components';
import { jobTypeList } from '@/util/api'
import './index.scss';

const WorkerJobType = observer(({ store, isShow, initData, onClose }) => {

    useEffect(() => {
        console.log('ChooseJob 组建中间听到 isShow', isShow)
    }, [isShow])

    const {
    } = store
    const [fullJobTypeList, setFullJobTypeList] = useState([])
    const [chooseJobItem, setChooseJob] = useState([]);
    const [chooseCurrent, setChooseCurrent] = useState({});
    const [navCurrent, setNavCurrent] = useState('nav-0');
    useEffect(() => {
        const fetchData = async () => {
            let params = {
                // feedsType: ''
            };
            let data = await jobTypeList(params);
            console.log("查询岗位 workerjobchoose   data", data)
            if (data.code === 200) {
                // 默认聚焦
                setInit(data.data)
            }
        }
        fetchData();
        return () => {
        }
    }, [])
    useEffect(() => {
        const fetchData = async () => {
            if (fullJobTypeList.length) {
                setInit(fullJobTypeList)
            }
        }
        fetchData();
        return () => {
            // componentWillUnmount
        }
    }, [])
    useEffect(() => {
        const fetchData = async () => {
            if (isShow) {
                setInit(fullJobTypeList)
            }
        }
        fetchData();
        return () => {
            // componentWillUnmount
        }
    }, [isShow])
    const setInit = (data) => {
        if (initData.length) {
            let currentIndnx = [];
            let targetIds = initData.map(r => r.id)
            data.forEach((parent, index) => {
                // parent.chooseNum = 0
                parent.children.forEach(child => {
                    child.children.forEach(l => {
                        if (targetIds.includes(l.id)) {
                            // parent.chooseNum = (parent.chooseNum || 0) + 1;
                            currentIndnx.push(index)
                        }
                    })

                });
            });
            setChooseJob(initData)
            setNavCurrent(`nav-${currentIndnx[0]}`)
            setChooseCurrent(data[currentIndnx[0]])
        } else {
            if (data.length) {
                setChooseCurrent(data[0])
            }
        }
        setFullJobTypeList([...data])
    }
    const submit = () => {
        onClose(chooseJobItem)
    }
    const getActive = (l) => {
        let index = chooseJobItem.findIndex(item => item.id === l.id)
        return index > -1 ? true : false
    }
    return <AtFloatLayout isOpened={isShow} className='job_layout_boss' catchMove onClose={() => onClose()}>
        <View className='owne_box'>
            <View className='type_content'>
                <View className='full-time' style={{ paddingBottom: `${chooseJobItem.length ? '138rpx' : 0}` }}>
                    <ScrollView scrollIntoView={navCurrent} scrollY className='left_nav'>
                        {
                            fullJobTypeList.map((item, index) => {
                                return <View key={index} id={`nav-${index}`} className={`every_nav ${chooseCurrent.id === item.id && 'active_nav'}`} onClick={() => setChooseCurrent(item)}>
                                    {item.name}
                                    {
                                        item.chooseNum > 0 && <View className='num'>{item.chooseNum}</View>
                                    }
                                </View>
                            })
                        }
                    </ScrollView>
                    <ScrollView scrollY className='right_cont'>
                        {
                            chooseCurrent.children && chooseCurrent.children.map((r, i) => {
                                return <View className='type_cont' key={i}>
                                    <View className='cont_title'>{r.name}</View>
                                    <View className='every_type'>
                                        {
                                            r.children.map((l, inx) => {
                                                return <View key={inx} className={`${getActive(l) && 'active_type'}`} onClick={() => {
                                                    let ids = chooseJobItem.map(item => item.id)
                                                    let idx = ids.indexOf(l.id)
                                                    let jobItem = JSON.parse(JSON.stringify(chooseJobItem))
                                                    if (idx > -1) {
                                                        jobItem.splice(idx, 1)
                                                    }
                                                    if (jobItem.length >= 5) {
                                                        return Taro.showToast({
                                                            title: '最多选择5个',
                                                            icon: 'none'
                                                        })
                                                    }

                                                    fullJobTypeList.forEach((parent) => {
                                                        parent.children.forEach(child => {
                                                            child.children.forEach(h => {
                                                                if (h.id === l.id) {
                                                                    parent.chooseNum = (parent.chooseNum || 0) + (idx > -1 ? -1 : 1);
                                                                }
                                                            })

                                                        });
                                                    });

                                                    setFullJobTypeList([...fullJobTypeList])
                                                    if (idx > -1) {
                                                        setChooseJob([...jobItem])
                                                    } else {
                                                        setChooseJob([...jobItem, l])
                                                    }

                                                }}
                                                >
                                                    {l.name}
                                                </View>
                                            })
                                        }
                                    </View>
                                </View>
                            })
                        }

                    </ScrollView>
                </View>
                <View className='close_popup'>
                    {
                        (chooseJobItem.length) ?
                            <View className='choose_box'>
                                <View className='choose_title'>
                                    <View>已选岗位</View>
                                    <View>已选{chooseJobItem.length}/5</View>
                                </View>
                                <View className='choose_job'>
                                    {
                                        chooseJobItem.map((item, index) => {
                                            return <View key={index} onClick={() => {

                                                let jobItem = JSON.parse(JSON.stringify(chooseJobItem))
                                                jobItem.splice(index, 1)
                                                fullJobTypeList.forEach((parent) => {
                                                    parent.children.forEach(child => {
                                                        child.children.forEach(l => {
                                                            if (l.id === item.id) {
                                                                parent.chooseNum = parent.chooseNum - 1;
                                                            }
                                                        })

                                                    });
                                                });
                                                setFullJobTypeList([...fullJobTypeList])
                                                setChooseJob([...jobItem])
                                            }}
                                            >{item.name} <AtIcon value='close' size='10' color='#1678FF'></AtIcon></View>
                                        })
                                    }
                                </View>
                            </View>
                            : ''
                    }
                    <View className='bottom_btn'>
                        <View onClick={() => onClose()}>取消</View>
                        <View onClick={() => submit()}>确定</View>
                    </View>
                    {/* <Image src={`${Taro.$cdnUrl}/index/close_popup.webp`} onClick={() => submit()}></Image> */}

                </View>
            </View>
        </View>
    </AtFloatLayout>
});

export default inject('store')(React.memo(WorkerJobType, (prevProps, nextProps) => {
    return prevProps.isShow === nextProps.isShow;
}));
