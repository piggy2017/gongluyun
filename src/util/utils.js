import Taro from '@tarojs/taro';

export const isFunction = function (params) {
    return '[object Function]' === Object.prototype.toString.call(params);
}
var SIGN_REGEXP = /([yMdhsm])(\1*)/g;
var DEFAULT_PATTERN = 'yyyy-MM-dd';

function padding(s, len) {
    var len = len - (s + '').length;
    for (var i = 0; i < len; i++) {
        s = '0' + s;
    }
    return s;
};
export const formatTime = (totalSeconds, type) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutesTens = Math.floor(minutes / 10);
    const formattedMinutesOnes = minutes % 10;
    const formattedSecondsTens = Math.floor(seconds / 10);
    const formattedSecondsOnes = seconds % 10;

    let time = ''
    if (type === 1) {
        time = formattedMinutesTens;
    } else if (type === 2) {
        time = formattedMinutesOnes;
    } else if (type === 3) {
        time = formattedSecondsTens;
    } else if (type === 4) {
        time = formattedSecondsOnes;
    }
    return time;
}
export const generateRandomString = function (length) {
    const characters = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}
export const selectorQueryClientRect = (taro, selector) => new Promise(resolve => {
    const query = taro.createSelectorQuery();
    query.select(selector).boundingClientRect((res) => {
        resolve(res);
    }).exec();
});
// 根据两个坐标点的经纬度计算它们之间的距离
export const getDistance = function (lat1, lng1, lat2, lng2) {
    const EARTH_RADIUS = 6378.137; // 地球半径，单位为千米
    const radLat1 = (lat1 * Math.PI) / 180.0;
    const radLat2 = (lat2 * Math.PI) / 180.0;
    const a = radLat1 - radLat2;
    const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
    const s =
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
            )
        );
    const distance = s * EARTH_RADIUS;
    return distance.toFixed(2); // 保留小数位数
}
export const debounce = function (fn, delay) {
    let timer = null;

    return function () {
        const context = this;
        const args = arguments;

        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}
export const isOneDayOrMore = function (timestamp1, timestamp2) {
    const timeDiff = Math.abs(timestamp1 - timestamp2);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    return daysDiff >= 1;
};
export const throttle = function (fn, delay) {
    let canRun = true;

    return function () {
        if (!canRun) {
            return;
        }

        const context = this;
        const args = arguments;

        canRun = false;
        setTimeout(function () {
            fn.apply(context, args);
            canRun = true;
        }, delay);
    };
};
export const getTimeDetail = function (time) {
    let date = new Date(time);
    const today = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const timeDiff = Math.floor((today - date) / (1000 * 60)); // 计算时间差，单位为分钟

    if (timeDiff < 60) {
        // 小于60分钟
        if (timeDiff <= 0) {
            return `刚刚`;
        } else {
            return `${timeDiff}分钟前`;
        }

    } else if (timeDiff < 1440) {
        // 小于1440分钟（24小时）
        const hourDiff = Math.floor(timeDiff / 60);
        return `${hourDiff}小时前`;
    } else if (year === today.getFullYear()) {
        // 同一年
        return `${padding(month, 2)}-${padding(day, 2)}`;
    } else {
        // 不同年
        return `${year}-${padding(month, 2)}-${padding(day, 2)}`;
    }
}
export const getTimeMH = function (time) {
    let date = new Date(time);
    const today = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const timeDiff = Math.floor((today - date) / (1000 * 60)); // 计算时间差，单位为分钟

    if (timeDiff < 60) {
        // 小于60分钟
        if (timeDiff <= 0) {
            return `刚刚`;
        } else {
            return `${timeDiff}分钟前`;
        }

    } else if (timeDiff < 1440) {
        // 小于1440分钟（24小时）
        const hourDiff = Math.floor(timeDiff / 60);
        return `${hourDiff}小时前`;
    } else if (year === today.getFullYear()) {
        // 同一年
        return `${padding(month, 2)}-${padding(day, 2)} ${padding(hours, 2)}:${padding(minutes, 2)}`;
    } else {
        // 不同年
        return `${year}-${padding(month, 2)}-${padding(day, 2)} ${padding(hours, 2)}:${padding(minutes, 2)}`;
    }
}
export const validateIDCard = function (idCard) {
    // 正则表达式匹配规则
    var pattern = /^\d{17}(\d|X|x)$/;

    // 验证身份证号码格式
    if (!pattern.test(idCard)) {
        return false;
    }

    // 验证身份证号码最后一位校验码
    var lastChar = idCard.charAt(17).toUpperCase();
    var factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    var checksum = 0;
    for (var i = 0; i < 17; i++) {
        checksum += parseInt(idCard.charAt(i)) * factors[i];
    }
    var mod = checksum % 11;
    var verifyCode = '10X98765432';
    if (lastChar !== verifyCode.charAt(mod)) {
        return false;
    }

    return true;
}

export const selectorQueryDomInfo = (selector) => new Promise(resolve => {
    const query = Taro.createSelectorQuery();
    query.select(selector).boundingClientRect((res) => {
        resolve(res);
    }).exec();
});


//将字符串转换为对象
export const getQueryString = (url) => {
    url = url.replace(/\s*/g, "");

    let itemArr = [];
    let itemObj = {};

    url
        .substring(url.lastIndexOf("?") + 1, url.length)
        .split("&")
        .map((item) => {
            itemArr.push(item.split("="));
        });
    itemArr.map((item) => {
        itemObj[item[0]] = item[1];
    });
    return itemObj;
}

export default {
    convertDataToTree(data) {
        const treeData = [];

        for (const provinceCode in data["86"]) {
            const provinceItem = {
                label: data["86"][provinceCode],
                value: provinceCode,
                children: [],
            };

            if (data[provinceCode]) {
                for (const cityCode in data[provinceCode]) {
                    const cityItem = {
                        label: data[provinceCode][cityCode],
                        value: cityCode,
                        children: [],
                    };

                    if (data[cityCode]) {
                        for (const areaCode in data[cityCode]) {
                            const areaItem = {
                                label: data[cityCode][areaCode],
                                value: areaCode,
                            };
                            cityItem.children.push(areaItem);
                        }
                    }

                    provinceItem.children.push(cityItem);
                }
            }

            treeData.push(provinceItem);
        }

        return treeData;
    },
    formatDate: {
        format: function (date, pattern) {
            pattern = pattern || DEFAULT_PATTERN;
            return pattern.replace(SIGN_REGEXP, function ($0) {
                switch ($0.charAt(0)) {
                    case 'y':
                        return padding(date.getFullYear(), $0.length);
                    case 'M':
                        return padding(date.getMonth() + 1, $0.length);
                    case 'd':
                        return padding(date.getDate(), $0.length);
                    case 'w':
                        return date.getDay() + 1;
                    case 'h':
                        return padding(date.getHours(), $0.length);
                    case 'm':
                        return padding(date.getMinutes(), $0.length);
                    case 's':
                        return padding(date.getSeconds(), $0.length);
                }
            });
        },


        parse: function (dateString, pattern) {
            var matchs1 = pattern.match(SIGN_REGEXP);
            var matchs2 = dateString.match(/(\d)+/g);
            if (matchs1.length == matchs2.length) {
                var _date = new Date(1970, 0, 1);
                for (var i = 0; i < matchs1.length; i++) {
                    var _int = parseInt(matchs2[i]);
                    var sign = matchs1[i];
                    switch (sign.charAt(0)) {
                        case 'y':
                            _date.setFullYear(_int);
                            break;
                        case 'M':
                            _date.setMonth(_int - 1);
                            break;
                        case 'd':
                            _date.setDate(_int);
                            break;
                        case 'h':
                            _date.setHours(_int);
                            break;
                        case 'm':
                            _date.setMinutes(_int);
                            break;
                        case 's':
                            _date.setSeconds(_int);
                            break;
                    }
                }
                return _date;
            }
            return null;
        },
        parseTimestamp: function (dateString) { // 返回10位数时间戳
            var date = new Date(dateString);
            return Date.parse(date) / 1000;
        },
        getNowFormatDate: function () {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
                " " + date.getHours() + seperator2 + date.getMinutes() +
                seperator2 + date.getSeconds();
            return currentdate;
        },

    }
}

export const getStatus = (status, type) => {
    switch (status) {
        case 'PENDING':
            return '待处理';
        case 'UNSUITABLE':
            return '不合适';
        case 'SCHEDULED_INTERVIEW':
            return '已约面';
        case 'NOT_INTERVIEW':
            return '未到面';
        case 'ARRIVE_INTERVIEW':
            return type === 1 ? '已签到' : '已到面';
        case 'INTERVIEW_PASSED':
            return '面试通过';
        case 'INTERVIEW_FAILED':
            return '面试失败';
        case 'EMPLOYED':
            return '已入职';
        case 'RESIGN':
            return '已离职';
    }
}

export const getColor = (status) => {
    switch (status) {
        case 'PENDING':
            return '#1678FF';
        case 'UNSUITABLE':
            return '#F00000';
        case 'SCHEDULED_INTERVIEW':
            return '#32C2FF';
        case 'NOT_INTERVIEW':
            return '#666666';
        case 'ARRIVE_INTERVIEW':
            return '#1678FF';
        case 'INTERVIEW_PASSED':
            return '#FF6B17';
        case 'INTERVIEW_FAILED':
            return '#F00000';
        case 'EMPLOYED':
            return '#04B400';
        case 'RESIGN':
            return '#666666';
    }
}
