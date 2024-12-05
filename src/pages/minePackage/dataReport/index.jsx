/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-11 15:58:00
 * @LastEditors: 孙林
 * @LastEditTime: 2024-12-04 14:12:41
 * @Description: 
 */

import React, { useState, useEffect, useReducer, useRef } from 'react'
import Taro, { useRouter,usePullDownRefresh } from '@tarojs/taro';
import { View, Image, Text, Canvas } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce } from '@/util/utils'
import { AtIcon, AtFloatLayout } from 'taro-ui'
import { decryptData, encryptData } from '@/util/crypto'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import Navbar from '@/components/navbar';
import './index.scss'

import { dashContractsData, dashDrainageData, dashFlowChannel, dashEmployeeData } from '@/util/api'


const Index = observer(({ store }) => {
    const router = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { companyInfo, role, permissions },
        businessStore: { employeeInfo, setEmployeeInfo }
    } = store

    const [drainageDate, setDrainageDate] = useState('YESTERDAY');
    const [employeeDate, setEmployeeDate] = useState('YESTERDAY');
    const [percent, setPercent] = useState(0);
    const canvasId = 'progressCanvas';
    const canvasRef = useRef(null);

    const [projectData, setProjectData] = useState('');
    const [streamData, setStreamData] = useState('');
    const [flowList, setFlowList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);

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
        getDashContractsData();
        getDashFlowChannel();
    }, []);

    useEffect(() => {
        getDashDrainageData();
    }, [drainageDate]);

    useEffect(() => {
        getDashEmployeeData();
    }, [employeeDate]);

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
        const { code, data, msg } = await dashContractsData({ companySerialCode: companyInfo.companySerialCode });
        Taro.hideLoading();
        console.log("获取项目概况", data);
        if (code === 200 && data) {
            setProjectData(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }

    const getDashDrainageData = async () => {      // 获取引流与转化数据
        const { code, data, msg } = await dashDrainageData({ companySerialCode: companyInfo.companySerialCode, dateRange: drainageDate });
        console.log("获取引流与转化数据", data);
        if (code === 200 && data) {
            setStreamData(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }

    const getDashFlowChannel = async () => {   // 获取流量渠道数据
        const { code, data, msg } = await dashFlowChannel({ companySerialCode: companyInfo.companySerialCode });
        console.log("获取流量渠道数据", data);
        if (code === 200 && data) {
            setPercent(data?.externalRate * 1);
            setFlowList(data?.list?.length > 0 ? data?.list.slice(0, 6) : []);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }

    const getDashEmployeeData = async () => {  // 获取员工数据
        const { code, data, msg } = await dashEmployeeData({ companySerialCode: companyInfo.companySerialCode, dateRange: employeeDate });
        console.log("获取员工数据", data);
        if (code === 200 && data) {
            setEmployeeList(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
    }



    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='#FFFFFF' title='分析报表'></Navbar>

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

            <View className='stream_wrapper'>
                <View className='stream_title'>
                    <View>引流与转化</View>
                    <View className='stream_title_right'>
                        <View onClick={() => { setDrainageDate('YESTERDAY') }} className={`title_right_item ${drainageDate === 'YESTERDAY' ? 'title_right_item_active' : ''}`}>昨日</View>
                        <View onClick={() => { setDrainageDate('THIS_WEEK') }} className={`title_right_item ${drainageDate === 'THIS_WEEK' ? 'title_right_item_active' : ''}`}>本周</View>
                        <View onClick={() => { setDrainageDate('THIS_MONTH') }} className={`title_right_item ${drainageDate === 'THIS_MONTH' ? 'title_right_item_active' : ''}`}>本月</View>
                    </View>
                </View>

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

            <View className='flow_wrapper'>
                <View className='flow_left'>
                    <View className='flow_left_title'>流量渠道</View>
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
                    {/* <View className='flow_item'>
                        <View className='flow_item_label'>供应商</View>
                        <View className='flow_item_num'><Text className='flow_item_num_text'>52</Text><Text>人</Text></View>
                        <View className='flow_item_join'><Text className='flow_item_join_text'>52</Text><Text>人</Text></View>
                    </View> */}
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

            <View className='employee_wrapper'>
                <View className='stream_title'>
                    <View>引流与转化</View>
                    <View className='stream_title_right'>
                        <View onClick={() => { setEmployeeDate('YESTERDAY') }} className={`title_right_item ${employeeDate === 'YESTERDAY' ? 'title_right_item_active' : ''}`}>昨日</View>
                        <View onClick={() => { setEmployeeDate('THIS_WEEK') }} className={`title_right_item ${employeeDate === 'THIS_WEEK' ? 'title_right_item_active' : ''}`}>本周</View>
                        <View onClick={() => { setEmployeeDate('THIS_MONTH') }} className={`title_right_item ${employeeDate === 'THIS_MONTH' ? 'title_right_item_active' : ''}`}>本月</View>
                    </View>
                </View>

                {
                    employeeList.length>0 && employeeList.map((item,index)=>{
                        return(
                            <View className='employee_item' key={index}>
                                <View className='employee_item_name'>{item.operator}</View>
                                <View className='employee_item_datas'>
                                    <View className='employee_item_datas_item'>
                                        <View>{item.newSignup}</View>
                                        <View className='employee_item_datas_item_label'>录入线索</View>
                                    </View>
                                    <View className='employee_item_datas_item'>
                                        <View>{item.followupContact}</View>
                                        <View className='employee_item_datas_item_label'>跟进客户</View>
                                    </View>
                                    <View className='employee_item_datas_item'>
                                        <View>{item.newInterview}</View>
                                        <View className='employee_item_datas_item_label'>安排面试</View>
                                    </View>
                                    <View className='employee_item_datas_item'>
                                        <View>{item.finalEntry}</View>
                                        <View className='employee_item_datas_item_label'>成功入职</View>
                                    </View>
                                </View>
                            </View>
                        )
                    })
                }
            </View>
        </View>
    )
})

export default inject('store')(Index)
