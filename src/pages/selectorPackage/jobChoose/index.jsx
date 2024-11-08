/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 13:41:55
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-06 17:40:02
 * @Description: 
 */
/* eslint-disable react/jsx-key */
import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { AtIcon } from 'taro-ui'
import { View, Text, ScrollView, Input } from '@tarojs/components';
// import NavBar from '../../../components/nav/nav';
import { throttle, selectorQueryDomInfo } from '@/util/utils'
import { jobTypeList } from '@/util/api'
import './index.scss';

const ChooseJob = observer(({ store }) => {
    const router = useRouter();
    const {
        // JobStore: { agentChooseJob, setAgentChooseJob, examine, feedsExamine },
        baseStore: { statusTitleHeight, contenTitleHeight, tabbarHeight },
        userStore: { filterJobTypes, setFilterJobTypes }
    } = store
    const [system, setSystem] = useState('')
    const [fullJobTypeList, setFullJobTypeList] = useState([])
    const [chooseJobItem, setChooseJob] = useState([]);
    const [isSearch, setIsSearch] = useState([]);
    const [chooseCurrent, setChooseCurrent] = useState({});
    const [navCurrent, setNavCurrent] = useState('nav-0');
    const [keyWords, setKeyWords] = useState('')
    const [topDis, setTopDis] = useState(0)

    useEffect(() => {
        console.log("chooseJobItemchooseJobItem", chooseJobItem)
    }, [chooseJobItem]);

    useEffect(() => {
        const { type } = router.params;
        const fetchData = async () => {
            let params = {
                feedsType: ''   // examine == 1 ? feedsExamine : ''
            };
            let data = await jobTypeList(params);
            console.log("查询岗位 jobchoose   data", data)
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
            Taro.nextTick(async () => {
                const query_tab = await selectorQueryDomInfo('.close_popup');
                setTopDis(query_tab && query_tab.height || 0);
            });
        }
        fetchData();
        return () => {
            // componentWillUnmount
        }
    }, [chooseJobItem])
    
    const setInit = (data) => {
        if (filterJobTypes.length) {
            let currentIndnx = []
            let newArr = [];
            let targetIds = filterJobTypes.map(r => r.id)
            data.forEach((parent, index) => {
                parent.chooseNum = 0
                parent.children.forEach(child => {
                    child.children.forEach(l => {
                        if (targetIds.includes(l.id)) {
                            parent.chooseNum = (parent.chooseNum || 0) + 1;
                            currentIndnx.push(index)
                            newArr.push(l);
                        }
                    })
                });
            });
            console.log("filterJobTypes", filterJobTypes);
            console.log("currentIndnx", currentIndnx);
            console.log("newArr", newArr);
            // 根据name属性进行去重
            const uniqueArray = Array.from(new Map(newArr.map(item => [item.name, item])).values());
            console.log("uniqueArray", uniqueArray)
            setChooseJob(uniqueArray);
            setFilterJobTypes(newArr);
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
        console.log("chooseJobItem", chooseJobItem);
        if (JSON.stringify(chooseJobItem) !== JSON.stringify(filterJobTypes)) {
            Taro.eventCenter.trigger('refreshPage');
        }
        setFilterJobTypes(chooseJobItem)
        Taro.navigateBack({
            delta: 1
        })
    }


    const getActive = (l) => {
        let index = chooseJobItem.findIndex(item => item.id === l.id)
        return index > -1 ? true : false
    }
    const handleInputChange = throttle(async (e) => {
        setKeyWords(e);
        if (!e) return setIsSearch([])
        let params = {
            job_name: e
        }
        let res = await jobAssoc(params)
        if (res.code === 200) {
            console.log(res.data)
            setIsSearch(res.data)
        } else {
            setIsSearch([])
        }

    }, 100);
    const cleanChoose = () => {
        setChooseJob([])
        setFilterJobTypes([])
        // Taro.navigateBack({
        //     delta: 1
        // })
    }
    return (
        <>
            {/* <NavBar back title='岗位选择' color='#000' needPost/> */}
            <View className='job_choose_box'>
                <View className='seatch_box'>
                    <AtIcon value='search' size='20' color='#666'></AtIcon>
                    <Input
                        className='info_input'
                        adjustPosition
                        placeholder='输入岗位'
                        value={keyWords}
                        onInput={(e) => handleInputChange(e.target.value)}
                    />
                </View>
                <View className='type_content'
                    style={{
                        height: `calc(100vh - ${statusTitleHeight + contenTitleHeight + 58}PX)`,
                        paddingBottom: `${topDis}PX`
                    }}

                >

                    <View className='full-time'>
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
                                                        // chooseCurrent.chooseNum = (chooseCurrent.chooseNum || 0) + 1
                                                        setFullJobTypeList([...fullJobTypeList])
                                                        if (idx > -1) {
                                                            setChooseJob([...jobItem])
                                                        } else {
                                                            setChooseJob([...jobItem, l])
                                                        }
                                                    }}
                                                    >
                                                        {l.name}
                                                        {/* {
                                                            getActive(l) && <Image src={`${Taro.$cdnUrl}/index/select_icon_new.webp`}></Image>
                                                        } */}
                                                    </View>
                                                })
                                            }
                                        </View>
                                    </View>
                                })
                            }

                        </ScrollView>
                        {
                            isSearch.length ?
                                <View className='full_search'>
                                    {
                                        isSearch.map((item, index) => {
                                            return <View className='search_item' key={index} onClick={() => {
                                                if (chooseJobItem.length >= 5) {
                                                    return Taro.showToast({
                                                        title: '最多选择5个',
                                                        icon: 'none'
                                                    })
                                                }
                                                setChooseJob([...chooseJobItem, { id: item.job_type_id, name: item.job_type }])
                                                setIsSearch([])
                                                setKeyWords('')
                                            }}
                                            >
                                                <View>
                                                    {
                                                        item.job_type.split('').map(r => {
                                                            return <Text key={r} style={{ color: keyWords.includes(r) ? 'red' : '' }}>{r}</Text>
                                                        })
                                                    }
                                                </View>
                                                <View>{item.industry}-{item.category}{item.job_type}</View>
                                            </View>
                                        })
                                    }
                                </View>
                                : ''

                        }
                    </View>
                    <View className='close_popup'>
                        {
                            chooseJobItem.length ?
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
                                :
                                ''
                        }
                        <View className='btn_box'>
                            <View onClick={() => cleanChoose()} className='cancel_choose'>清除</View>
                            <View onClick={() => submit()} className='save_choose'>确定</View>
                        </View>

                        {/* <Image src={`${Taro.$cdnUrl}/index/close_popup.webp`} ></Image> */}
                    </View>

                </View>

            </View>
        </>
    )

});
export default inject('store')(ChooseJob)
