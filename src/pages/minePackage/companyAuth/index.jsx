
import { useEffect, useState, useReducer } from 'react';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { View, Image, ScrollView, Input } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import { AtIcon } from 'taro-ui'
import crypto from 'crypto-js';
import { decryptData, encryptData } from '@/util/crypto'
import 'taro-ui/dist/style/components/icon.scss';
import {
  authLicense, fetchOssConfig, companySettled
} from '@/util/api'
import { debounce } from '@/util/utils'
import Navbar from '@/components/navbar';
import Base64 from '@/util/base64'
import './index.scss';

const Index = observer(({ store }) => {
  const router = useRouter();
  const [postInfo, setPostInfo] = useState({})
  const [step, setStep] = useState(1);
  const [companyUrl, setCompanyUrl] = useState('');
  const [authInfomation, setAuthInfomation] = useState(null);

  const {
    baseStore: { statusTitleHeight, contenTitleHeight, bottomSafeAreaHeight },
    userStore: { setCompanyVerified, refreshUserInfo, getRoleAndPermissionFunc, setMyPermissions }  // getSubTemplates
  } = store

  const getHeight = () => {
    return `calc(100vh - ${statusTitleHeight + contenTitleHeight}PX)`
  }

  const handleInputChange = debounce((e, type) => {
    setPostInfo({ ...postInfo, [type]: e })
  }, 0);

  const chooseImageFn = async (type, field) => {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    });
    const tempFilePaths = res.tempFilePaths;
    console.log(tempFilePaths, 'tempFilePaths')
    changeAvatar(type, field, tempFilePaths)
  }

  const computeSignature = (accessKeySecret, canonicalString) => {
    return crypto.enc.Base64.stringify(crypto.HmacSHA1(canonicalString, accessKeySecret));
  }

  const changeAvatar = async (type, field, arr) => {
    Taro.showLoading({
      title: '上传中',
      mask: true
    })
    try {
      const result = await fetchOssConfig({ type: 'COMPLAINT', bucket: 'apu-saas' });
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
            console.log("图片上传成功", res);
            let imgUrl = ossServiceDomain + '/' + params.key
            checkImage(imgUrl, field, type)  // 解析图片中的信息
            setCompanyUrl(imgUrl);
          },
          fail(err) {
            console.log(err)
          }
        });
      }
    } catch (e) { }
  };

  const checkImage = async (url, field, type) => {
    let params = { url }
    let res = await authLicense(params)
    if (res.code === 200) {
      console.log("checkImage----", res)
      setPostInfo({ ...res.data });
    }
    Taro.hideLoading()
  }

  const startAuth = async () => {    // 企业认证和签署合同
    console.log("企业认证-postInfo", postInfo);  // createAuthUrl

    if (!postInfo?.companyName) {
      return Taro.showToast({ title: '请输入企业名称', icon: 'none', duration: 2000 })
    }

    if (!postInfo?.legalPerson) {
      return Taro.showToast({ title: '请输入法人姓名', icon: 'none', duration: 2000 })
    }

    if (!postInfo?.socialCreditCode) {
      return Taro.showToast({ title: '请输入营业执照统一代码', icon: 'none', duration: 2000 })
    }

    if (!postInfo?.address) {
      return Taro.showToast({ title: '请输入地址', icon: 'none', duration: 2000 })
    }

    Taro.showLoading({ title: '加载中...', })
    let params = {
      name: postInfo?.companyName ? postInfo.companyName : '',
      legalRe: postInfo?.legalPerson ? postInfo.legalPerson : '',
      expiryDate: postInfo?.approvalDate ? postInfo.approvalDate : '',
      unifiedCode: postInfo?.socialCreditCode ? postInfo.socialCreditCode : '',
      addressDetail: postInfo?.address ? postInfo.address : '',
      type: 'EMPLOYING_UNIT'
    }
    console.log(params, "params")

    companySettled(params).then(res => {
      Taro.hideLoading();
      console.log("companySettled 企业认证结果", res);
      if (res.code === 200) {
        setCompanyVerified(true);
        refreshUserInfo();
        getRoleAndPermissionFunc();
        setMyPermissions();
        Taro.showToast({ title: '认证成功', icon: 'none', duration: 2000 });
        setTimeout(() => {
          // Taro.navigateBack({ delta: 1 })
          switchRoles({ userRole: 'ADMIN' }).then(result => {
            if (result.code === 200) {
              // getSubTemplates();
              Taro.setStorageSync('role', result.data);
              setRole(result.data);
              Taro.switchTab({
                url: '/pages/index/index'
              })
            }
          })
        }, 500);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 2000 });
        refreshUserInfo();
      }
    })
  }


  const handleScrollToLower = () => {
    console.log("我是底部")
    // if (goonLoad) {
    //   setPageNo(pageNo + 1)
    // }
  }

  return (
    <>
      <Navbar fixed placeholder bgColor='#FFFFFF' title='企业认证'></Navbar>
      <View className='company_auth'>
        <ScrollView scrollY className='upload_page' id='center_box_boss'
          style={{ height: getHeight() }}
          onScrollToLower={handleScrollToLower}
          lowerThreshold={300}
        >
          {
            <>
              {
                step == 1 &&
                <>
                  <View className='upload_demo'>
                    <View className='demo_title'>营业执照</View>
                    <View className='demo_sub'>请上传公司的营业执照正本，图片字迹需要清晰，保证平整拍摄。如果上传扫描件，需要加盖公司红色公章。</View>
                    <View className='demo_image'>
                      <View onClick={() => chooseImageFn('COMPANY', 'companyUrl')}>
                        {
                          companyUrl
                            ?
                            <Image src={companyUrl}></Image>
                            :
                            <Image src={`${Taro.$baseCdnUrl}/auth/company_back3.webp`}></Image>
                        }

                      </View>
                    </View>
                  </View>
                  {
                    companyUrl &&
                    <View className='company_info'>
                      <View className='every_info'>
                        <View>企业名称</View>
                        <Input
                          className='info_input'
                          adjustPosition
                          placeholder='XXXXXXXX有限公司'
                          value={postInfo.companyName}
                          onInput={(e) => handleInputChange(e.target.value, 'companyName')}
                        />
                      </View>
                      <View className='every_info'>
                        <View>统一代码</View>
                        <Input
                          className='info_input'
                          adjustPosition
                          placeholder='XXXXXXXXXXXXXXXXXXXXX'
                          value={postInfo.socialCreditCode}
                          onInput={(e) => handleInputChange(e.target.value, 'socialCreditCode')}
                        />
                      </View>

                      <View className='every_info'>
                        <View>企业地址</View>
                        <Input
                          className='info_input'
                          adjustPosition
                          placeholder='请输入企业地址'
                          value={postInfo.address}
                          onInput={(e) => handleInputChange(e.target.value, 'address')}
                        />
                      </View>

                      <View className='every_info'>
                        <View>法人代表</View>
                        <Input
                          className='info_input'
                          adjustPosition
                          placeholder='XXXXXXXXXXXXXXXXXXXXX'
                          value={postInfo.legalPerson}
                          onInput={(e) => handleInputChange(e.target.value, 'legalPerson')}
                        />
                      </View>

                      <View className='every_info'>
                        <View>有效期至</View>
                        <Input
                          className='info_input'
                          adjustPosition
                          placeholder='XXXX-XX-XX'
                          value={postInfo.approvalDate}
                          onInput={(e) => handleInputChange(e.target.value, 'approvalDate')}
                        />
                      </View>
                    </View>
                  }
                </>
              }

              {
                companyUrl && <View className={`post_btn ${(postInfo.companyName && postInfo.legalPerson && postInfo.socialCreditCode && postInfo.address) ? 'post_btn_active' : ''}`} onClick={() => startAuth()}>提交</View>
              }

            </>
          }
          <View className='marginBox'></View>
        </ScrollView>
      </View>
    </>


  )
})

export default inject('store')(Index)
