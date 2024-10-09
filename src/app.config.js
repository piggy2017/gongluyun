/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2024-10-08 17:53:09
 * @Description: 
 */
export default defineAppConfig({
    pages: [
        'pages/index/index',
        'pages/projectManage/index',
        'pages/clue/index',
        'pages/onSiteList/index',
        'pages/mine/index',
        'pages/login/index'
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
    },
    permission: {
      "scope.userLocation": {
        "desc": "获取用户手机号"
      },
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      },
      "scope.userFuzzyLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      }
    },
    requiredPrivateInfos: [
      "getLocation", "chooseLocation",
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
            }
        ]
    },
    subPackages: [{
            "root": "pages/talentsPackage/", // 人才库子包
            "pages": [
                "talents/index",
                "signUpHistory/index",
                "interview/index",
                "filterJob/index",         // 筛选岗位 
                "search/index",
                "clientDetail/index",      // 客户详情
            ]
        },
        {
            "root": "pages/selectorPackage/", // 筛选库子包
            "pages": [
                "jobChoose/index", // 筛选岗位类型
            ]
        },
        {
            "root": "pages/newPackage/", // 新增库子包
            "pages": [
                "newProject/index",      // 新增项目
                "newWorker/index",       // 新增求职者信息
                "newEmployee/index",     // 新增员工
                "setOnsite/index",       // 设置驻场
            ]
        },
        {
            "root": "pages/minePackage/", // 我的库子包
            "pages": [
                "employeeManage/index",   // 员工管理
                "employeeDetail/index",   // 员工详情
                "componyManage/index",    // 公司管理
                "feedback/index",         // 意见反馈
                "companyAuth/index",      // 企业认证
            ]
        },
        {
            "root": "pages/projectPackage/", // 项目相关
            "pages": [
                "projectDetail/index",       // 项目详情
                "roster/index",              // 花名册
                "listFeedback/index",        // 名单反馈
                "signinCode/index",          // 签到码
                "feedbackObject/index",      // 选择反馈对象
            ]
        }
    ]
})
