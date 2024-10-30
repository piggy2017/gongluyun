/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:09:50
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-29 15:07:09
 * @Description: 用于存放业务相关的数据,例如:岗位筛选的结果
 */

import {
    observable
} from 'mobx'
import { userCenter } from '@/util/api'
import Taro from '@tarojs/taro';
const businessStore = observable({
    poorJobId:{       // 客户池的岗位筛选结果
        title: '全部岗位',
        recruitSerialCode: '',
        selected: false
    },   
    setPoorJobId(value){
        businessStore.poorJobId = value;
    },

    myClientJobId:{  // 我的客户的岗位筛选结果
        title: '全部岗位',
        recruitSerialCode: '',
        selected: false
    },   
    setMyClientJobId(value){
        businessStore.myClientJobId = value;
    },


    workerSetCustomerInfo:{ // 新增求职线索-选择跟进的客服
        name:'',
        userSerialCode:''
    },     
    setWorkerSetCustomerInfo(value){
        businessStore.workerSetCustomerInfo = value;
    },


    addWorkerJobInfo:{ // 新增求职线索-选择报名岗位
        title: '',
        recruitSerialCode: '',
        selected: false
    },     
    setAddWorkerJobInfo(value){
        businessStore.addWorkerJobInfo = value;
    },

    interviewJobInfo:{    // 安排面试-选择报名岗位
        title: '',
        recruitSerialCode: '',
        selected: false
    },
    setInterviewJobInfo(value){
        businessStore.interviewJobInfo = value;
    }
});

export default businessStore
