/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-12 16:15:16
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-18 12:30:13
 * @Description: 
 */

import React, { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, Text, Textarea, Block, RichText, Button, Canvas, Swiper, SwiperItem } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import { replaceNewLinesWithBr, getImageInfo, canvasDrawFillRoundRect, loadImage } from '@/util/utils'
import drawQrcode from '@/util/drawQrcode.js'

import { AtIcon, AtFloatLayout } from 'taro-ui'
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/float-layout.scss";

import Navbar from '@/components/navbar';
import './index.scss'

import { getContractsInfo, getContractsInfoStatistics, stopContracts, openContracts, getContractsInfoHallStatistics, updateContracts, env, bgImages } from '@/util/api';

const Index = observer(({ store }) => {
  const route = useRouter();
  const {
    baseStore: { bottomSafeAreaHeight },
    businessStore: { setEditProjectInfo, setProjectPatternInfo, setSetOnSiteListForProject, addProjectInterviewInfo, setAddProjectInterviewInfo },
    userStore: { role, userInfo, myPermissions }
  } = store

  const [detail, setDetail] = useState('');
  const [statistics, setStatistics] = useState({});
  const [basicStatistics, setBasicStatistics] = useState({});
  const [showAddress, setShowAddress] = useState(false);         //  是否显示修改面试地址的弹窗
  const [addressInt, setAddressInt] = useState('');              //  面试地址
  const [showDate, setShowDate] = useState(false);               //  是否显示修改面试时间的弹窗
  const [interviewDate, setInterviewDate] = useState('');        //  面试时间

  const [showShareModel, setShowShareModel] = useState(false);   //  是否显示分享弹窗
  const [showSwiper, setShowSwiper] = useState(false);           //  是否显示海报swiper
  const [canvasBg, setCanvasBg] = useState([]);                  //  canvas背景图
  const [codesrc, setCodesrc] = useState('');                    //  二维码图片
  const [swiperImages, setSwiperImages] = useState([]);          //  绘制的海报swiper图片
  let [currentSwiper, setcurrentSwiper] = useState(0);           //  当前swiper下标

  useEffect(() => {
    const allCanvsBgs = bgImages.map(item => getImageInfo(item));
    Promise.all(allCanvsBgs).then(res => {
      console.log("allCanvsBgs", res);
      setCanvasBg(res);
    }).catch(err => {
      console.error("allCanvsBgs_err", err)
    })
  }, []);

  useEffect(() => {
    if (codesrc && canvasBg.length === 4) {
      console.log("开始绘制最终图片", detail);
      const swiperList = canvasBg.map((i, index) => toDrawPhoto(`canvas${index + 1}`, codesrc, i));
      Promise.all(swiperList).then(res => {
        console.log("swiperList", res);
        setSwiperImages(res);
      }).catch(err => {
        console.error("swiperList_err", err)
      })
    }
  }, [codesrc, canvasBg]);

  useDidShow(() => {
    console.log("userInfouserInfouserInfo", userInfo)
    getProjectDetail();
    getProjectStatistics();
    getContractsStatistics();
  })

  const getProjectDetail = async () => {
    const { contractsSerialCode } = route.params;  // numberRecruits, numberOnJob, leaveRate, supplierCount
    Taro.showLoading({ title: '加载中...' });
    const { code, data, msg } = await getContractsInfo({ contractsSerialCode });
    Taro.hideLoading();
    console.log("getProjectDetail_data", data);
    if (code === 200 && data) {
      if (data.interviewAddress) {
        setAddressInt(data.interviewAddress);
      }
      if (data.interviewDate) {
        setInterviewDate(data.interviewDate);
      }
      data.introductions = replaceNewLinesWithBr(data.introduction);
      if (data.privateIntroduction) {
        data.privateIntroductions = replaceNewLinesWithBr(data.privateIntroduction);
      }
      setDetail(data);
      if (!codesrc) {  // 如果还没绘制过二维码，则绘制
        const res = await generateQrcode(data.recruitSerialCode);
        setCodesrc(res);
      }

    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  const getProjectStatistics = async () => {
    const { contractsSerialCode } = route.params;
    const { code, data, msg } = await getContractsInfoStatistics({ contractsSerialCode });
    console.log("getProjectStatistics_data", code, data);
    if (code === 200 && data) {

      setStatistics(data);
    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  const getContractsStatistics = async () => {
    const { contractsSerialCode } = route.params;
    const { code, data, msg } = await getContractsInfoHallStatistics({ contractsSerialCode });
    console.log("getContractsStatistics", code, data);
    if (code === 200 && data) {
      setBasicStatistics(data);
    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  const navigateFunc = (e, url) => {
    e.stopPropagation();
    Taro.navigateTo({
      url
    })
  }

  const stopJob = async () => {
    const { contractsSerialCode } = route.params;
    Taro.showLoading({ title: '加载中...' });
    const { code, data, msg } = await stopContracts({ contractsSerialCode });
    Taro.hideLoading();
    console.log("stopJob_data", code, data);
    if (code === 200) {
      Taro.showToast({ title: '操作成功', icon: 'none' });
      setDetail(detail => {
        let _detail = JSON.parse(JSON.stringify(detail));
        _detail.status = 'COMPLETED';
        return _detail;
      })
    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  const startJob = async () => {
    const { contractsSerialCode } = route.params;
    Taro.showLoading({ title: '加载中...' });
    const { code, data, msg } = await openContracts({ contractsSerialCode });
    Taro.hideLoading();
    console.log("stopJob_data", code, data);
    if (code === 200) {
      Taro.showToast({ title: '操作成功', icon: 'none' });
      setDetail(detail => {
        let _detail = JSON.parse(JSON.stringify(detail));
        _detail.status = 'PROCESSING';
        return _detail;
      })
    } else {
      Taro.showToast({ title: msg, icon: 'none' });
    }
  }

  const goEditProject = () => {   // 编辑项目
    setEditProjectInfo(detail);
    Taro.navigateTo({ url: `/pages/newPackage/newProject/index` });
  }

  const setInterviewAddress = async () => {
    let params = {
      recruitSerialCode: detail.recruitSerialCode,
      serialCode: detail.serialCode,
      interviewAddress: addressInt
    }
    Taro.showLoading({ title: '保存中...' });
    const { code, data, msg } = await updateContracts(params);
    Taro.hideLoading();
    if (code === 200) {
      Taro.showToast({ title: '设置成功', icon: 'none', });
      setShowAddress(false);
      setTimeout(() => {
        getProjectDetail();
      }, 1000);
    } else {
      Taro.showToast({ title: msg, icon: 'none', });
    }
  }

  const setInterviewDateFunc = async () => {
    let params = {
      recruitSerialCode: detail.recruitSerialCode,
      serialCode: detail.serialCode,
      interviewDate
    }
    Taro.showLoading({ title: '保存中...' });
    const { code, data, msg } = await updateContracts(params);
    Taro.hideLoading();
    if (code === 200) {
      Taro.showToast({ title: '设置成功', icon: 'none', });
      setShowDate(false);
      setTimeout(() => {
        getProjectDetail();
      }, 1000);
    } else {
      Taro.showToast({ title: msg, icon: 'none', });
    }
  }

  Taro.useShareAppMessage(res => {  // 分享给朋友
    console.log("企业分享 userInfo.userSerialCode", userInfo, userInfo?.userSerialCode);
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    let url = `/pages/workerPackage/projectDetail/index?recruitSerialCode=${detail.recruitSerialCode}&agentSerialCode=${userInfo.userSerialCode}&inviteRole=SEEK&source=WECHAT_MINI_SHARE`;
    return {
      title: detail.areaName + detail.title,
      imageUrl: `${Taro.$cdnUrl}/supplier/supplier_81.webp`, // 图片 URL
      path: url
    }
  })

  // Taro.useShareTimeline(() => {   // 分享到朋友圈
  //   return {
  //     title: detail.areaName + detail.title,
  //     query: `contractsSerialCode=${route.params.contractsSerialCode}`
  //   }
  // })

  const generateQrcode = async (_recruitSerialCode) => {  // 获取二维码图片
    try {
      const result = await new Promise((resolve, reject) => {
        wx.createSelectorQuery()
          .select('#codeCanvas')
          .fields({ node: true, size: true })
          .exec(res => {
            if (res && res[0] && res[0].node) {
              resolve(res);
            } else {
              reject(new Error('Failed to get canvas node!!'));
            }
          });
      })
      let canvas = result[0].node;
      let _url = env == 'prod' ? 'https://sa-api.apujiyu.com/projectDetailQZWZ' : 'https://sa-test.apujiyu.com/projectDetail';
      let _text = `${_url}?recruitSerialCode=${_recruitSerialCode}&agentSerialCode=${userInfo.userSerialCode}&inviteRole=SEEK&source=WECHAT_MINI_SHARE`;
      drawQrcode({
        canvas: canvas,
        canvasId: 'codeCanvas',
        width: 520,
        padding: 30,
        background: '#ffffff',
        foreground: '#000000',
        text: _text   //`https://sa-api.apujiyu.com/signIn?title=${_title}&recruitSerialCode=${_recruitSerialCode}`
      })
      Taro.hideLoading();

      const _tempFilePath = await new Promise((resolve, reject) => {
        Taro.canvasToTempFilePath({
          canvasId: 'codeCanvas',
          canvas: canvas,
          x: 0,
          y: 0,
          width: 520,
          height: 520,
          destWidth: 520,
          destHeight: 520,
          success(res) {
            resolve(res.tempFilePath);
          },
          fail(err) {
            reject(err);
          }
        })
      })
      console.log('获取到的二维码地址', _tempFilePath);
      return _tempFilePath;
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  const toDrawPhoto = async (canvasId, _codeSrc, _canvasBg) => {
    try {
      const res = await new Promise((resolve) => {
        wx.createSelectorQuery()
          .select(`#${canvasId}`)
          .fields({ node: true, size: true })
          .exec(resolve);
      });
      console.log("res", res);

      const canvas = res[0].node;
      // 初始化画布大小
      canvas.width = 750;
      canvas.height = 1334;

      const context = canvas.getContext('2d');

      // 绘制背景图片
      const bgImg = await loadImage(canvas, _canvasBg);
      context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // 绘制岗位标题
      context.font = '43px PingFang SC';          // 设置字体大小和样式
      context.fillStyle = '#222222';              // 设置文字颜色
      context.textAlign = 'left';                 // 设置文本对齐方式
      context.textBaseline = 'top';               // 设置文本基线
      context.fillText(detail.title.length > 14 ? detail.title.slice(0, 14) + '...' : detail.title, 54, 864);

      // 绘制岗位薪资  
      let metricsWidth = context.measureText(detail.salaryRange.split('元/')[0]).width;
      context.font = '49px D-DIN-PRO';
      context.fillStyle = '#FF5C00';
      context.fillText(detail.salaryRange.split('元/')[0], 54, 933);
      if (detail.salaryRange.split('元/')[1]) {
        context.font = '28px PingFang SC';
        context.fillStyle = '#FF5C00';
        context.fillText('元/' + detail.salaryRange.split('元/')[1], 75 + metricsWidth, 946);
      }

      // 绘制岗位标签
      let _tags = detail.tags ? [...detail.jobReq, ...detail.tags] : [...detail.jobReq];
      let tagObjs = [];
      let tagsWidth = 642;
      let startX = 54;
      let gap = 11;
      for (let i = 0; i < _tags.length; i++) {
        let obj = {
          text: _tags[i],
          textWidth: _tags[i].length * 28,
          boxWidth: _tags[i].length * 28 + 36,
        }
        tagObjs.push(obj);
      }
      let _tagObjswitdh = 0;
      let finishTag = [];                              // 最终需要绘制的tags
      for (let i = 0; i < tagObjs.length; i++) {
        _tagObjswitdh += tagObjs[i].boxWidth + gap;    // 计算所有标签的宽度总和
        if (_tagObjswitdh < tagsWidth) {
          finishTag.push(tagObjs[i]);
        } else {
          break;
        }
      }
      console.log("最终需要绘制的标签finishTag:", finishTag);
      let currentX = startX;                           // 标签矩形初始化起始位置
      let currentTextX = startX + 18;                  // 标签文字初始化起始位置

      for (let i = 0; i < finishTag.length; i++) {
        canvasDrawFillRoundRect(context, {             // 绘制带有圆角的矩形
          fillColor: "#FFF6ED",
          radius: 4,
          xx: currentX, yy: 1003,
          ww: finishTag[i].boxWidth, hh: 45
        });
        currentX += finishTag[i].boxWidth + gap;       // 更新下一个标签的X坐标
        context.font = '28px PingFang SC';
        context.fillStyle = '#E35A0D';
        context.fillText(finishTag[i].text, currentTextX, 1010);
        currentTextX += finishTag[i].boxWidth + gap;   // 更新下一个文字的X坐标
      }

      // 绘制项目地区
      let _addr = detail.areaName.split('·')[1] + detail.areaName.split('·')[2];
      context.font = '32px PingFang SC';
      context.fillStyle = '#333333';
      context.fillText(_addr, 56, 1070);

      // 绘制二维码图片
      const codeImg = await loadImage(canvas, _codeSrc);
      Taro.hideLoading();
      context.drawImage(codeImg, 539, 1126, 148, 148);

      // 将 canvas 绘制的图片导出为临时文件路径
      const tempFilePath = await new Promise((resolve, reject) => {
        Taro.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => resolve(res.tempFilePath),
          fail: (err) => reject(err)
        });
      });
      console.log("导出的图片路径tempFilePath:", tempFilePath);
      return tempFilePath;
    } catch (error) {
      console.error('Error in toDrawPhoto:', error);
    }
  };

  const previewImg = (imgSrc, list) => {
    Taro.previewImage({
      current: imgSrc,            // 当前显示图片的链接
      urls: list          // 需要预览的图片列表
    })
  }

  const savePhoto = (src) => {    // 保存海报
    Taro.saveImageToPhotosAlbum({
      filePath: src,
      success(res) {
        Taro.showToast({ title: '保存成功', icon: 'success', duration: 2000 })
      },
      fail(res) {
        Taro.showToast({ title: res, icon: 'none', duration: 2000 })
      }
    })
  }

  const copyFunc = (text, type) => {
    let _text = '';
    if (type) {    // 复制面试相关信息
      if (detail.interviewInfos?.length > 0) {
        detail.interviewInfos.forEach(element => {
          _text += element.interviewContactName + ' ' + element.interviewContactPhone + '\n'
        });
      }
      if (detail.interviewAddress) {
        _text += detail.interviewAddress + '\n'
      }
      if (detail.interviewDate) {
        _text += detail.interviewDate + '\n'
      }
    } else {
      _text = text;
    }
    console.log("复制的内容:", _text);
    Taro.setClipboardData({
      data: _text,
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

      <View className='project_baseInfo'>
        <View className='project_name'>{detail.title}</View>
        {
          myPermissions.includes('10') &&
          <Image onClick={goEditProject} className='edit_icon' src={`${Taro.$cdnUrl}/supplier/supplier_50.webp`}></Image>
        }

        <View className='project_addr'>{detail.conAreaName}·{detail.jobTypeName}·{detail.createDate}发布</View>
        <View className='project_count'>
          <View className='project_count_item'>
            <View >{basicStatistics.numberRecruits}</View>
            <View className='project_count_item_label'>总需求</View>
          </View>
          <View className='project_count_item'>
            <View >{basicStatistics.numberOnJob}</View>
            <View className='project_count_item_label'>在职人数</View>
          </View>
          <View className='project_count_item'>
            <View >{basicStatistics.leaveRate}%</View>
            <View className='project_count_item_label'>离职率</View>
          </View>
          <View className='project_count_item'>
            <View >{basicStatistics.supplierCount}</View>
            <View className='project_count_item_label'>供应商</View>
          </View>
        </View>
      </View>

      <View className='project_datas'>
        <View className='project_title'>
          <View>交付数据</View>
          <View className='project_more' onClick={(e) => {
            if (myPermissions.includes('11')) {
              navigateFunc(e, `/pages/projectPackage/roster/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)
            } else {
              e.stopPropagation();
              Taro.showToast({ title: '暂无权限', icon: 'none' })
            }
          }}>
            <View>查看名单</View>
            <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
          </View>
        </View>
        <View className='project_datas_content'>
          <View className='project_datas_item'>
            <View>{statistics.sinterviewCounts}</View>
            <View className='project_datas_item_label'>已约面</View>
          </View>
          <View className='project_datas_item'>
            <View>{statistics.alreadyArrivedCounts}</View>
            <View className='project_datas_item_label'>已到面</View>
          </View>
          <View className='project_datas_item'>
            <View>{statistics.interviewPassCounts}</View>
            <View className='project_datas_item_label'>面试通过</View>
          </View>
          <View className='project_datas_item'>
            <View>{statistics.deliveredCounts}</View>
            <View className='project_datas_item_label'>已入职</View>
          </View>
        </View>
      </View>

      {
        role != 'CUSTOMER' && role != 'ON_SITE' &&
        <>
          {
            (!detail.cooperationModels || detail.cooperationModels?.length === 0) &&
            <View className='set_supplier_wrapper'>
              <View className='set_supplier_wrapper_left'>供应链</View>
              <View className='set_supplier_wrapper_right' onClick={() => {
                if (myPermissions.includes('10')) {
                  setProjectPatternInfo({
                    contractsSerialCode: detail.serialCode,
                    title: detail.title,
                    cooperationModels: detail.cooperationModels ? detail.cooperationModels : [],
                    settlementStandard: detail.settlementStandard ? detail.settlementStandard : '',
                  })
                  Taro.navigateTo({
                    url: `/pages/supplierPackage/setPattern/index?contractsSerialCode=${detail.serialCode}&title=${detail.title}`
                  })
                } else {
                  Taro.showToast({ title: '暂无权限', icon: 'none' });
                }
              }}>
                <View>暂未设置合作模式，点击设置</View>
                <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
              </View>
            </View> ||
            detail.cooperationModels?.length > 0 &&
            <View className='get_supplier_wrapper'>
              <View className='get_supplier_wrapper_title'>供应链</View>
              <View className='get_supplier_wrapper_content'>
                <View className='get_supplier_wrapper_content_item' onClick={() => {
                  if (myPermissions.includes('10')) {
                    setProjectPatternInfo({
                      contractsSerialCode: detail.serialCode,
                      title: detail.title,
                      cooperationModels: detail.cooperationModels ? detail.cooperationModels : [],
                      settlementStandard: detail.settlementStandard ? detail.settlementStandard : '',
                    })
                    Taro.navigateTo({
                      url: `/pages/supplierPackage/setPattern/index?contractsSerialCode=${detail.serialCode}&title=${detail.title}`
                    })
                  } else {
                    Taro.showToast({ title: '暂无权限', icon: 'none' });
                  }

                }}>
                  <View className='get_supplier_wrapper_num'>{detail.cooperationModels.length}</View>
                  <View className='get_supplier_wrapper_label'>
                    <View>合作模式</View>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_17.webp`}></Image>
                  </View>
                  <Image className='get_supplier_wrapper_guide' src={`${Taro.$cdnUrl}/supplier/supplier_49.webp`}></Image>
                </View>

                <View className='get_supplier_wrapper_content_item' onClick={() => {
                  if (myPermissions.includes('10')) {
                    Taro.navigateTo({
                      url: `/pages/supplierPackage/projectSuppliers/index?contractsSerialCode=${detail.serialCode}&title=${detail.title}&recruitSerialCode=${detail.recruitSerialCode}`
                    })
                  } else {
                    Taro.showToast({ title: '暂无权限', icon: 'none' });
                  }
                }}>
                  <View className='get_supplier_wrapper_num'>{basicStatistics.supplierCount}</View>
                  <View className='get_supplier_wrapper_label'>
                    <View>供应商</View>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_17.webp`}></Image>
                  </View>
                </View>
              </View>
            </View>
          }
        </>
      }

      <View className='interview_info'>
        <View className='project_title'>
          <View>面试信息</View>
          {
            (detail.interviewInfos?.length > 0 || detail.interviewAddress || detail.interviewDate) &&
            <View className='project_title_copy' onClick={() => copyFunc(detail, 1)}>一键复制</View>
          }
        </View>
        <View className='interview_item'>
          <View className='interview_item_title'>面试联系人</View>
          <View className='interview_item_content' onClick={() => {
            if (!myPermissions.includes('19')) {
              return Taro.showToast({ title: '暂无权限', icon: 'none' });
            }
            Taro.navigateTo({
              url: `/pages/newPackage/chooseInterview/index?recruitSerialCode=${detail.recruitSerialCode}&serialCode=${detail.serialCode}`
            })
            setAddProjectInterviewInfo(detail.interviewInfo ? detail.interviewInfo : {});
          }}>
            {
              (!detail.interviewInfo || Object.keys(detail.interviewInfo).length === 0) &&
              <View className='interview_item_label'>设置面试联系人</View> ||
              <View className='interview_item_text'>{detail.interviewInfo.interviewContactName} <Text onClick={(e) => {
                e.stopPropagation();
                Taro.makePhoneCall({
                  phoneNumber: detail.interviewInfo.interviewContactPhone
                })
              }} >{detail.interviewInfo.interviewContactPhone}</Text></View>
            }
            <Image className='interview_item_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
          </View>
        </View>

        <View className='interview_item'>
          <View className='interview_item_title'>驻场联系人</View>
          <View className='interview_item_content' onClick={() => {
            if (!myPermissions.includes('19')) {
              return Taro.showToast({ title: '暂无权限', icon: 'none' });
            }
            Taro.navigateTo({
              url: `/pages/newPackage/setOnsite/index?recruitSerialCode=${detail.recruitSerialCode}&serialCode=${detail.serialCode}`
            })
            setSetOnSiteListForProject(detail.interviewInfos?.length > 0 ? detail.interviewInfos : []);
          }}>
            {
              (!detail.interviewInfos || detail.interviewInfos.length === 0) &&
              <View className='interview_item_label'>设置驻场联系人</View> ||
              <View className='interview_item_text'>{detail.interviewInfos.length === 1 ? detail.interviewInfos[0].interviewContactName + ' ' + detail.interviewInfos[0].interviewContactPhone : detail.interviewInfos[0].interviewContactName + ` 等${detail.interviewInfos.length}人`} </View>
            }
            <Image className='interview_item_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
          </View>
        </View>

        <View className='interview_item'>
          <View className='interview_item_title'>面试地点</View>
          <View className='interview_item_content' onClick={() => {
            if (!myPermissions.includes('19')) {
              return Taro.showToast({ title: '暂无权限', icon: 'none' });
            }
            setShowAddress(true);
          }}>
            {
              !detail.interviewAddress &&
              <View className='interview_item_label'>设置面试地点</View> ||
              <View className='interview_item_text'>{detail.interviewAddress}</View>
            }
            <Image className='interview_item_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
          </View>
        </View>
        <View className='interview_item'>
          <View className='interview_item_title'>面试时间</View>
          <View className='interview_item_content' onClick={() => {
            if (!myPermissions.includes('19')) {
              return Taro.showToast({ title: '暂无权限', icon: 'none' });
            }
            setShowDate(true);
          }}>
            {
              !detail.interviewDate &&
              <View className='interview_item_label'>设置面试时间</View> ||
              <View className='interview_item_text'>{detail.interviewDate}</View>
            }
            <Image className='interview_item_img' src={`${Taro.$cdnUrl}/newIndex/newIndex_7.webp`}></Image>
          </View>
        </View>
      </View>

      <View className='interview_info'>
        <View className='project_title'>
          <View>招聘简章</View>
          {/* {
            myPermissions.includes('10') &&
            <View className='project_more' onClick={() => {
              goEditProject()
            }}>
              
              <Image src={`${Taro.$cdnUrl}/index/index_icon21.webp`}></Image>
            </View> ||
            <View> </View>
          } */}
          <View className='project_title_copy' onClick={() => copyFunc(detail.introduction)}>一键复制</View>
        </View>
        <View className='job_introduce'>
          <RichText nodes={detail.introductions}></RichText>
        </View>
      </View>


      {
        detail.privateIntroduction &&
        <View className='interview_info'>
          <View className='project_title'>
            <View>岗位详情</View>
            <View className='project_title_copy' onClick={() => copyFunc(detail.privateIntroduction)}>一键复制</View>
          </View>
          <View className='job_introduce'>
            <RichText nodes={detail.privateIntroductions}></RichText>
          </View>
        </View>
      }

      {
        detail.company &&
        <View className='interview_info'>
          <View className='project_title'>
            <View>所属公司</View>
            <View className='project_title_copy' onClick={() => copyFunc(detail.company)}>一键复制</View>
          </View>
          <View className='job_introduce'>
            {detail.company}
          </View>
        </View>
      }

      {
        detail.jobImages?.length > 0 &&
        <View className='job_desc_images'>
          {
            detail.jobImages.map((item, index) => {
              return (
                <Image onClick={() => previewImg(item, detail.jobImages)} className='job_desc_images_i' key={index}></Image>
              )
            })
          }
        </View>
      }

      <View style={`height:300rpx;`}></View>

      <View className='project_btns'>
        <View style={`height:20rpx;`}></View>
        <View className='btn_wrap'>
          {
            detail.status === 'PROCESSING' &&
            <View className='btn_item' onClick={() => {
              if (myPermissions.includes('15')) {
                stopJob();
              } else {
                Taro.showToast({ title: '暂无权限', icon: 'none' });
              }
            }}>
              <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_12.webp`}></Image>
              <View>暂停面试</View>
            </View> ||
            detail.status === 'COMPLETED' &&
            <View className='btn_item' onClick={() => {
              if (myPermissions.includes('15')) {
                startJob();
              } else {
                Taro.showToast({ title: '暂无权限', icon: 'none' });
              }
            }}>
              <Image src={`${Taro.$cdnUrl}/newIndex/newIndex_13.webp`}></Image>
              <View>恢复面试</View>
            </View>
          }

          {
            myPermissions.includes('11') &&
            <View className='btn_item' onClick={(e) => navigateFunc(e, `/pages/projectPackage/roster/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)}>
              <Image src={`${Taro.$cdnUrl}/supplier/supplier_51.webp`}></Image>
              <View>名单</View>
            </View>
          }


          {/* <Button className='btn_item' open-type='share'>
            <Image src={`${Taro.$cdnUrl}/supplier/supplier_52.webp`}></Image>
            <View>分享</View>
          </Button> */}
          <View className='btn_item' onClick={() => setShowShareModel(true)}>
            <Image src={`${Taro.$cdnUrl}/supplier/supplier_52.webp`}></Image>
            <View>分享</View>
          </View>
          {
            // myPermissions.includes('5') &&
            // <View className='btn_item' onClick={goEditProject}>
            //   <Image src={`${Taro.$cdnUrl}/index/index_icon26.webp`}></Image>
            //   <View>编辑</View>
            // </View>
          }
          <View className='add_worker' onClick={(e) => {
            if (myPermissions.includes('12')) {
              navigateFunc(e, `/pages/newPackage/newProjectWorker/index?recruitSerialCode=${detail.recruitSerialCode}&title=${detail.title}`)
            } else {
              Taro.showToast({ title: '暂无权限', icon: 'none' });
            }
          }}>录入求职者</View>
        </View>
        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
      </View>

      <Block>
        {
          showShareModel &&
          <View className='share_modal'>
            <View className='share_modal_wrapper'>
              {
                showSwiper && swiperImages.length > 0 &&
                <>
                  <View className='share_modal_swiper'>
                    <Swiper
                      className='swiper_wrap_mySwiper'
                      circular
                      current={currentSwiper} onChange={(e) => setcurrentSwiper(e.detail.current)}
                    >
                      {
                        swiperImages.map((item, index) => {
                          return (
                            <SwiperItem className='swiper_wrap_item' key={index} onClick={() => previewImg(item, swiperImages)}>
                              <Image src={item}></Image>
                            </SwiperItem>
                          )
                        })
                      }
                    </Swiper>
                  </View>
                  <View className='swiper_dots'>
                    {
                      swiperImages.map((item, index) => {
                        return (
                          <View className={currentSwiper === index ? 'swiper_dot swiper_dot_active' : 'swiper_dot'} key={index}></View>
                        )
                      })
                    }
                  </View>
                </>
              }

              <View className='share_modal_area'>
                <View className='share_modal_title'>
                  <View>分享至</View>
                  <Image src={`${Taro.$cdnUrl}/supplier/supplier_66.webp`} onClick={() => {
                    setShowShareModel(false);
                    setShowSwiper(false);
                  }}></Image>
                </View>
                <View className='share_modal_list'>
                  <Button className='share_modal_item' open-type='share'>
                    <Image src={`${Taro.$cdnUrl}/supplier/supplier_63.webp`}></Image>
                    <View>微信好友</View>
                  </Button>
                  {/* <View className='share_modal_item' onClick={() => {
                  Taro.showModal({ title: '提示', content: '请点击右上角“...”选择分享到朋友圈', showCancel: false });
                }}>
                  <Image src={`${Taro.$cdnUrl}/supplier/supplier_64.webp`}></Image>
                  <View>朋友圈</View>
                </View> */}
                  {
                    showSwiper && swiperImages.length > 0 &&
                    <View className='share_modal_item' onClick={() => savePhoto(swiperImages[currentSwiper])}>
                      <Image src={`${Taro.$cdnUrl}/supplier/supplier_65.webp`}></Image>
                      <View>保存图片</View>
                    </View> ||
                    <View className='share_modal_item' onClick={() => setShowSwiper(true)}>
                      <Image src={`${Taro.$cdnUrl}/supplier/supplier_67.webp`}></Image>
                      <View>生成海报</View>
                    </View>
                  }

                </View>
              </View>
            </View>
          </View>
        }
      </Block>

      <Block>
        <View className='Canvas_wrapper'>
          <Canvas style="width: 520px; height: 520px;" className='codeCanvas' id='codeCanvas' type='2d'></Canvas>
          <Canvas type='2d' id='canvas1' className='canvas_item'></Canvas>
          <Canvas type='2d' id='canvas2' className='canvas_item'></Canvas>
          <Canvas type='2d' id='canvas3' className='canvas_item'></Canvas>
          <Canvas type='2d' id='canvas4' className='canvas_item'></Canvas>
        </View>
      </Block>

      <Block>
        {
          showAddress &&
          <AtFloatLayout catchMove className='role_init_layout' isOpened={showAddress} onClose={() => { setShowAddress(false) }}>
            <View className='filter_wrapper'>
              <View className='filter_wrapper_bg'>
                <View className='filter_title'>
                  <View>设置面试地点</View>
                  <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowAddress(false) }}></AtIcon>
                </View>
                <View className='input_wrapper'>
                  <Textarea count={false}
                    className='float_input'
                    auto-height
                    confirmType='return'
                    value={addressInt}
                    onInput={(e) => setAddressInt(e.detail.value)}
                    adjustPosition={true} //键盘弹起时，是否自动上推页面 
                    show-confirm-bar
                    maxlength={500}
                    autoHeight
                    placeholder={`请输入面试地点`}>
                  </Textarea>
                </View>
                <View className='post_btn' onClick={setInterviewAddress}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
              </View>
            </View>
          </AtFloatLayout>
        }

      </Block>

      <Block>
        {
          showDate &&
          <AtFloatLayout catchMove className='role_init_layout' isOpened={showDate} onClose={() => { setShowDate(false) }}>
            <View className='filter_wrapper'>
              <View className='filter_wrapper_bg'>
                <View className='filter_title'>
                  <View>设置面试时间</View>
                  <AtIcon value='close' size='14' color='#222222' onClick={() => { setShowDate(false) }}></AtIcon>
                </View>
                <View className='input_wrapper'>
                  <Textarea count={false}
                    className='float_input'
                    auto-height
                    confirmType='return'
                    value={interviewDate}
                    onInput={(e) => setInterviewDate(e.detail.value)}
                    adjustPosition={true} //键盘弹起时，是否自动上推页面 
                    show-confirm-bar
                    maxlength={500}
                    autoHeight
                    placeholder={`请输入面试时间`}>
                  </Textarea>
                </View>
                <View className='post_btn' onClick={setInterviewDateFunc}>保存</View>
                <View style={`height:${bottomSafeAreaHeight}px;`}></View>
              </View>
            </View>
          </AtFloatLayout>
        }

      </Block>
    </View>
  )
})

export default inject('store')(Index)
