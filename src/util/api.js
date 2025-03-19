/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-10 13:43:28
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-19 17:59:50
 * @Description: 
 */

import http from "./request"

export const env = 'prod'
const base = env === 'prod' ? 'https://sa-api.apujiyu.com' : 'https://sa-test.apujiyu.com/'
export const API_BASE_URL = base + "/mini"
// const API_BASE_URL_JOB = "https://testios.joymian.com/jobfly/order"
const CDN_BASE_URL = "https://apu-mini.oss-accelerate.aliyuncs.com"
const webSocketUrl = env === 'prod' ? "wss://im.apujiyu.com/websocket" : "ws://test.im.apujiyu.com/websocket"


// 登录模块
export const loginPhone = params => {            // 手机号登录
    return http(API_BASE_URL + '/login/wechat/applet', params, "POST", {"Content-Type": "application/json"});
}
export const loginEmployeePhone = params => {    // 员工通道（通过手机号密码登录）
    return http(API_BASE_URL + '/login/phone', params, "POST", {"Content-Type": "application/json"});
}
export const loginCheck = params => {    // 校验系统accessToken
    return http(API_BASE_URL + '/login/check/token', params, "POST", {"Content-Type": "application/json"});
}
export const loginOut = params => {    // 退出登录
    return http(API_BASE_URL + '/login/loginOut', params, "POST", {"Content-Type": "application/json"});
}


// 实名认证模块
export const authLicense = params => {            // license营业执照识别
    return http(API_BASE_URL + '/user/auth/license', params, "POST", {"Content-Type": "application/json"});
}
export const authInfo = params => {            // 获取认证信息
    return http(API_BASE_URL + '/user/auth/info', params, "POST", {"Content-Type": "application/json"});
}


// 用户模块
export const userCenter = params => {               // 个人中心
    return http(API_BASE_URL + '/user/center', params, "POST", {"Content-Type": "application/json"});
}
export const userFeedBack = params => {             // 意见反馈
    return http(API_BASE_URL + '/user/feedBack', params, "POST", {"Content-Type": "application/json"});
}
export const callUp = params => {                   // 用户拨打电话
    return http(API_BASE_URL + '/user/callUp', params, "POST", {"Content-Type": "application/json"});
}


// 首页工作台模块
export const workbenchSearch = params => {              // 首页搜索
    return http(API_BASE_URL + '/workbench/search', params, "POST", {"Content-Type": "application/json"});
}
export const workbenchclueList = params => {            // 人才库
    return http(API_BASE_URL + '/workbench/clueList', params, "POST", {"Content-Type": "application/json"});
}
export const workbenchtodayData = params => {            // 今日数据
    return http(API_BASE_URL + '/workbench/todayData', params, "POST", {"Content-Type": "application/json"});
}
export const todo = params => {                         // 驻场待办
    return http(API_BASE_URL + '/workbench/todo', params, "POST", {"Content-Type": "application/json"});
}
export const workbenchcluePool = params => {            // 线索公海
    return http(API_BASE_URL + '/workbench/cluePool', params, "POST", {"Content-Type": "application/json"});
}
export const workbenchdrainageData = params => {            // 引流数据
    return http(API_BASE_URL + '/workbench/drainageData', params, "POST", {"Content-Type": "application/json"});
}
export const workbenchconvertData = params => {            // 转化数据
    return http(API_BASE_URL + '/workbench/convertData', params, "POST", {"Content-Type": "application/json"});
}
export const onSiteTodayData = params => {                 // 驻场今日数据
    return http(API_BASE_URL + '/workbench/onSiteTodayData', params, "POST", {"Content-Type": "application/json"});
}
export const customerTodo = params => {                    // 客服待办
    return http(API_BASE_URL + '/workbench/customerTodo', params, "POST", {"Content-Type": "application/json"});
}
export const dashContractsData = params => {                    // 分析报表-项目概括
    return http(API_BASE_URL + '/workbench/dashContractsData', params, "POST", {"Content-Type": "application/json"});
}
export const dashDrainageData = params => {                    // 分析报表-引流数据
    return http(API_BASE_URL + '/workbench/dashDrainageData', params, "POST", {"Content-Type": "application/json"});
}
export const dashFlowChannel = params => {                    // 分析报表-流量渠道
    return http(API_BASE_URL + '/workbench/dashFlowChannel', params, "POST", {"Content-Type": "application/json"});
}
export const dashEmployeeData = params => {                    // 分析报表-员工数据
    return http(API_BASE_URL + '/workbench/dashEmployeeData', params, "POST", {"Content-Type": "application/json"});
}



// 岗位相关
export const jobTypeList = params => {            // 获取工种数据
    return http(API_BASE_URL + '/job/jobTypeList', params, "POST", {"Content-Type": "application/json"});
}
export const jobAssoc = params => {               // 岗位联想
    return http(API_BASE_URL + '/job/jobAssoc', params, "POST", {"Content-Type": "application/json"});
}


// 报名相关
export const getUserSignUpList = params => {            // 通过手机号查询用户的报名/求职记录
    return http(API_BASE_URL + '/signUp/getUserSignUpList', params, "POST", {"Content-Type": "application/json"});
}


// 公司管理
export const companySettled = params => {                  // 公司入驻
    return http(API_BASE_URL + '/company/settled', params, "POST", {"Content-Type": "application/json"});
}
export const companyUpdate = params => {                   // 更新公司信息
    return http(API_BASE_URL + '/company/update', params, "POST", {"Content-Type": "application/json"});
}
export const getRoleAndPermission = params => {            // 获取所有角色以及角色下的所有权限
    return http(API_BASE_URL + '/company/getRoleAndPermission', params, "POST", {"Content-Type": "application/json"});
}
export const getRoleAndPermissionByUserId = params => {    // 获取用户拥有角色以及角色下的所有权限
    return http(API_BASE_URL + '/company/getRoleAndPermissionByUserId', params, "POST", {"Content-Type": "application/json"});
}
export const companyMemberList = params => {               // 企业成员列表
    return http(API_BASE_URL + '/company/memberList', params, "POST", {"Content-Type": "application/json"});
}
export const companyAddAccount = params => {               // 添加企业账号
    return http(API_BASE_URL + '/company/addAccount', params, "POST", {"Content-Type": "application/json"});
}
export const companyDisableAccount = params => {           // 停用企业账号
    return http(API_BASE_URL + '/company/disableAccount', params, "POST", {"Content-Type": "application/json"});
}
export const companyUpdateMember = params => {             // 修改企业成员信息
    return http(API_BASE_URL + '/company/updateMember', params, "POST", {"Content-Type": "application/json"});
}
export const companygetInfo = params => {                  // 获取公司详情
    return http(API_BASE_URL + '/company/getInfo', params, "POST", {"Content-Type": "application/json"});
}
export const getMemberInfo = params => {                   // 获取企业成员详情
    return http(API_BASE_URL + '/company/getMemberInfo', params, "POST", {"Content-Type": "application/json"});
}


// 项目相关
export const contractsList = params => {            // 项目大厅
    return http(API_BASE_URL + '/contracts/list', params, "POST", {"Content-Type": "application/json"});
}
export const contractsCreate = params => {            // 发布项目
    return http(API_BASE_URL + '/contracts/create', params, "POST", {"Content-Type": "application/json"});
}
export const contractsgetRoster = params => {            // 获取名单
    return http(API_BASE_URL + '/contracts/getRoster', params, "POST", {"Content-Type": "application/json"});
}
export const getContractsInfoStatistics = params => {            // 获取项目详情-统计
    return http(API_BASE_URL + '/contracts/getContractsInfoStatistics', params, "POST", {"Content-Type": "application/json"});
}
export const getContractsInfoHallStatistics = params => {        // 获取项目详情-基础信息统计
    return http(API_BASE_URL + '/contracts/getContractsInfoHallStatistics', params, "POST", {"Content-Type": "application/json"});
}
export const getContractsInfo = params => {            // 获取项目详情
    return http(API_BASE_URL + '/contracts/getContractsInfo', params, "POST", {"Content-Type": "application/json"});
}
export const stopContracts = params => {            // 停止项目
    return http(API_BASE_URL + '/contracts/stopContracts', params, "POST", {"Content-Type": "application/json"});
}
export const openContracts = params => {            // 打开项目
    return http(API_BASE_URL + '/contracts/openContracts', params, "POST", {"Content-Type": "application/json"});
}
export const updateContracts = params => {            // 编辑项目
    return http(API_BASE_URL + '/contracts/updateContracts', params, "POST", {"Content-Type": "application/json"});
}
export const contractsJobSelector = params => {            // 项目筛选列表
    return http(API_BASE_URL + '/contracts/jobSelector', params, "POST", {"Content-Type": "application/json"});
}
export const contractsSign = params => {                // 签到  已约面-已到面
    return http(API_BASE_URL + '/contracts/sign', params, "POST", {"Content-Type": "application/json"});
}
export const downloadRoster = params => {                // 导出交互名单
    return http(API_BASE_URL + '/contracts/downloadRoster', params, "POST", {"Content-Type": "application/json"});
}
export const qrSign = params => {                // 用户扫码签到
    return http(API_BASE_URL + '/contracts/qrSign', params, "POST", {"Content-Type": "application/json"});
}




// 线索相关
export const cluePool = params => {            // 客户池
    return http(API_BASE_URL + '/clue/pool', params, "POST", {"Content-Type": "application/json"});
}
export const clueSource = params => {       //  获取线索来源枚举
    return http(API_BASE_URL + '/clue/source', params, "GET", { "Content-Type": "application/json" });
};
export const clueInsert = params => {       //  录入求职者信息
    return http(API_BASE_URL + '/clue/insert', params, "POST", { "Content-Type": "application/json" });
};
export const batchInsert = params => {       //  批量录入求职者信息
    return http(API_BASE_URL + '/clue/batchInsert', params, "POST", { "Content-Type": "application/json" });
};
export const clueReceive = params => {       //  立即领取客户
    return http(API_BASE_URL + '/clue/receive', params, "POST", { "Content-Type": "application/json" });
};
export const cluemyClients = params => {       //  我的客户
    return http(API_BASE_URL + '/clue/myClients', params, "POST", { "Content-Type": "application/json" });
};
export const cluegetUserInfo = params => {       //  获取客户信息
    return http(API_BASE_URL + '/clue/getUserInfo', params, "POST", { "Content-Type": "application/json" });
};
export const clueStateFlow = params => {       //  求职状态流转
    return http(API_BASE_URL + '/clue/stateFlow', params, "POST", { "Content-Type": "application/json" });
};
export const clueUpdate = params => {            //  编辑求职者信息
    return http(API_BASE_URL + '/clue/update', params, "POST", { "Content-Type": "application/json" });
};
export const getUserInfoByPhone = params => {       //  通过手机号获取客户信息
    return http(API_BASE_URL + '/clue/getUserInfoByPhone', params, "POST", { "Content-Type": "application/json" });
};
export const getClueUserInfo = params => {       //  获取人才库用户详情
    return http(API_BASE_URL + '/clue/getClueUserInfo', params, "POST", { "Content-Type": "application/json" });
};
export const unsuitable = params => {            //  不合适
    return http(API_BASE_URL + '/signUp/unsuitable', params, "POST", { "Content-Type": "application/json" });
};


// 面试相关
export const getArrangeableRecruitList = params => {       //  获取我可安排的岗位
    return http(API_BASE_URL + '/interview/getArrangeableRecruitList', params, "POST", { "Content-Type": "application/json" });
};
export const arrangeInterview = params => {                //  安排面试
    return http(API_BASE_URL + '/interview/arrangeInterview', params, "POST", { "Content-Type": "application/json" });
};
export const updateInterviewer = params => {               //  更新面试信息
    return http(API_BASE_URL + '/interview/updateInterviewer', params, "POST", { "Content-Type": "application/json" });
};
export const batchUpdateInterviewer = params => {          //  批量更新面试信息
    return http(API_BASE_URL + '/interview/batchUpdateInterviewer', params, "POST", { "Content-Type": "application/json" });
};




export const fetchOssConfig = params => {   //  获取oss校验
    return http(API_BASE_URL + '/upload/stsToken', params, "POST", {"Content-Type": "application/json"});
};



// 反馈名单
export const getFeedbackObjectsByCustomer = params => {   //  客服获取反馈对象
    return http(API_BASE_URL + '/fb/getFeedbackObjectsByCustomer', params, "POST", {"Content-Type": "application/json"});
};



export const getAreaJson = params => { //获取地域信息
    return http(CDN_BASE_URL + '/china/data.json', params, "GET", { "Content-Type": "application/json" });
};
export const getCityJson = params => { //获取地区信息
    return http(CDN_BASE_URL + '/china/all_cities.json', params, "GET", { "Content-Type": "application/json" });
};



// 供应商相关API
export const mySupplierList = params => {  // 【供应商】供应商-合作的供应商列表
    return http(API_BASE_URL + '/supplier/mySupplierList', params, "POST", { "Content-Type": "application/json" });
};
export const getSupplierInfo = params => {  // 【供应商】供应商详情
    return http(API_BASE_URL + '/supplier/getSupplierInfo', params, "POST", { "Content-Type": "application/json" });
};
export const getContractsBySupplierAndCompany = params => {  // 【供应商】企业查看-与供应商合作的项目
    return http(API_BASE_URL + '/supplier/getContractsBySupplierAndCompany', params, "POST", { "Content-Type": "application/json" });
};
export const getCoopCompanyBySupplier = params => {  // 【供应商】供应商查看-合作的发单方列表
    return http(API_BASE_URL + '/supplier/getCoopCompanyBySupplier', params, "POST", { "Content-Type": "application/json" });
};
export const getContractsByCompany = params => {  // 【供应商】供应商查看-企业下的项目
    return http(API_BASE_URL + '/supplier/getContractsByCompany', params, "POST", { "Content-Type": "application/json" });
};
export const checkSupplier = params => {  // 【【供应商】供应商操作-检查用户是否是供应商
    return http(API_BASE_URL + '/supplier/checkSupplier', params, "POST", { "Content-Type": "application/json" });
};
export const joinContracts = params => {  // 【供应商】供应商操作-加入企业项目
    return http(API_BASE_URL + '/supplier/joinContracts', params, "POST", { "Content-Type": "application/json" });
};
export const setUpCoopModelBySupplier = params => {  // 【供应商】供应商-设置合作模式
    return http(API_BASE_URL + '/supplier/setUpCoopModelBySupplier', params, "POST", { "Content-Type": "application/json" });
};
export const setUpCompanyCustomer = params => {  // 【供应商】设置公司客服
    return http(API_BASE_URL + '/company/setUpCompanyCustomer', params, "POST", { "Content-Type": "application/json" });
};
export const setUpCoopModelByCompany = params => {  // 【【供应商】企业操作-设置合作模式
    return http(API_BASE_URL + '/contracts/setUpCoopModelByCompany', params, "POST", { "Content-Type": "application/json" });
};
export const getContractsList = params => {     // 【【供应商】企业查看项目列表
    return http(API_BASE_URL + '/supplier/getContractsList', params, "POST", { "Content-Type": "application/json" });
};
export const supplierCreate = params => {       // 【供应商】供应商操作-创建
    return http(API_BASE_URL + '/supplier/create', params, "POST", { "Content-Type": "application/json" });
};
export const mySupplierListByContracts = params => {       // 【供应商】供应商-根据项目ID获取合作的供应商列表
    return http(API_BASE_URL + '/supplier/mySupplierListByContracts', params, "POST", { "Content-Type": "application/json" });
};
export const updateUserInfo = params => {       // 【供应商】更新用户信息
    return http(API_BASE_URL + '/user/updateUser', params, "POST", { "Content-Type": "application/json" });
};
export const indexFeeds = params => {       // 【供应商】求职者首页
    return http(API_BASE_URL + '/index/feeds', params, "POST", { "Content-Type": "application/json" });
};
export const getRecruitmentInfo = params => {       // 【供应商】求职者查看项目详情
    return http(API_BASE_URL + '/recruit/getRecruitmentInfo', params, "POST", { "Content-Type": "application/json" });
};
export const signUpRecruitList = params => {       // 【供应商】求职查看-用户报名招聘列表
    return http(API_BASE_URL + '/user/signUpRecruitList', params, "POST", { "Content-Type": "application/json" });
};
export const signUpAdd = params => {       // 【供应商】求职者报名
    return http(API_BASE_URL + '/signUp/add', params, "POST", { "Content-Type": "application/json" });
};

// 资源池 用户收益
export const sharedStats = params => {                   // 分享拉新收益统计
    return http(API_BASE_URL + '/user/revenue/sharedStats', params, "POST", { "Content-Type": "application/json" });
};
export const sharedList = params => {                   // 分享拉新收益列表
    return http(API_BASE_URL + '/user/revenue/sharedList', params, "POST", { "Content-Type": "application/json" });
};
export const getJWSettings = params => {   //  求职设置
    return http(API_BASE_URL + '/user/getSettings', params, "POST", { "Content-Type": "application/json" });
};
export const setJP = params => {           //    求职设置
    return http(API_BASE_URL + '/user/setJp', params, "POST", { "Content-Type": "application/json" });
};

export const parsePerson = params => {     // 【供应商】录入求职者-智能识别 
    return http(API_BASE_URL + '/clue/parsePerson', params, "POST", { "Content-Type": "application/json" });
};

export const switchRoles = params => {     // 【供应商】个人中心-切换角色
    return http(API_BASE_URL + '/user/switchRoles', params, "POST", { "Content-Type": "application/json" });
};