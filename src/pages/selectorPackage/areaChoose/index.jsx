/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-02-29 14:49:40
 * @LastEditors: 孙林
 * @LastEditTime: 2024-11-12 17:53:45
 * @Description: 
 */
/* eslint-disable import/first */
import { useEffect, useState, useReducer } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, Image, Text, ScrollView } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import { getAreaJson } from '@/util/api';
import { geocode } from '@/util/getLocation'
import utils from '@/util/utils'
import Navbar from '@/components/navbar';
import './index.scss';

const Message = observer(({ store, system }) => {
    const {
        baseStore: { navHeight, bottomSafeAreaHeight, windowWidth },
        businessStore: { baseFilterAddress, jobFilterAddress, setJobFilterAddress },
        // userStore: { userAddress: { province, city, district, adcode }, setUserAddress, jobFilterAddress, setJobFilterAddress }
    } = store

    // const [province, setProvince] = useState([]);
    const [areaList, setAreaList] = useState(null);
    const [provinceName, setProvinceName] = useState('');
    const [cityList, setCityList] = useState([]);
    const [cityName, setCityName] = useState('');
    const [cityCode, setCityCode] = useState('');
    const [districtList, setDistrictList] = useState([]);
    const [districtName, setDistrictName] = useState('');
    const [districtcode, setDistrictcode] = useState('');
    const [latLng, setLatLng] = useState(null);

    const [provinceItem, setProvinceItem] = useState('');
    const [cityItem, setCityItem] = useState('');
    const [districtItem, setDistrictItem] = useState('');


    useEffect(() => {
        const getAreaList = async () => {
            let _getAreaJson = await getAreaJson();
            let newArr = utils.convertDataToTree(_getAreaJson);
            let arr = newArr.filter(r => r.value !== '710000' && r.value !== '810000' && r.value !== '820000');
            console.log("arr", arr)
            setAreaList(arr);

            let _initAddress = jobFilterAddress.province ? jobFilterAddress : baseFilterAddress;

            if (_initAddress.province) {  // 有省份
                setProvinceName(_initAddress.province);
                setProvinceItem(`p${arr.filter(r => r.label == _initAddress.province)[0].value}`)
                const _cityList = arr.filter(r => r.label == _initAddress.province)[0].children;
                setCityList(_cityList);
                if (_initAddress.city) {    // 有城市
                    setCityName(_initAddress.city);
                    Taro.nextTick(() => {
                        setTimeout(() => {
                            setCityItem(`c${_cityList.filter(r => r.label == _initAddress.city)[0].value}`)
                        }, 200);
                    })

                    const _districtList = _cityList.filter(r => r.label == _initAddress.city)[0].children;
                    setDistrictList(_districtList);
                    if (_initAddress.district) {  // 有区域
                        Taro.nextTick(() => {
                            setTimeout(() => {
                                setDistrictItem(`d${_initAddress.adcode}`)
                                console.log("districtItem", `d${_initAddress.adcode}`)
                            }, 300);
                        })
                        setDistrictName(_initAddress.district);
                        setDistrictcode(_initAddress.adcode);
                    }
                }
            }
        }
        getAreaList();
    }, [])


    const getHeight = () => {
        return `calc(100vh - ${navHeight + bottomSafeAreaHeight + (126 / 750) * windowWidth}PX)`
    }

    const chooseProvince = (obj, index) => {   // 选择省
        console.log("chooseProvince_obj", obj);
        if (obj.label != provinceName) {
            setCityList(obj.children);
            setProvinceName(obj.label);
            setCityName('');
            setCityCode('');
            setDistrictList([]);
            setDistrictName('');
            setDistrictcode('');
        }
    }

    const chooseCity = (obj, index) => {   // 选择市
        console.log("chooseCity_obj", obj);
        if (obj.label != cityName) {
            setDistrictList(obj.children);
            setCityName(obj.label);
            setCityCode(obj.value);
            setDistrictName('');
            setDistrictcode('');
        }
    }

    const chooseDistrict = async (obj, index) => {   // 选择区
        console.log("chooseDistrict_obj", obj);
        setDistrictName(obj.label);
        setDistrictcode(obj.value);
        let addr = provinceName + cityName + obj.label;
        // 根据选择的位置 获取经纬度
        const data = await geocode(addr);
        console.log("获取经纬度", data);
        if (data) {
            setLatLng(data);
        }
    }

    const saveAreaFunc = () => {
        // console.log("latLng", latLng);
        let params = {
            init: false,
            adcode: districtcode,
            city: cityName,
            district: districtName,
            province: provinceName,
        }
        if (!districtcode) {   // 没有选择到区
            return Taro.showToast({ title: '请选择到具体的区域', icon: 'none' });
        }
        setJobFilterAddress(params);
        setTimeout(() => {
            Taro.navigateBack({ delta: 1 });
        }, 300);
    }

    return (
        <View className='area_wrap'>
            <Navbar fixed placeholder bgColor='#ffffff' title='地区选择'></Navbar>
            <View className='content_area' style={{ height: getHeight() }}>
                {
                    areaList &&
                    <>
                        <ScrollView
                            className='province_wrap'
                            scrollY
                            scrollWithAnimation
                            refresherEnabled
                            enablePassive
                            showScrollbar={false}
                            scrollIntoView={provinceItem}
                        >
                            {
                                areaList.map((item, index) => {
                                    return <View onClick={() => chooseProvince(item, index)} className={`province_item ${provinceName === item.label ? 'province_item_active' : ''}`} id={`p${item.value}`} key={index} >
                                        <View className='province_item_ext' style={`padding-left:48rpx;`}>{item.label}</View>
                                    </View>
                                })
                            }
                        </ScrollView>
                        <ScrollView
                            className='city_wrap'
                            scrollY
                            scrollWithAnimation
                            refresherEnabled
                            enablePassive
                            showScrollbar={false}
                            scrollIntoView={cityItem}

                        >
                            {
                                cityList.length > 0 && cityList.map((item, index) => {
                                    return <View onClick={() => chooseCity(item, index)} className={`city_item ${cityName === item.label ? 'city_item_active' : ''}`} id={`c${item.value}`} key={index} >
                                        <View className='city_item_ext'>{item.label}</View>
                                    </View>
                                })
                            }
                        </ScrollView>
                        <ScrollView
                            className='district_wrap'
                            scrollY
                            scrollWithAnimation
                            refresherEnabled
                            enablePassive
                            showScrollbar={false}
                            scrollIntoView={districtItem}
                        >
                            {
                                districtList.length > 0 && districtList.map((item, index) => {
                                    return <View onClick={() => chooseDistrict(item, index)} className={`district_item ${districtName === item.label ? 'district_item_active' : ''}`} id={`d${item.value}`} key={index} >
                                        <View className='district_item_ext'>{item.label}</View>
                                        {
                                            districtName === item.label &&
                                            <Image className='district_item_img' src={`${Taro.$baseCdnUrl}/sass/area_choose.webp`}></Image>
                                        }
                                    </View>
                                })
                            }
                        </ScrollView>
                    </>
                }
            </View>

            <View className='bottom_wrapper'>
                <View style={`height:26rpx`}></View>
                <View className='bottom_wrapper_btns'>
                    {/* <View className='btn reset_btn' onClick={() => getLocationFn()} >重置</View> */}
                    <View className='btn save_btn' onClick={saveAreaFunc}>确定</View>
                </View>
                <View style={`height:${bottomSafeAreaHeight}px`}></View>
            </View>
        </View>
    )
})

export default inject('store')(Message)
