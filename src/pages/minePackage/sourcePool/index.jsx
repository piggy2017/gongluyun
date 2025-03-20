/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-12-06 11:27:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-11 14:43:54
 * @Description: 
 */

import { useEffect, useState, useMemo } from 'react';
import Taro, { usePageScroll, useRouter } from '@tarojs/taro';
import { View, Image, Input, ScrollView } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import { AtIcon } from 'taro-ui'
import { debounce } from '@/util/utils'
import './index.scss'

import { sharedStats, sharedList } from "@/util/api";

const Index = observer(({ store }) => {
    const {
        baseStore: { statusTitleHeight, contenTitleHeight },
    } = store
    const router = useRouter();

    const [leftList, setLeftList] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const pageSize = 10;
    const [pageNo, setPageNo] = useState(1);
    const [goonLoad, setgoonLoad] = useState(true);
    const [requestState, setRequestState] = useState(0);   // 请求状态 0 未请求 1 请求中 2 请求成功 3 请求失败
    const [searchValue, setSearchValue] = useState("");            // 搜索框的值
    const [totalInfos, setTotalInfo] = useState({ orderAmount: 0, orderNum: 0 });                 // 统计数据
    const [scrollTop, setScrollTop] = useState(false);   // 滚动距离

    useEffect(() => {
        getMoney();
        getList(1);
    }, []);

    usePageScroll(async (res) => {
        console.log("滚动距离", res.scrollTop);
        setScrollTop(res.scrollTop >= 99 ? true : false);
    });

    const getHeight = () => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px)`;
    }

    const handleScrollToLower = debounce(() => {   // 在这里处理滑动到最底部的逻辑 ,判断是否加载下一页的数据
        console.log('滑动到了最底部');
        if (goonLoad) {
            getList(pageNo + 1);
        }
    }, 500);

    const handleScrollToUpper = debounce(() => {  // 滑动到最顶部,触发下拉刷新
        console.log('下拉刷新');
        setIsRefresh(true);
        getList(1);
    }, 200);

    const getScrollHeight = useMemo(() => {
        return `calc(100vh - ${statusTitleHeight + contenTitleHeight}px - 154rpx)`;
    }, [])

    const changeOpen = (obj, index) => {
        if (!obj.isOpen && obj.childList.length === 0) {
            let _currentPage = obj.pageNo + 1;
            loadChild(obj, index, _currentPage);
        } else {
            setLeftList(leftList => {
                leftList[index].isOpen = !leftList[index].isOpen;
                return [...leftList]
            })
        }
    }

    const loadMoreChild = (obj, index) => {
        console.log("加载更多二级列表");
        let _currentPage = obj.pageNo + 1;
        loadChild(obj, index, _currentPage);
    }

    const loadChild = async (obj, index, _currentPage) => {
        let params = {
            pageNo: _currentPage,
            pageSize,
            parentSerialCode: obj.userSerialCode,
            searchInfo: searchValue    // 15000000018
        }
        const { code, data, msg } = await sharedList(params);
        console.log("获取二级列表", code, data, msg);
        if (code === 200 && data.responses?.length > 0) {
            obj.childList = _currentPage === 1 ? data.responses : [...obj.childList, ...data.responses];
            obj.pageNo = data.pageNo;
            obj.hasNextPage = data.hasNextPage;
            setLeftList(leftList => {
                leftList[index].isOpen = true;
                leftList[index].childList = obj.childList;
                return [...leftList]
            })
        }
    }

    const getMoney = async () => {  // 分享拉新收益统计
        const { code, data, msg } = await sharedStats({});
        console.log("分享拉新收益统计", code, data, msg);
        if (code === 200) {
            setTotalInfo(data);
        }
    }

    const getList = async (_pageNo) => {  // 分享拉新收益列表
        let params = {
            pageNo: _pageNo,
            pageSize,
            parentSerialCode: '',
            searchInfo: searchValue
        }
        Taro.showLoading({ title: '加载中' });
        setRequestState(1);
        const { code, data, msg } = await sharedList(params);
        Taro.hideLoading();
        setIsRefresh(false);
        console.log("分享拉新收益列表", code, data, msg);
        if (code === 200 && data.responses?.length > 0) {
            data.responses.forEach(item => {
                item.childList = item.childList ? item.childList : [];
                item.isOpen = item.childList.length > 0 ? true : false;
                item.pageNo = 0;
                if (searchValue) {
                    item.hasNextPage = false;
                    item.fromSearch = true;
                } else {
                    item.hasNextPage = true;
                    item.fromSearch = true;
                }
            })
            setLeftList(_pageNo === 1 ? data.responses : [...leftList, ...data.responses]);
            setgoonLoad(true);
            setPageNo(data.pageNo);
            setRequestState(2);
        } else {
            setgoonLoad(false);
            setRequestState(3);
            if (_pageNo === 1) {
                setLeftList([]);
            }
        }
    }

    return (
        <View className='page_wrapper' style={`background:${!scrollTop ? 'linear-gradient(#0483FF 444rpx, transparent 444rpx)' : '#f4f4f4'};`}>
            <View className='page_content'>
                <View className='myHeader' style={`background:${!scrollTop ? '#0483FF' : '#f4f4f4'};`}>
                    <View style={`height:${statusTitleHeight}px;`} ></View>
                    <View className='myHeader_content' style={`height:${contenTitleHeight}px;`}>
                        <AtIcon value='chevron-left' size='24' color='#ffffff' onClick={() => {
                            Taro.navigateBack({ delta: 1 })
                        }}></AtIcon>
                        <View className='myHeader_title'>我的资源池</View>
                    </View>
                </View>

                <View className='total_wrap'>
                    <View className='total_title'>共交易{totalInfos.orderNum}笔，合计(元)</View>
                    <View className='total_money'>{totalInfos.orderAmount}</View>
                </View>

                <View className='scroll_wrapper' style={`height:${getHeight()};`}>
                    <View className='scroll_titles'>
                        <View style={`height:50rpx;`}></View>
                        <View className='scroll_search'>
                            <Image className='scroll_search_icon' src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                            <Input
                                value={searchValue}
                                className='scroll_search_input'
                                placeholder='输入用户完整的手机号进行搜索'
                                confirmType='search'
                                placeholderStyle='color: #999999;'
                                onInput={(e) => { setSearchValue(e.detail.value) }}
                                onConfirm={(e) => {
                                    // setPageNo(1);
                                    setgoonLoad(true);
                                    getList(1);
                                }}
                            >
                            </Input>
                        </View>
                    </View>
                    <ScrollView scrollY className='scrollWrapper'
                        style={{ height: getScrollHeight }}
                        onScrollToLower={handleScrollToLower}
                        scrollWithAnimation
                        onRefresherRefresh={handleScrollToUpper}
                        refresherEnabled
                        refresherTriggered={isRefresh}
                        showScrollbar={false}
                        lowerThreshold={300}
                        enablePassive
                    >
                        {
                            leftList.length > 0 && leftList.map((item, index) => {
                                return (
                                    <View className='scroll_leftItem' key={item.userSerialCode}>
                                        <View className='scroll_leftItem_top'>
                                            <Image src={item.avatar} className='scroll_leftItem_avatar'></Image>
                                            <View className='scroll_leftItem_top_infos'>
                                                <View className='scroll_leftItem_top_infos_name'>
                                                    <View className='scroll_leftItem_top_infos_name_left'>
                                                        <View>{item.nickName}</View>
                                                    </View>
                                                    {
                                                        item.sharedNum > 0 &&
                                                        <View className='toggle_right' onClick={() => changeOpen(item, index)}>
                                                            <View>已推广{item.sharedNum}人</View>
                                                            <Image src={`${Taro.$cdnUrl}/skill/resource_${item.isOpen ? 1 : 2}.webp`}></Image>
                                                        </View>
                                                    }
                                                </View>
                                                <View className='user_phone'>{item.phone}</View>
                                            </View>
                                        </View>
                                        <View className='invite_time'>邀请时间：{item.inviteDate}</View>
                                        <View className='scroll_leftItem_bottom'>
                                            <View className='scroll_leftItem_bottom_item'>
                                                <View className='scroll_leftItem_bottom_item_num'>{item.sharedNum}</View>
                                                <View className='scroll_leftItem_bottom_item_label'>推广人数(人)</View>
                                            </View>
                                            <View className='scroll_leftItem_bottom_item'>
                                                <View className='scroll_leftItem_bottom_item_num'>{item.orderAmount}</View>
                                                <View className='scroll_leftItem_bottom_item_label'>交易金额(元)</View>
                                            </View>
                                            <View className='scroll_leftItem_bottom_item'>
                                                <View className='scroll_leftItem_bottom_item_num'>{item.orderNum}</View>
                                                <View className='scroll_leftItem_bottom_item_label'>交易个数(个)</View>
                                            </View>
                                        </View>
                                        {
                                            item.isOpen && item.sharedNum > 0 && item.childList?.length > 0 && item.childList.map((child, idx) => {
                                                return (
                                                    <View className='child_item' key={idx}>
                                                        <View className='child_item_top'>
                                                            <View className='child_item_avatar'></View>
                                                            <View className='child_item_info'>
                                                                <View className='child_item_info_name'>
                                                                    <View>{child.nickName} {child.phone}</View>
                                                                    <View className='child_item_info_name_label'>下级</View>
                                                                </View>
                                                                <View className='child_item_info_time'>邀请时间：{child.inviteDate}</View>
                                                            </View>
                                                        </View>
                                                        <View className='child_item_bottom'>
                                                            <View className='child_item_bottom_item'>
                                                                <View>{child.sharedNum}</View>
                                                                <View className='child_item_bottom_item_label'>推广人数(人)</View>
                                                            </View>
                                                            <View className='child_item_bottom_item'>
                                                                <View>{child.orderAmount}</View>
                                                                <View className='child_item_bottom_item_label'>交易金额(元)</View>
                                                            </View>
                                                            <View className='child_item_bottom_item'>
                                                                <View>{child.orderNum}</View>
                                                                <View className='child_item_bottom_item_label'>交易个数(个)</View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )
                                            })
                                        }
                                        {item.isOpen && item.sharedNum > 0 && item.childList?.length > 0 && item.hasNextPage &&
                                            <View onClick={() => loadMoreChild(item, index)} className='load_more'>点击加载更多</View>
                                        }
                                    </View>
                                )
                            })
                        }

                        {
                            leftList.length >= 5 &&
                            <Taro.LoadMore goonLoad={goonLoad}></Taro.LoadMore>
                        }
                        {
                            leftList.length === 0 && requestState === 3 &&
                            <Taro.NoData></Taro.NoData>
                        }
                    </ScrollView>
                </View>
            </View>
        </View>
    )
})

export default inject('store')(Index)
