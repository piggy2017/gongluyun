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

export const throttleCustom = function (fn, delay) {
    let isThrottled = false;
    return function (...args) {
      if (!isThrottled) {
        fn(...args);
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, delay);
      }
    }
  }

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

export const loadImage = async (canvas, src) => {
    return new Promise((resolve, reject) => {
        const img = canvas.createImage();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
};

export const getImageInfo = async (_src) => { // 获取图片信息
    return new Promise((resolve, reject) => {
        Taro.getImageInfo({
            src: _src,
            success: res => {
                resolve(res.path);
            },
            fail: err => {
                reject(err);
            }
        })
    })
}

/**该方法用来绘制一个有填充色的圆角矩形
 *@param cxt:canvas的上下文环境
 *@param x:左上角x轴坐标
 *@param y:左上角y轴坐标
 *@param width:矩形的宽度
 *@param height:矩形的高度
 *@param radius:圆的半径
 *@param fillColor:填充颜色
 **/
export function canvasDrawFillRoundRect(canvas, params = {
    xx: 0,
    yy: 0,
    ww: 0,
    hh: 0,
    radius: 0,
    fillColor: 'red'
}) {
    let x = params.xx;
    let y = params.yy;
    let width = params.ww;
    let height = params.hh;
    let radius = params.radius;
    let fillColor = params.fillColor;

    // 圆的直径必然要小于矩形的宽高
    if (2 * radius > width || 2 * radius > height) {
        return false;
    }

    canvas.save();
    canvas.translate(x, y);
    // 绘制圆角矩形的各个边
    drawRoundRectPath(canvas, width, height, radius);
    canvas.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值
    canvas.fill();
    canvas.restore();
}

function drawRoundRectPath(canvas, width, height, radius) {
    canvas.beginPath(0);
    // 从右下角顺时针绘制，弧度从0到1/2PI
    canvas.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

    // 矩形下边线
    canvas.lineTo(radius, height);

    // 左下角圆弧，弧度从1/2PI到PI
    canvas.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

    // 矩形左边线
    canvas.lineTo(0, radius);

    // 左上角圆弧，弧度从PI到3/2PI
    canvas.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);

    // 上边线
    canvas.lineTo(width - radius, 0);

    // 右上角圆弧
    canvas.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);

    // 右边线
    canvas.lineTo(width, height - radius);
    canvas.closePath();
}

export const getRoleName = (role) => {
    let name = '';
    switch (role) {
        case '1':
            name = '管理员';
            break;
        case '2':
            name = '客服';
            break;
        case '3':
            name = '驻场';
            break;
        case '6':
            name = '渠道';
            break;
        default:
            name = '未知';
            break;
    }
    return name;
}

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
        case 'SIGNED_UP':
            return '已录入';
        case 'PENDING':
            return '待处理';
        case 'CONTACT':
            return '已联系';
        case 'UNSUITABLE':
            return '不合适';
        case 'FULL':
            return '名单满储备下次';
        case 'REVIEW_NOT_PASSED':
            return '名单审核不通过';
        case 'SCHEDULED_INTERVIEW':
            return '已约面';
        case 'NOT_INTERVIEW':
            return '未到面';
        case 'ARRIVE_INTERVIEW':
            return type === 1 ? '已签到' : '已到面';
        case 'UNDETERMINED':
            return '待定';
        case 'INTERVIEW_PASSED':
            return '面试通过';
        case 'INTERVIEW_FAILED':
            return '面试失败';
        case 'GIVE_HALFWAY':
            return '中途放弃';
        case 'EMPLOYED':
            return '已入职';
        case 'RESIGN':
            return '已离职';
        case 'SETTLEMENT':
            return '可结算';
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
        case 'CONTACT':
            return '#1678FF';
    }
}

// 聊天消息的文本转换   \n  ↵  转换为 <br>
export function replaceNewLinesWithBr(text) {
    return text.replace(/\n/g, "<br>").replace(/↵/g, "<br>");
}
