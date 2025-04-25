/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-09 10:09:50
 * @LastEditors: 孙林
 * @LastEditTime: 2025-04-24 17:15:09
 * @Description: 用于存放业务相关的数据,例如:岗位筛选的结果
 */

import {
    observable
} from 'mobx'
import {
    userCenter,
    clueSource
} from '@/util/api'
import Taro from '@tarojs/taro';
const businessStore = observable({
    poorJobId: [ // 客户池的岗位筛选结果
        {
            title: '全部岗位',
            recruitSerialCode: '',
            selected: false
        }
    ],
    setPoorJobId(value) {
        businessStore.poorJobId = value;
    },

    myClientJobId: [{ // 我的客户的岗位筛选结果
        title: '全部岗位',
        recruitSerialCode: '',
        selected: false
    }],
    setMyClientJobId(value) {
        businessStore.myClientJobId = value;
    },


    workerSetCustomerInfo: { // 新增求职线索-选择跟进的客服
        name: '',
        userSerialCode: ''
    },
    setWorkerSetCustomerInfo(value) {
        businessStore.workerSetCustomerInfo = value;
    },


    addWorkerJobInfo: { // 新增求职线索-选择报名岗位
        title: '',
        recruitSerialCode: '',
        selected: false,
        init: false,
    },
    setAddWorkerJobInfo(value) {
        businessStore.addWorkerJobInfo = value;
    },

    interviewJobInfo: { // 安排面试-选择报名岗位
        title: '',
        recruitSerialCode: '',
        selected: false,
        init: false,
    },
    setInterviewJobInfo(value) {
        businessStore.interviewJobInfo = value;
    },

    myClientParams: {}, // 我的客户筛选条件
    setMyClientParams(value) {
        businessStore.myClientParams = value;
    },


    editClientInfos: null, // 编辑客户信息
    setEditClientInfos(value) {
        businessStore.editClientInfos = value;
    },

    sourceGroup: [], // 来源分组
    setSourceGroup(value) {
        businessStore.sourceGroup = value;
    },

    employeeInfo: null, // 员工详情
    setEmployeeInfo(value) {
        businessStore.employeeInfo = value;
    },

    sourceList: [], // 来源列表
    setSourceList() {
        clueSource({}).then(res => {
            console.log("获取线索来源枚举-clueSource", res);
            if (res.code !== 200) return
            businessStore.sourceList = res.data;
        })
    },


    onSiteFilterJob: [    // 驻场名单-筛选岗位
        {
            title: '全部岗位',
            recruitSerialCode: '',
            selected: false
        }
    ],
    setOnSiteFilterJob(value) {
        businessStore.onSiteFilterJob = value;
    },

    onSiteFilterSUPPLIER: {
        channelName: '全部供应商',
        channelCode: '',
        selected: false
    },
    setOnSiteFilterSUPPLIER(value) {
        businessStore.onSiteFilterSUPPLIER = value;
    },


    onSiteInfo: { // 添加项目设置驻场人员
        name: '',
        phone: '',
        userSerialCode: '',
    },
    setOnSiteInfo(value) {
        businessStore.onSiteInfo = value;
    },

    editProjectInfo: null, // 编辑项目信息
    setEditProjectInfo(value) {
        businessStore.editProjectInfo = value;
    },

    baseFilterAddress: {
        adcode: '510100',
        city: '成都市',
        district: '全成都',
        province: '四川省',
    },
    jobFilterAddress: { // 新增岗位的时候筛选区域
        init: false,
        adcode: '',
        city: '',
        district: '',
        province: '',
    },
    setJobFilterAddress(value) {
        businessStore.jobFilterAddress = value;
    },

    rosterFilterSupplier: {
        channelName: '全部供应商',
        // userSerialCode: '',
        channelCode: '',
        selected: false
    },
    setRosterFilterSupplier(value) {
        businessStore.rosterFilterSupplier = value;
    },

    projectPatternInfo: {
        contractsSerialCode: '',
        title: '',
        cooperationModels: [],
        settlementStandard: ''
    },
    setProjectPatternInfo(value) {
        businessStore.projectPatternInfo = value;
    },

    billComponySerialCode: '', // 供应商角色 首页需要加载的发单方信息的id
    setBillComponySerialCode(value) {
        businessStore.billComponySerialCode = value;
    },

    onSiteProjectList: [], // 添加驻场角色时 给驻场添加项目列表
    setOnSiteProjectList(value) {
        businessStore.onSiteProjectList = value;
    },

    workerJobInfo: {}, // 求职者扫码后选择的岗位信息
    setWorkerJobInfo(value) {
        businessStore.workerJobInfo = value;
    },

    setOnSiteListForProject: [], // 给项目添加驻场角色列表
    setSetOnSiteListForProject(value) {
        businessStore.setOnSiteListForProject = value;
    },

    siteObj: [], // 添加、修改账号,设置站点
    setSiteObj(value) {
        businessStore.siteObj = value;
    },

    showSubscribe: false, // 是否显示订阅
    setShowSubscribe(value) {
        businessStore.showSubscribe = value;
    },

    channelFilterSupplier: {
        channelName: '全部供应商',
        // userSerialCode: '',
        channelCode: '',
        selected: false
    },
    setChannelFilterSupplier(value) {
        businessStore.channelFilterSupplier = value;
    },

    signinSelectJob: [],// 扫总签到码进入扫码页面,需要选择报名岗位

    setSigninSelectJob(value) {
        console.log("setSigninSelectJob", value);
        businessStore.signinSelectJob = value
    },

    addProjectInterviewInfo: {}, // 创建项目,添加面试联系人
    setAddProjectInterviewInfo(value) {
        businessStore.addProjectInterviewInfo = value
    },

    supplierListFilterJob: [ // 客户池的岗位筛选结果
        {
            title: '全部岗位',
            recruitSerialCode: '',
            selected: false
        }
    ],
    setSupplierListFilterJob(value) {
        businessStore.supplierListFilterJob = value;
    },
});

export default businessStore
