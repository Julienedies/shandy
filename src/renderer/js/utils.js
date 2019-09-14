/**
 * 工具函数集合
 * Created by j on 2019-04-08.
 */

const FILE_PATH = '/file/?path';

function _isUrlPath (path) {
    return path.indexOf(FILE_PATH) > -1;
}

/**
 * 提取股票名称
 * 预期: '屏幕快照 2018-09-10 下午3.19.55 -华鹏飞-300350.png' => '华鹏飞'
 * @param path {String}
 * @return {String}
 */
function parseImgName (path) {
    path = _isUrlPath(path) ? decodeURIComponent(path) : path;
    let arr = path.match(/^.+-(.+)-\d{6}\.png$/);
    return arr && arr[1] || path;
}

function parseImgPath (path) {
    return _isUrlPath(path) ? path : `${ FILE_PATH }=${ path }`;
}

try {

    window.parseImgName = parseImgName;
    window.parseImgPath = parseImgPath;

} catch (e) {
    console.error(e)
}


export default {
    parseImgName,
    parseImgPath
}
