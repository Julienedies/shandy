/**
 * 工具函数集合
 * Created by j on 2019-04-08.
 */

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
    if(!path || typeof path !== 'string') return console.log(path);
    path = _isUrlPath(path) ? decodeURIComponent(path) : path;
    let arr = path.match(/^.+-(.+)-\d{6}\.png$/);
    return arr && arr[1] || path;
}

function parseImgPath (path) {
    if(!path) return console.log(path);
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
    arr.forEach( (v, i) => {
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
function sortByPy(param1, param2) {
    return param1.localeCompare(param2, "zh");
}

try {

    window.parseImgName = parseImgName;
    window.parseImgPath = parseImgPath;

} catch (e) {
    console.error(e)
}


export default {
    parseImgName,
    parseImgPath,
    sortByPy
}
