/**
 * 包装jodb
 * Created by j on 2019-07-13.
 */

import path from 'path'

import config from './config'
import jodb from './jodb'

/**
 *
 * @param name {String} json file name
 * @param initData {Object|Array} json文件初始数据类型
 * @param [conf] {Object}, options对象
 */
export default function (name, initData = [], conf = {}) {

    return jodb(path.resolve(config.USER_DIR, `./${ name }.json`), initData, conf);

}
