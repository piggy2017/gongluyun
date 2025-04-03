import { useEffect, useState, useReducer } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image, Button, Input, Textarea, Block } from "@tarojs/components";
import { observer, inject } from "mobx-react";
import crypto from 'crypto-js';
import { AtActionSheet, AtActionSheetItem } from 'taro-ui'
import "taro-ui/dist/style/components/action-sheet.scss";
import utils from "@/util/utils";

import WorkerJobType from '@/components/workerJobType';
import Navbar from '@/components/navbar';
import Base64 from '@/util/base64'

import {
  updateUserInfo,
  fetchOssConfig,
} from "@/util/api";
import Picker from "@/components/picker";
import "./index.scss";

const Index = observer(({ store }) => {
  const {
    userStore: { userInfo, refreshUserInfo },
    baseStore: { bottomSafeAreaHeight },
  } = store
  const [forceUpdateId, forceUpdate] = useReducer(() => [], []);
  const myRole = store.userStore.role;
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(
    "https://apu-mini.oss-accelerate.aliyuncs.com/boss/publish_success.webp"
  );
  const [imageUrls, setImageUrls] = useState([]);      // 技能图片
  const [education, setEducation] = useState('');    // 学历
  const [userExps, setUserExps] = useState('');      // 工作经验
  const [age, setAge] = useState(0);
  const [ageRange, setAgeRange] = useState([]);
  const [sex, setSex] = useState(2);
  const [sexStr, setSexStr] = useState("");

  const [jobTypes, setJobTypes] = useState([]);
  const [chooseJob, setChooseJob] = useState(false);             // 选择岗位类型的弹窗

  const [showPicker, setShowPicker] = useState(false);
  const [options, setOption] = useState({});
  const [openAction, setOpenAction] = useState(false);           // 是否打开选择照片弹窗
  const [updateType, setUpdateType] = useState(1);               // 上传图片类型  1=上传头像  2=上传技能图片

  useEffect(() => {
    const fetchData = async () => {
      setName(userInfo.nickName);
      setAvatar(userInfo.avatar);
      setSex(userInfo.sex);
      setAge(userInfo.age);
      if (userInfo.imageUrls) {
        setImageUrls(userInfo.imageUrls);
      }
      if (userInfo.education) {
        setEducation(userInfo.education);
      }
      if (userInfo.userExps) {
        setUserExps(userInfo.userExps);
      }
      if (userInfo.jobTypes) {
        let _types = userInfo.jobTypes.map((item) => {
          item.name = item.jobTypeName;
          return item;
        })
        setJobTypes(_types);
      } else {
        setJobTypes([]);
      }

      let ranges = [];
      for (let i = 16; i <= 65; i++) {
        let str = i.toString();
        ranges.push(str);
      }
      setAgeRange(ranges);
    };
    fetchData();
    return () => {
    };
  }, [forceUpdateId]);


  const handlerOpen = (data, type, title, pickerList) => {
    let item = {
      data,
      title,
      type,
      pickerList,
    };
    setOption(item);
    setShowPicker(true);
  };

  useEffect(() => {
    Taro.eventCenter.on('refreshPage', refreshPage);
    return () => {
      // componentWillUnmount
      Taro.eventCenter.off('refreshPage', refreshPage);
    }
  }, []);

  const refreshPage = () => {
    console.log('我被监听了')
    forceUpdate()
  }

  const handlePhotoClick = async (type) => {
    let sourceType = {
      1: 'album',
      2: 'camera'
    }
    // 用户同意授权
    try {
      Taro.chooseImage({
        count: updateType === 1 ? 1 : 6 - imageUrls.length, // 最多可选择的图片数量
        sourceType: [sourceType[type]], // 图片来源，可选值：album（相册），camera（相机）
        sizeType: ['original', 'compressed'], // 图片尺寸类型，可选值：original（原图），compressed（压缩图）
        success(res) {
          setOpenAction(false);
          // 获取到用户选择的照片信息
          console.log('选择的照片路径：', res);
          const { tempFilePaths } = res;
          getOssSrc(tempFilePaths);
        },
      });
    } catch (err) {
      console.log('选择照片失败：', err);
    }
  }

  const openModel = async (type) => {
    setOpenAction(true);
    setUpdateType(1);
  };

  const getOssSrc = async (arr) => {
    Taro.showLoading({
      title: '上传中',
      mask: true
    })
    try {
      const result = await fetchOssConfig({ type: "AVATAR", bucket: 'apu-mini' });
      console.log(result, "result")
      if (result.code === 200) {
        let { ossServiceDomain, accessKeyId, urlPath, accessKeySecret, securityToken } = result.data;
        const date = new Date();
        date.setHours(date.getHours() + 1);
        const policyText = {
          expiration: date.toISOString(),
          conditions: [
            ["content-length-range", 0, 1024 * 1024 * 1024],
          ],
        };
        console.log(1)
        const policy = Base64.encode(JSON.stringify(policyText));
        console.log(policy, "policy")
        const signature = computeSignature(accessKeySecret, policy);
        console.log(signature, "signature")
        if (updateType === 1) {    // 上传头像
          const params = {
            'key': `${urlPath}${Date.now()}-${Math.random() * 1000000}.jpg`,
            'policy': policy,
            'OSSAccessKeyId': accessKeyId,
            'success_action_status': '200',
            'Signature': signature,
            'x-oss-security-token': securityToken,
          };
          console.log(arr[0], "arr[0]")
          // 返回 Promise 对象
          Taro.uploadFile({
            url: ossServiceDomain,
            filePath: arr[0],
            name: 'file',
            formData: params,
            success(res) {
              // let info = { ...res, url: params.key }
              Taro.hideLoading();
              let imgUrl = ossServiceDomain + '/' + params.key;
              // setImgSrc(imgUrl);
              console.log('上传成功 --  oss地址为', imgUrl);
              setAvatar(ossServiceDomain + '/' + params.key)
            },
            fail(err) {
              console.log(err)
            }
          });
        } else {
          console.log("arrarrarrarr", arr);
          // 返回 Promise 对象
          const uploadPromises = arr.map(r => {
            const params = {
              'key': `${urlPath}${Date.now()}-${Math.random() * 1000000}.jpg`,
              'policy': policy,
              'OSSAccessKeyId': accessKeyId,
              'success_action_status': '200',
              'Signature': signature,
              'x-oss-security-token': securityToken,
            };

            // 返回 Promise 对象
            return new Promise((resolve, reject) => {
              Taro.uploadFile({
                url: ossServiceDomain,
                filePath: r,
                name: 'file',
                formData: params,
                success(res) {
                  let imgUrl = ossServiceDomain + '/' + params.key;
                  resolve(imgUrl);
                },
                fail(err) {
                  reject(err);
                }
              });
            });
          });

          // 等待所有异步操作完成
          Promise.all(uploadPromises)
            .then(results => {
              Taro.hideLoading();
              console.log("上传 技能 成功 --  oss地址为", results);
              setImageUrls([...imageUrls, ...results]);
            })
            .catch(error => {
              Taro.hideLoading();
              console.error(error);
            });
        }

      }
    } catch (e) { }
  };

  const pickerSelect = (e) => {
    if (e.type === "sex") {
      const value = e.data[0] === "男" ? 0 : 1;
      setSex(value);
      setSexStr(e.data[0]);
    } else if (e.type === "age") {
      setAge(e.data[0]);
    } else {
      console.log("其他");
    }
  };

  const computeSignature = (accessKeySecret, canonicalString) => {
    return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
  }

  const updateWxAvatar = async () => {
    await updateWxAvatar({
      code: "",
      userInfo: {
        signature: "",
        rawData: "",
        encryptedData: "",
        iv: "",
      },
    });
  };

  const submit = async () => {
    let params = {
      nickName:name,
      age,
      sex,
      education,
      jobTypeIds: jobTypes.map(item => item.id),
      avatar,
      userExps,
      imageUrls
    };
    console.log("params", params);
    Taro.showLoading({
      title: "提交中",
      mask: true
    })
    const res = await updateUserInfo(params);
    if (res.code === 200) {
      refreshUserInfo();
      Taro.showToast({
        title: "提交成功",
        icon: "none",
      });
      Taro.hideLoading()

      setTimeout(() => {
        Taro.navigateBack(-1);
      }, 300);
    }
  };

  const deleteImg = (index) => {  // imageUrls, setImageUrls
    setImageUrls([...imageUrls.slice(0, index), ...imageUrls.slice(index + 1)])
  }

  const previewImg = (imgSrc) => {
    Taro.previewImage({
      current: imgSrc,            // 当前显示图片的链接
      urls: imageUrls              // 需要预览的图片列表
    })
  }

  return (
    <View className='body'>
      <Image src={`${Taro.$baseCdnUrl}/personal/edit_bg.webp`} className='header_bg'></Image>
      {/* <NavBar title='编辑个人资料' color='#000' background='#00000000' /> */}
      <Navbar fixed placeholder bgColor='#00000000' title='编辑个人资料'></Navbar>
      <Button className='avatar_area' onClick={openModel}>
        <Image src={avatar} className='avatar' mode='aspectFill'></Image>
        <View className='edit_btn'></View>
      </Button>

      <View className='menu'>
        <Text className='menu_name'>名字</Text>
        <View className='left_box'>
          {/* <Text className='menu_value'>{name}</Text> */}
          <Input
            className='menu_input'
            placeholder='请输入姓名(必填)'
            placeholderStyle='color: #999999;'
            value={name}
            onInput={(e) => setName(e.detail.value)}
          ></Input>
        </View>
      </View>

      <View className='menu' onClick={() => handlerOpen([ageRange], 'age', "年龄", [age ? age - 16 : 0])}>
        <Text className='menu_name'>年龄</Text>
        <View className='left_box'>
          <Text className='menu_value'>{age > 0 ? age : "请选择"}</Text>
          <Image src={`${Taro.$cdnUrl}/supplier/supplier_17.webp`} className='right_arow'></Image>
        </View>
      </View>

      <View
        className='menu'
        onClick={() => handlerOpen([["男", "女"]], "sex", "性别", [sexStr])}
      >
        <Text className='menu_name'>性别</Text>
        <View className='left_box'>
          <Text className='menu_value'>
            {sex != 2 ? `${sex == 0 ? "男" : "女"}` : "请选择"}
          </Text>
          <Image src={`${Taro.$cdnUrl}/supplier/supplier_17.webp`} className='right_arow'></Image>
        </View>
      </View>

      <View className='menu'>
        <Text className='menu_name'>学历</Text>
        <View className='left_box'>
          <Input
            className='menu_input'
            placeholder='请输入学历'
            placeholderStyle='color: #999999;'
            value={education}
            onInput={(e) => setEducation(e.detail.value)}
          ></Input>
        </View>
      </View>

      <View className='menu' onClick={() => setChooseJob(true)}>
        <Text className='menu_name'>求职意向</Text>
        <Text className={`menu_tips ${myRole === "boss" ? "menu_tips_boss" : "menu_tips_personal"}`}>
          编辑
        </Text>
      </View>
      <View className='jw_section'>
        <Text className='jobs_name'>
          {
            jobTypes.length > 0 && jobTypes.map((item, index) => {
              return (
                <Text key={index}>{item.name}{index !== jobTypes.length - 1 && "、"}</Text>
              )
            })
          }
        </Text>
      </View>

      <View className='project_group_imgs'>
        <View className='project_group_imgs_title'>上传证书照片（{imageUrls.length}/6）</View>
        <View className='project_group_imgs_wrap'>
          {
            imageUrls.length < 6 &&
            <View className='add_img' onClick={() => {
              setUpdateType(2);
              setOpenAction(true);
            }}>
              <Image src={`${Taro.$cdnUrl}/index/index_icon14.webp`}></Image>
            </View>
          }
          {
            imageUrls.length > 0 && imageUrls.map((item, index) => {
              return <View className='add_img_wrap' key={index}>
                <Image src={item} className='add_img_item' onClick={() => previewImg(item)}></Image>
                <Image onClick={() => deleteImg(index)} src={`${Taro.$cdnUrl}/index/index_icon15.webp`} className='add_img_delete'></Image>
              </View>
            })
          }
        </View>
      </View>

      <View className="item_title">工作经验</View>
      <Textarea
        count={false}
        className='input_text'
        auto-height
        confirmType='return'
        value={userExps}
        onInput={(e) => setUserExps(e.detail.value)}
        adjustPosition={true} //键盘弹起时，是否自动上推页面 
        show-confirm-bar
        maxlength={500}
        autoHeight
        placeholder={`输入工作经验...`}
      />


      <View style={`height:100px;`}></View>

      <View className="bottom_wrapper">
        <View style={`height:20rpx;`}></View>
        <Button className='submit_btn' onClick={submit}>提交</Button>
        <View style={`height:${bottomSafeAreaHeight}px;`}></View>
      </View>

      {showPicker && (
        <Picker
          {...options}
          showPicker={showPicker}
          onClose={() => {
            setShowPicker(false);
          }}
          onChange={pickerSelect}
        />
      )}

      {/* 选择岗位类型 */}
      <Block>
        <WorkerJobType isShow={chooseJob}
          initData={(jobTypes && jobTypes.length > 0) ? jobTypes : []}
          multiple={true}
          onClose={(e) => {
            console.log("选择的岗位类型：", e)
            if (e && e.length) {
              setJobTypes(e);
            }
            setChooseJob(false);
          }}
        ></WorkerJobType>
      </Block>

      <AtActionSheet isOpened={openAction} cancelText='取消' onCancel={() => setOpenAction(false)} onClose={() => setOpenAction(false)}>
        <AtActionSheetItem onClick={() => handlePhotoClick(1)}>
          选择照片
        </AtActionSheetItem>
        <AtActionSheetItem onClick={() => handlePhotoClick(2)}>
          相机拍照
        </AtActionSheetItem>
      </AtActionSheet>
    </View>
  );
});

export default inject("store")(Index);
