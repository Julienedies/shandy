/**
 *
 * Created by j on 2019-04-08.
 */


/**
 * 提取股票名称
 * 预期: '屏幕快照 2018-09-10 下午3.19.55 -华鹏飞-300350.png' => '华鹏飞'
 * @param filePath {String}
 * @return {String}
 */
function parseImgName (filePath) {
    if (/^\/file/.test(filePath)) {
        filePath = decodeURIComponent(filePath);
    }
    let arr = filePath.match(/^.+-(.+)-\d{6}\.png$/);
    return arr && arr[1] || filePath;
}

function parseImgPath (path) {
    return path.indexOf('/file') > -1 ? path : '/file/?path=' + path;
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
