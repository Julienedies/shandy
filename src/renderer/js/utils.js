/**
 * 工具函数集合
 * Created by j on 2019-04-08.
 */

import moment from 'moment';

const FILE_PATH = '/file/?path';

function _isUrlPath (path) {
    return path.indexOf && path.indexOf(FILE_PATH) > -1;
}

/**
 * 提取股票名称
 * 预期: '屏幕快照 2018-09-10 下午3.19.55 -华鹏飞-300350.png' => '华鹏飞'
 * @param [path] {String}
 * @return {String|void}
 */
function parseImgName (path) {
    if (!path || typeof path !== 'string') return console.log(path);
    path = _isUrlPath(path) ? decodeURIComponent(path) : path;
    let arr = path.match(/^.+-(.+)-\d{6}\.png$/);
    return arr && arr[1] || path;
}

function parseImgPath (path) {
    if (!path) return console.log(path);
    return _isUrlPath(path) ? path : `${ FILE_PATH }=${ path }`;
}

/**
 * 统计每个标签数量
 * @param arr {Array} 标签数组
 * @return {Object}
 * @example:  countTag(['a','b','a']) => {a:2: b:1}
 */
function countTag (arr) {
    let result = {};
    arr.forEach((v, i) => {
        result[v] = (result[v] || 0) + 1;
    });
    return result;
}

/**
 * 中文首字母排序比较方式
 * @param param1
 * @param param2
 * @returns {number}
 */
function sortByPy (param1, param2) {
    return param1.localeCompare(param2, "zh");
}

/**
 * 获取当前日期 yyyy-mm-dd 格式的字符串
 * @returns {string}
 */
function formatDate () {
    let d = new Date;
    return d.toLocaleDateString().split('/').map((v) => {
        return v.length > 1 ? v : '0' + v;
    }).join('-');
}

/**
 * 获取特定日期 yyyy-mm-dd 格式的字符串，主要是针对复盘与交易计划设定特定日期
 * @returns {string}
 */
function formatDate2 () {
    let now = moment();
    let day = now.day();  // 周几
    let hour = now.hour();
    let f = 'YYYY-MM-DD';
    let m;
    let amount = 1;

    // 如果是周一至周五，并且超过下午3点，则更新时间为当天时间; 否则为前一天开盘日
    if (day > 0 && day < 6 && hour >= 15) {
        m = now;
    } else {
        if (day === 0) {
            amount = 2;
        }
        m = moment().subtract(amount, 'days');
    }

    return m.format(f)
}


////////////////////////////////////////////////////////////////
// export

try {
    window.parseImgName = parseImgName;
    window.parseImgPath = parseImgPath;
    window.sortByPy = sortByPy;
    window.formatDate = formatDate;
    window.formatDate2 = formatDate2;
} catch (e) {
    console.error(e);
}


export default {
    parseImgName,
    parseImgPath,
    sortByPy
}
