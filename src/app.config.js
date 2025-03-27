/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2025-03-26 17:08:09
 * @Description: 
 */
export default defineAppConfig({
    pages: [
        'pages/launch/index',
        'pages/auth/index',
        'pages/index/index',
        'pages/projectManage/index',
        'pages/clue/index',
        'pages/onSiteList/index',
        'pages/mine/index',
        'pages/login/index',
        'pages/supplierProject/index',
        'pages/workerIndex/index',           // 求职者首页
        'pages/channelIndex/index',          // 渠道首页
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
    },
    permission: {
    //   "scope.userLocation": {
    //     "desc": "你的位置信息将用于小程序位置接口的效果展示"
    //   },
    //   "scope.userFuzzyLocation": {
    //     "desc": "你的位置信息将用于小程序位置接口的效果展示"
    //   }
    },
    requiredPrivateInfos: [
    //   "getLocation", "chooseLocation",
    ],
    tabBar: {
        custom: true,
        "list": [{
                "pagePath": "pages/index/index",
                "text": "工作台"
            },
            {
                "pagePath": "pages/projectManage/index",
                "text": "项目管理"
            },
            {
                'pagePath': 'pages/workerIndex/index',
                "text": "首页"
            },
            {
                'pagePath': 'pages/channelIndex/index',
                "text": "供应商"
            },
            {
                "pagePath": "pages/clue/index",
                "text": "线索"
            },
            {
                "pagePath": "pages/onSiteList/index",
                "text": "名单"
            },
            {
                'pagePath': 'pages/mine/index',
                "text": "我的"
            },
            {
                'pagePath': 'pages/supplierProject/index',
                "text": "项目"
            }
        ]
    },
    subPackages: [{
            "root": "pages/talentsPackage/",    // 人才库子包
            "pages": [
                "talents/index",
                "signUpHistory/index",
                "interview/index",              // 安排面试页面
                "filterJob/index",              // 安排面试-报名筛选岗位 
                "search/index",                 // 首页的搜索页面
                "clientDetail/index",           // 客户详情
                "editTalent/index",             // 编辑人才信息
                "talentInterview/index",        // 人才库详情安排面试
                "clueDetail/index",             // 线索详情
                "interceptionFeedback/index",   // 接待未反馈名单
            ]
        },
        {
            "root": "pages/loginPackage/",       // 登录后选择角色和添加信息
            "pages": [
                "chooseRole/index",              // 选择角色
                "writeInfo/index",               // 选择角色
            ]
        },
        {
            "root": "pages/workerPackage/",      // 求职者页面子包
            "pages": [
                "projectDetail/index",           // 求职者查看项目详情
                "signupHistory/index",           // 求职者查看报名记录
                "editProfile/index",             // 编辑用户资料
            ]
        },
        {
            "root": "pages/selectorPackage/",    // 筛选库子包
            "pages": [
                "jobChoose/index",               // 筛选岗位类型
                "areaChoose/index",              // 筛选区域
            ]
        },
        {
            "root": "pages/newPackage/",         // 新增库子包
            "pages": [
                "newProject/index",              // 新增项目
                "newWorker/index",               // 新增求职者信息
                "newEmployee/index",             // 新增员工
                "setOnsite/index",               // 设置驻场
                "newProjectSuccess/index",       // 新增项目成功
                "setCustom/index",               // 新增求职者选择跟进的客服
                "newProjectWorker/index",        // 项目新增求职者
                "newInterviewWorker/index",      // 首页 录入面试信息 新增求职者
                "onSiteProject/index",           // 添加驻场角色 选择项目
                "setSite/index",                 // 添加、修改账号,设置站点
            ]
        },
        {
            "root": "pages/minePackage/",         // 我的库子包
            "pages": [
                "employeeManage/index",           // 员工管理
                "employeeDetail/index",           // 员工详情
                "componyManage/index",            // 公司管理
                "feedback/index",                 // 意见反馈
                "companyAuth/index",              // 企业认证
                "editEmployee/index",             // 修改员工
                "aboutUs/index",                  // 关于我们
                "dataReport/index",               // 数据报表
                "sourcePool/index",               // 资源池
                "changeRole/index",               // 切换当前角色
            ]
        },
        {
            "root": "pages/projectPackage/",      // 项目相关
            "pages": [
                "projectDetail/index",            // 项目详情
                "roster/index",                   // 名单
                "listFeedback/index",             // 名单反馈
                "signinCode/index",               // 签到码
                "feedbackObject/index",           // 选择反馈对象
                "siteSearch/index",               // 驻场-名单 搜索结果页面
                "chooseSupplier/index",           // 驻场-名单 选择供应商
                "viewExport/index",               // 名单 查看导出
                "siteExport/index",               // 驻场-名单 查看导出
            ]
        },
        {
            "root": "pages/signInPackage/",       // 求职者签到-相关页面
            "pages": [
                "signIn/index",                   // 签到页面
                "signLogin/index",                // 求职者签到-登录页面
                "signSuccess/index",              // 求职者签到-成功页面
                "chooseJob/index",                // 求职者签到-扫码进入 选择签到岗位   驻场-名单 添加求职者信息指定岗位
            ]
        },
        {
            "root": "pages/supplierPackage/",     // 供应商相关页面
            "pages":[
                "supplierManage/index",           // 供应商管理
                "supplierDetail/index",           // 供应商详情
                "setContact/index",               // 我的端口设置联系人
                "myPort/index",                   // 我的合作端口详情页面
                "projectSuppliers/index",         // 项目详情中查看供应商列表
                "setPattern/index",               // 设置合作模式
                "projectDetail/index",            // 项目详情
                "collaborateBill/index",          // 合作的发单方
                "sharePage/index",                // 分享落地页
                "roster/index",                   // 名单
            ]
        }
    ]
})
