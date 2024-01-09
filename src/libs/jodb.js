/**
 * 包装jsono、recordManager、objm | json object dataBase => jodb
 * Created by j on 2019-07-13.
 */

import jsono from './jsono'
import objm from './objm'
import recordManager from './recordManager'

/**
 * json文件数据增删改查：jsono用于序列化及简单数据修改，objm 和 recordManager 用于辅助复杂json增删改查；
 * @param jsonFilePath {String} json文件路径
 * @param initData {Object|Array} json文件初始数据类型
 * @param conf {Object} 可选，recordManager用配置参数对象
 * @return {Objm|RecordManager}
 */
export default function (jsonFilePath, initData = [], conf = {}) {

    const jo = jsono(jsonFilePath, initData);

    let dob = Array.isArray(initData) ? recordManager(conf) : objm();

    dob.init(jo.json);  // 一开始初始化从json文件填充数据不用触发change事件

    // 其他地方的jodb修改了json，通过这种方式更新当前jodb
    dob.refresh = function () {
        jo.refresh();
        dob.init(jo.json);
    };

    // 数据更新保存
    dob.on('change', function (msg) {
        console.log('on dob.change', msg, jsonFilePath);
        jo.json = dob.get();
        jo.save();
    });

    return dob;

}
