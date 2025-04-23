/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-22 11:33:04
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Block, Text, RichText } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { selectorQueryDomInfo, debounce, replaceNewLinesWithBr } from '@/util/utils'

import Navbar from '@/components/navbar';
// import JoinSupplier from '@/components/joinSupplier';
// import ChoosePattern from '@/components/choosePattern';
import './index.scss'

import { getContractsInfo, joinContracts, getContractsInfoStatistics } from '@/util/api';

const Index = observer(({ store }) => {
    const route = useRouter();
    const {
        baseStore: { bottomSafeAreaHeight },
        userStore: { supplierCompanyInfo },
    } = store

    const [isOpen, setIsOpen] = useState(true);

    const [showPatternModel, setShowPatternModel] = useState(false);
    const [statistics, setStatistics] = useState({});
    const [detail, setDetail] = useState('');
    const [showJoinPicker, setShowJoinPicker] = useState(false);

    useEffect(() => {
        console.log("supplierCompanyInfo_supplierCompanyInfo", supplierCompanyInfo);
    }, [])

    useDidShow(() => {
        getDetail();
        getProjectStatistics();
    })

    const getChoosePattern = async (value) => {
        console.log("   执行加入项目", value);
        let params = {
            companySerialCode: detail.companySerialCode,
            contractsSerialCode: detail.serialCode,
            supplierName: supplierCompanyInfo.name,
            supplierSerialCode: supplierCompanyInfo.serialCode,
            channelCode: supplierCompanyInfo.channelCode
            // coopModel: value,
        }
        Taro.showLoading({
            title: '提交中...',
            mask: true
        })
        const { code, data, msg } = await joinContracts(params);
        Taro.hideLoading();
        console.log("加入项目", code, data, msg);
        if (code === 200) {
            Taro.showToast({ title: '加入成功', icon: 'none' });
            getDetail();
            // setShowPatternModel(false);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const getProjectStatistics = async () => {
        const { contractSerialCode } = route.params;
        const { code, data, msg } = await getContractsInfoStatistics({ contractsSerialCode: contractSerialCode });
        console.log("getProjectStatistics_data", code, data);
        if (code === 200 && data) {
            setStatistics(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const getDetail = async () => {
        console.log("route.params", route.params);
        const { contractSerialCode } = route.params;
        console.log("getDetail_contractsSerialCode", contractSerialCode);
        Taro.showLoading({ title: '加载中...' });
        const { code, data, msg } = await getContractsInfo({ contractsSerialCode: contractSerialCode });
        Taro.hideLoading();
        console.log("getProjectDetail_data", data);
        if (code === 200 && data) {
            if (data.introduction) {
                data.introductions = replaceNewLinesWithBr(data.introduction);
            }
            if (data.settlementStandard) {
                data.settlementStandards = replaceNewLinesWithBr(data.settlementStandard);
            }
            if (data.privateIntroduction) {
                data.privateIntroductions = replaceNewLinesWithBr(data.privateIntroduction);
            }
            setDetail(data);
        } else {
            Taro.showToast({ title: msg, icon: 'none' });
        }
    }

    const joinProject = () => {
        console.log('加入项目_supplierCompanyInfo', supplierCompanyInfo);
        if (!supplierCompanyInfo.serialCode) {
            setShowJoinPicker(true);
        }
        getChoosePattern();
        // else{
        //     setShowPatternModel(true);
        // }
    }

    const navigateFunc = (e, url) => {
        e.stopPropagation();
        Taro.navigateTo({
            url
        })
    }

    const previewImg = (imgSrc) => {
        Taro.previewImage({
            current: imgSrc,                // 当前显示图片的链接
            urls: detail.jobImages          // 需要预览的图片列表
        })
    }

    const copyFunc = (text) => {
        Taro.setClipboardData({
            data: text,
            success: () => {
                Taro.showToast({
                    title: '复制成功',
                    icon: 'none'
                })
            }
        })
    }

    return (
        <View className='container'>
            <Navbar fixed placeholder bgColor='transparent' title='项目详情'></Navbar>

            <View className='project_info'>
                <View className='project_info_title'>
                    <View className='project_info_tag'>接单项目</View>
                    <View className='project_info_name'>{detail.title}</View>
                </View>
                <View className='project_info_detail'>{detail.conAreaName}·{detail.jobTypeName}·{detail.numberRecruits}人</View>
                <View className='project_info_compony'>
                    <Image src={detail.companyLogo} className='project_info_compony_avatar'></Image>
                    <View className='project_info_compony_info'>
                        <View>{detail.company}</View>
                        <View className='project_info_compony_info_time'>{detail.createDate}发布</View>
                    </View>
                </View>
            </View>

            {
                detail?.joiningSuccessful &&
                <>
                    <View className='project_datas'>
                        <View className='project_title'>
                            <View>我的交付数据</View>
                            <View className='project_more' onClick={(e) => navigateFunc(e, `/pages/supplierPackage/roster/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)}>
                                <View>查看名单</View>
                                <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
                            </View>
                        </View>
                        <View className='project_datas_content'>
                            <View className='project_datas_item'>
                                <View>{statistics.signUpCounts}</View>
                                <View className='project_datas_item_label'>已上报</View>
                            </View>
                            <View className='project_datas_item'>
                                <View>{statistics.alreadyArrivedCounts}</View>
                                <View className='project_datas_item_label'>已到面</View>
                            </View>
                            <View className='project_datas_item'>
                                <View>{statistics.deliveredCounts}</View>
                                <View className='project_datas_item_label'>已入职</View>
                            </View>
                            <View className='project_datas_item'>
                                <View>{statistics.resignCounts}</View>
                                <View className='project_datas_item_label'>已离职</View>
                            </View>
                        </View>
                    </View>

                    {/* <View className='collaborate_pattern'>
                        <View className='collaborate_pattern_title'>合作模式</View>
                        <View className='collaborate_pattern_content'>
                            <View className='collaborate_pattern_content_dot'></View>
                            <View className='collaborate_pattern_content_text'>{detail.cooperationModel}</View>
                        </View>
                    </View>  */}
                    <View className='project_pattern'>
                        <View className='project_pattern_title'>
                            <View>合作模式</View>
                        </View>
                        {
                            detail.cooperationModels?.length > 0 &&
                            <>
                                {
                                    detail.cooperationModels.map((item, index) => {
                                        return (
                                            <View className='project_pattern_item' key={index}>
                                                <View className='project_pattern_item_title'>模式{index + 1}:</View>
                                                <View className='project_pattern_item_content'>{item}</View>
                                            </View>
                                        )
                                    })
                                }
                            </> ||
                            <View className='project_pattern_item'>暂无合作模式</View>
                        }
                    </View>

                    <View className='project_pattern project_pattern_1'>
                        <View className='project_pattern_title'>
                            <View>结算规则</View>
                            {
                                detail.settlementStandard ? <View className='project_title_copy' onClick={() => copyFunc(detail.settlementStandard)}>一键复制</View> : ''
                            }
                        </View>
                        <View className='project_pattern_rule'>
                            {
                                detail.settlementStandard ? <RichText nodes={detail.settlementStandards}></RichText> : '暂无结算规则'
                            }
                        </View>
                    </View>

                    <View className='project_interview'>
                        <View className='project_interview_title'>面试信息</View>
                        <View className='project_interview_item'>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_12.webp`}></Image>
                            {
                                detail.interviewInfo ?
                                    <View><Text>面试联系人：</Text>{detail.interviewInfo.interviewContactName + ' ' + detail.interviewInfo.interviewContactPhone}</View> :
                                    <View><Text>面试联系人：</Text>暂无</View>
                            }
                        </View>
                        <View className='project_interview_item'>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_11.webp`}></Image>
                            <View><Text>面试地点：</Text>{detail.interviewAddress ? detail.interviewAddress : '暂无'}</View>
                        </View>
                        <View className='project_interview_item'>
                            <Image src={`${Taro.$cdnUrl}/supplier/supplier_13.webp`}></Image>
                            <View><Text>面试时间：</Text>{detail.interviewDate ? detail.interviewDate : '暂无'}</View>
                        </View>
                    </View>

                    <View className='project_desc'>
                        <View className='project_desc_title'>
                            <View>招聘简章</View>
                            {
                                detail.introduction ? <View className='project_title_copy' onClick={() => copyFunc(detail.introduction)}>一键复制</View> : ''
                            }
                            {/* <View className='project_desc_title_right' onClick={() => {
                                setIsOpen(!isOpen);
                            }}>
                                <View>展开</View>
                                <Image src={`${Taro.$cdnUrl}/supplier/supplier_${isOpen ? 9 : 8}.webp`}></Image>
                            </View> */}
                        </View>
                        <View className={`project_desc_content ${isOpen ? 'project_desc_content_open' : 'project_desc_content_close'}`}>
                            <RichText nodes={detail.introductions}></RichText>
                        </View>
                    </View>
                    {
                        detail.privateIntroduction &&
                        <View className='project_pattern project_pattern_1'>
                            <View className='project_pattern_title'>
                                <View>岗位详情</View>
                                {
                                    detail.privateIntroduction && <View className='project_title_copy' onClick={() => copyFunc(detail.privateIntroduction)}>一键复制</View>
                                }
                            </View>
                            <View className='project_pattern_rule'>
                                <RichText nodes={detail.privateIntroductions}></RichText>
                            </View>
                        </View>
                    }
                </>
            }

            {
                (detail?.joiningSuccessful == false) &&
                <>
                    <View className='project_desc'>
                        <View className='project_desc_title'>
                            <View>招聘简章</View>
                            {
                                detail.introduction ? <View className='project_title_copy' onClick={() => copyFunc(detail.introduction)}>一键复制</View> : ''
                            }
                            {/* <View className='project_desc_title_right' onClick={() => {
                                setIsOpen(!isOpen);
                            }}>
                                <View>展开</View>
                                <Image src={`${Taro.$cdnUrl}/supplier/supplier_${isOpen ? 9 : 8}.webp`}></Image>
                            </View> */}
                        </View>
                        <View className={`project_desc_content ${isOpen ? 'project_desc_content_open' : 'project_desc_content_close'}`}>
                            <RichText nodes={detail.introductions}></RichText>
                        </View>
                    </View>


                    <View className='project_pattern'>
                        <View className='project_pattern_title'>
                            <View>合作模式</View>
                        </View>
                        {
                            detail.cooperationModels?.length > 0 &&
                            <>
                                {
                                    detail.cooperationModels.map((item, index) => {
                                        return (
                                            <View className='project_pattern_item' key={index}>
                                                <View className='project_pattern_item_title'>模式{index + 1}:</View>
                                                <View className='project_pattern_item_content'>{item}</View>
                                            </View>
                                        )
                                    })
                                }
                            </> ||
                            <View className='project_pattern_rule'>暂无合作模式</View>
                        }
                    </View>

                    <View className='project_pattern project_pattern_1'>
                        <View className='project_pattern_title'>
                            <View>结算规则</View>
                            {
                                detail.settlementStandard ? <View className='project_title_copy' onClick={() => copyFunc(detail.settlementStandard)}>一键复制</View> : ''
                            }
                        </View>
                        <View className='project_pattern_rule'>
                            {
                                detail.settlementStandard ? <RichText nodes={detail.settlementStandards}></RichText> : '暂无结算规则'
                            }
                        </View>
                    </View>

                    {
                        detail.privateIntroduction &&
                        <View className='project_pattern project_pattern_1'>
                            <View className='project_pattern_title'>
                                <View>岗位详情</View>
                                {
                                    detail.privateIntroduction && <View className='project_title_copy' onClick={() => copyFunc(detail.privateIntroduction)}>一键复制</View>
                                }
                            </View>
                            <View className='project_pattern_rule'>
                                <RichText nodes={detail.privateIntroductions}></RichText>
                            </View>
                        </View>
                    }
                </>
            }

            {
                detail.jobImages?.length > 0 &&
                <View className='job_desc_images'>
                    {
                        detail.jobImages.map((item, index) => {
                            return (
                                <Image onClick={() => previewImg(item)} className='job_desc_images_i' key={index}></Image>
                            )
                        })
                    }
                </View>
            }

            <View style={`height:90px;`}></View>

            <View className='page_bottom'>
                <View style={`height:20rpx;`}></View>
                {
                    (detail?.joiningSuccessful == false) &&
                    <View className='jion_btn' onClick={joinProject}>加入项目</View> ||
                    <View className='page_bottom_btns'>
                        <View className='page_bottom_btn_left' onClick={(e) => navigateFunc(e, `/pages/supplierPackage/roster/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)}>名单</View>
                        <View className='page_bottom_btn_right' onClick={(e) => navigateFunc(e, `/pages/newPackage/newProjectWorker/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}&cooperationModels=${JSON.stringify(detail.cooperationModels ? detail.cooperationModels : [])}`)}>上报求职者</View>
                    </View>
                }

                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
            </View>

            <Taro.GlobalJoinSupplier showPicker={showJoinPicker} onClose={() => { setShowJoinPicker(false) }}></Taro.GlobalJoinSupplier>
            <Taro.ChoosePattern list={detail.cooperationModels} showPicker={showPatternModel} onClose={() => setShowPatternModel(false)} onchange={getChoosePattern}></Taro.ChoosePattern>
        </View>
    )
})

export default inject('store')(Index)
