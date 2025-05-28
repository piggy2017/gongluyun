/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-27 10:29:05
 * @Description: 
 */

import React, { useState, useEffect, useReducer, useRef } from 'react'
import Taro, { useRouter, usePullDownRefresh } from '@tarojs/taro';
import { View, Image, Text, Input, Canvas, Block } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { AtIcon } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import { throttle } from '@/util/utils'
import CustomDate from '@/components/customDate';
import Navbar from '@/components/navbar';
import './index.scss'

import { dashContractsData, dashDrainageData, dashFlowChannel, dashEmployeeData, exportEmployeeData } from '@/util/api'


const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        userStore: { companyInfo },
        baseStore: { platform },
        businessStore: { siteObj, setSiteObj },
    } = store

    const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
    const [percent, setPercent] = useState(0);
    const canvasId = 'progressCanvas';
    const canvasRef = useRef(null);

    const [projectData, setProjectData] = useState('');
    const [streamData, setStreamData] = useState('');
    const [flowList, setFlowList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [dateObj, setDateObj] = useState({
        dateRange: "TODAY",
        endDate: "",
        filterTime: "今日",
        startDate: ""
    });
    const [showFilterDate, setShowFilterDate] = useState(false);                  //  线索池是否显示切换日期的弹窗
    const [searchValue, setSearchValue] = useState('');
    const [customRequestParams, setCustomRequestParams] = useState({});  // 当前请求参数

    usePullDownRefresh(() => {
        console.log("下拉刷新");
        getDashContractsData();
        getDashFlowChannel();
        getDashDrainageData();
        getDashEmployeeData();
        setTimeout(() => {
            Taro.stopPullDownRefresh();
        }, 1500);
    })

    useEffect(() => {
        getDashDrainageData();
        getDashFlowChannel();
        getDashEmployeeData();
    }, [dateObj, siteObj])

    useEffect(() => {
        getDashContractsData();
    }, [siteObj]);

    useEffect(() => {
        const query = Taro.createSelectorQuery();
        query
            .select(`#${canvasId}`)
            .fields({ node: true, size: true })
            .exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                const dpr = Taro.getSystemInfoSync().pixelRatio; // 获取设备像素比
                const width = 80;
                const height = 80;

                // 设置实际宽高
                canvas.width = width * dpr;
                canvas.height = height * dpr;

                // 缩放上下文，适配高分辨率屏幕
                ctx.scale(dpr, dpr);

                // 绘制进度条
                drawProgress(ctx, width, height, percent);
            });
    }, [percent]);

    useEffect(() => {
        return () => {
            setSiteObj([]);
        }
    }, [])

    const customDateSelect = (e) => {      // 选择日期的回调
        console.log("自定义选择日期组件 customDateSelect", e);
        setDateObj(e);
    }

    const drawProgress = (ctx, width, height, percent) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 5; // 圆环宽度为 5px
        const startAngle = -Math.PI / 2; // 起始角度
        const endAngle = startAngle + (2 * Math.PI * percent) / 100;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 绘制底部圆环
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#E6F0FF';
        ctx.lineWidth = 8;
        ctx.stroke();

        // 绘制进度条
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = '#1678FF';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const getDashContractsData = async () => {    // 获取项目概况
        Taro.showLoading({ title: '加载中...', mask: true })
        const { code, data, msg } = await dashContractsData({ companySerialCode: companyInfo.companySerialCode, deptIdList: siteObj });
        Taro.hideLoading();
        console.log("获取项目概况", data);
        if (code === 200 && data) {
            setProjectData(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }

    const getDashDrainageData = async () => {      // 获取引流与转化数据
        let params = {
            companySerialCode: companyInfo.companySerialCode,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate ? dateObj.startDate + ' 00:00:00' : '',
            endDate: dateObj.endDate ? dateObj.endDate + ' 23:59:59' : '',
            deptIdList: siteObj
        }
        const { code, data, msg } = await dashDrainageData(params);
        console.log("获取引流与转化数据", data);
        if (code === 200 && data) {
            setStreamData(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }

    const getDashFlowChannel = async () => {   // 获取流量渠道数据
        let params = {
            companySerialCode: companyInfo.companySerialCode,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate ? dateObj.startDate + ' 00:00:00' : '',
            endDate: dateObj.endDate ? dateObj.endDate + ' 23:59:59' : '',
            deptIdList: siteObj
        }
        const { code, data, msg } = await dashFlowChannel(params);
        console.log("获取流量渠道数据", data);
        if (code === 200 && data) {
            setPercent(data?.externalRate * 1);
            setFlowList(data.list);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }

    const getDashEmployeeData = async () => {  // 获取员工数据
        let params = {
            companySerialCode: companyInfo.companySerialCode,
            dateRange: dateObj.dateRange,
            startDate: dateObj.startDate ? dateObj.startDate + ' 00:00:00' : '',
            endDate: dateObj.endDate ? dateObj.endDate + ' 23:59:59' : '',
            deptIdList: siteObj,
            searchInfo: searchValue,
        }
        setCustomRequestParams({ ...params });
        const { code, data, msg } = await dashEmployeeData(params);
        console.log("获取员工数据", data);
        if (code === 200 && data) {
            setEmployeeList(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }

    const searchFunc = throttle(() => {
        getDashEmployeeData();
    }, 300);

    const exportAllFunc = async () => {
        Taro.showLoading({ title: '导出中...' });
        let params = { ...customRequestParams };
        const { code, data, msg } = await exportEmployeeData(params);
        console.log("downloadRoster", code, data, msg);
        Taro.hideLoading();
        if (code === 200) {
            let _downLoadSrc = data;
            wx.downloadFile({
                url: _downLoadSrc,
                success: function (result) {
                    console.log("下载文件成功", result)

                    if (platform === 'pc') {
                        Taro.setClipboardData({
                            data: _downLoadSrc,
                            success: () => {
                                Taro.showToast({
                                    title: '下载地址已复制到粘贴板,可下载查看',
                                    icon: 'none',
                                    duration: 3000
                                })
                            }
                        })
                    } else {
                        if (Taro.getSystemInfoSync().platform === 'android') {
                            Taro.showToast({ title: '点击右上方的按钮然后保存至手机', icon: 'none', duration: 3000 });
                        } else {
                            Taro.showToast({ title: '点击右上方的按钮然后分享至微信进行查看', icon: 'none', duration: 3000 });
                        }
                    }

                    const filePath = result.tempFilePath;  // 临时文件路径
                    setTimeout(() => {
                        forceUpdate();
                        wx.openDocument({
                            filePath: filePath,
                            showMenu: true, // 预览文件右上方的...
                            success: function (response) {
                                console.log('打开文档成功', response)
                            }
                        })
                    }, 3000);
                }
            })
        } else {
            Taro.showToast({ title: msg, icon: 'none' })
        }
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='数据看板' />

            <View className='onsite_wrapper'>
                <View>请选择站点</View>
                <View className='site_filter' onClick={() => {
                    Taro.navigateTo({ url: '/pages/newPackage/setSite/index' })
                }}>
                    <View>{siteObj.length > 0 ? `已选${siteObj.length}个站点` : '全部站点'}</View>
                    <AtIcon value='chevron-down' size='14' color='#1678FF'></AtIcon>
                </View>
            </View>

            <View className='project_wrapper'>
                <View className='project_title'>项目概况</View>
                <View className='project_content'>
                    <View className='project_content_item'>
                        <Text className='project_content_item_num'>{projectData.recruitTotals}</Text>
                        <Text className='project_content_item_label'>项目总数</Text>
                    </View>
                    <View className='project_content_item'>
                        <Text className='project_content_item_num'>{projectData.incumbencyNumber}</Text>
                        <Text className='project_content_item_label'>在职人数</Text>
                    </View>
                    <View className='project_content_item'>
                        <Text className='project_content_item_num'>{projectData.personnelGaps}</Text>
                        <Text className='project_content_item_label'>人员缺口</Text>
                    </View>
                    <View className='project_content_item'>
                        <Text className='project_content_item_num'>{projectData.leaveRate}%</Text>
                        <Text className='project_content_item_label'>离职率</Text>
                    </View>
                </View>
            </View>

            <View className='data_wrapper'>
                <View className='data_filter_wrap' onClick={() => setShowFilterDate(true)}>
                    <View>{dateObj.filterTime ? dateObj.filterTime : dateObj.startDate.replace(/-/g, '.') + '-' + dateObj.endDate.replace(/-/g, '.')}</View>
                    <AtIcon value='chevron-down' size='14' color='#1678FF'></AtIcon>
                </View>
                <View className='stream_wrapper'>
                    <View className='stream_title'>
                        <View>引流与转化</View>
                        {/* <View className='stream_title_right'>
                            <View onClick={() => { setDrainageDate('YESTERDAY') }} className={`title_right_item ${drainageDate === 'YESTERDAY' ? 'title_right_item_active' : ''}`}>昨日</View>
                            <View onClick={() => { setDrainageDate('THIS_WEEK') }} className={`title_right_item ${drainageDate === 'THIS_WEEK' ? 'title_right_item_active' : ''}`}>本周</View>
                            <View onClick={() => { setDrainageDate('THIS_MONTH') }} className={`title_right_item ${drainageDate === 'THIS_MONTH' ? 'title_right_item_active' : ''}`}>本月</View>
                            <View onClick={() => { setDrainageDate('') }} className={`title_right_item ${drainageDate === '' ? 'title_right_item_active' : ''}`}>全部</View>
                        </View> */}
                    </View>

                    <View className='stream_content_wrap'>
                        <View className='stream_content'>
                            <View className='stream_content_item'>
                                <View>{streamData.interviewRate}%</View>
                                <View className='stream_content_item_label'>约面率</View>
                            </View>
                            <View className='stream_content_item'>
                                <View>{streamData.arrivalRate}%</View>
                                <View className='stream_content_item_label'>到面率</View>
                            </View>
                            <View className='stream_content_item'>
                                <View>{streamData.employedRate}%</View>
                                <View className='stream_content_item_label'>入职率</View>
                            </View>
                        </View>

                        <View className='stream_num_wapper'>
                            <View className='stream_num_item'>新增报名 <Text>{streamData.newSignup}</Text> 人</View>
                            <View className='stream_num_item'>跟进联系 <Text>{streamData.followupContact}</Text> 人</View>
                            <View className='stream_num_item'>约定面试 <Text>{streamData.newInterview}</Text> 人</View>
                            <View className='stream_num_item'>实际到面 <Text>{streamData.actualArrival}</Text> 人</View>
                            <View className='stream_num_item'>面试通过 <Text>{streamData.interviewPass}</Text> 人</View>
                            <View className='stream_num_item'>最终入职 <Text>{streamData.finalEntry}</Text> 人</View>
                        </View>
                    </View>
                </View>

                <View className='flow_wrapper'>
                    <View className='stream_title'>
                        <View>流量渠道</View>
                        {/* <View className='stream_title_right'>
                            <View onClick={() => { setFlowDate('YESTERDAY') }} className={`title_right_item ${flowDate === 'YESTERDAY' ? 'title_right_item_active' : ''}`}>昨日</View>
                            <View onClick={() => { setFlowDate('THIS_WEEK') }} className={`title_right_item ${flowDate === 'THIS_WEEK' ? 'title_right_item_active' : ''}`}>本周</View>
                            <View onClick={() => { setFlowDate('THIS_MONTH') }} className={`title_right_item ${flowDate === 'THIS_MONTH' ? 'title_right_item_active' : ''}`}>本月</View>
                            <View onClick={() => { setFlowDate('') }} className={`title_right_item ${flowDate === '' ? 'title_right_item_active' : ''}`}>全部</View>
                        </View> */}
                    </View>
                    <View className='flow_content'>
                        <View className='flow_left'>
                            <View className='canvas_content'>
                                <Canvas
                                    id={canvasId}
                                    canvasId={canvasId}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                    }}
                                    ref={canvasRef}
                                    type='2d'
                                />
                                <View className='percent_text'>{percent}%</View>

                            </View>
                            <View className='flow_left_label'>外部占比</View>
                            <View className='flow_left_label'>（私域以外来源）</View>
                        </View>
                        <View className='flow_right'>
                            <View className='flow_right_title'>
                                <View>线索数</View>
                                <View>入职数</View>
                            </View>
                            <View className='flow_item_wrapper'>
                                {
                                    flowList.length > 0 && flowList.map((item, index) => {
                                        return (
                                            <View className='flow_item' key={index}>
                                                <View className='flow_item_label'>{item.source}</View>
                                                <View className='flow_item_num'><Text className='flow_item_num_text'>{item.newSignup}</Text><Text>人</Text></View>
                                                <View className='flow_item_join'><Text className='flow_item_join_text'>{item.finalEntry}</Text><Text>人</Text></View>
                                            </View>
                                        )
                                    })
                                }
                            </View>

                        </View>
                    </View>

                </View>

                <View className='employee_wrapper'>
                    <View className='stream_title'>
                        <View>员工数据</View>
                        <View className='stream_title_right_export' onClick={exportAllFunc}>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_99.webp`}></Image>
                            <View>导出</View>
                        </View>
                    </View>
                    <View className='search_content'>
                        <Image src={`${Taro.$cdnUrl}/index/index_icon1.webp`}></Image>
                        <Input className='search_input'
                            // disabled={(!isLogin || (role === 'SEEK' && !companyVerified)) ? true : false}
                            placeholder='搜索姓名、手机号'
                            confirmType='search'
                            placeholderStyle='color: #777777;'
                            onInput={(e) => { setSearchValue(e.detail.value) }}
                            onConfirm={searchFunc}
                            value={searchValue}></Input>
                    </View>

                    {
                        employeeList.length > 0 && employeeList.map((item, index) => {
                            return (
                                <View className='employee_data_item' key={index}>
                                    <View className='employee_data_item_title'>
                                        <View>{item.operator}</View>
                                        <View>负责总人数：{item.newSignup}人</View>
                                    </View>
                                    <View className='employee_data_line1'>
                                        <View className='employee_data_line1_item'>
                                            <View>{item.contactedNum}人</View>
                                            <View className='employee_data_line1_item_label'>已联系</View>
                                        </View>
                                        <View className='employee_data_line1_item'>
                                            <View>{item.newInterview}人</View>
                                            <View className='employee_data_line1_item_label'>安排面试</View>
                                        </View>
                                        <View className='employee_data_line1_item'>
                                            <View>{item.actualArrival}人</View>
                                            <View className='employee_data_line1_item_label'>实际到面</View>
                                        </View>
                                    </View>

                                    <View className='employee_data_line2'>
                                        <View className='employee_data_line2_item'>
                                            <View>{item.interviewPass}人</View>
                                            <View className='employee_data_line2_item_label'>面试通过</View>
                                        </View>
                                        <View className='employee_data_line2_item'>
                                            <View>{item.finalEntry}人</View>
                                            <View className='employee_data_line2_item_label'>最终入职</View>
                                        </View>
                                    </View>
                                    <View className='hr'></View>
                                    <View className='employee_data_persent'>
                                        <View className='employee_data_persent_item'>
                                            <View className='employee_data_persent_num'>{item.interviewRate}<Text>%</Text></View>
                                            <View className='employee_data_persent_item_label'>面试转化率</View>
                                        </View>
                                        <View className='employee_data_persent_item'>
                                            <View className='employee_data_persent_num'>{item.arrivalRate}<Text>%</Text></View>
                                            <View className='employee_data_persent_item_label'>到面转化率</View>
                                        </View>
                                        <View className='employee_data_persent_item'>
                                            <View className='employee_data_persent_num'>{item.employedRate}<Text>%</Text></View>
                                            <View className='employee_data_persent_item_label'>最终转化率</View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    }

                </View>
            </View>

            {/* 线索池筛选日期组件 */}
            <Block>
                <CustomDate defaultToday={true} showPicker={showFilterDate} onClose={() => { setShowFilterDate(false) }} onChange={customDateSelect}></CustomDate>
            </Block>
        </View>
    )
})

export default inject('store')(Index)
