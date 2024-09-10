/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-10 17:24:18
 * @Description: 
 */
export default defineAppConfig({
    pages: [
        'pages/index/index',
        'pages/projectManage/index',
        'pages/clue/index',
        'pages/mine/index'
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
    },
    // permission: {
    //   "scope.userLocation": {
    //     "desc": "获取用户手机号"
    //   },
    //   "scope.userLocation": {
    //     "desc": "你的位置信息将用于小程序位置接口的效果展示"
    //   },
    //   "scope.userFuzzyLocation": {
    //     "desc": "你的位置信息将用于小程序位置接口的效果展示"
    //   }
    // },
    // requiredPrivateInfos: [
    //   "getLocation", "chooseLocation",
    // ],
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
                "filterJob/index",
            ]
        },
        {
            "root": "pages/selectorPackage/", // 删选库子包
            "pages": [
                "jobChoose/index", // 筛选岗位类型
            ]
        }
    ]
})
