/**
 *  取代 dob.js;
 * 数据层对象,用于管理数据的增删改查,序列化;
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
 * @param [conf] {Object} 可选，recordManager用配置参数对象
 * @return {Objm|RecordManager}
 */

// 单例模式，用于存储同路径唯一json
// todo 这不是真正的单例模式，在不同的renderer里，还是独立的
const INSTANCES = {};


export default function (jsonFilePath, initData = [], conf = {}) {

    let arr = jsonFilePath.split(/[\\/]/img);
    let key = arr.pop().replace('.json','');
    let instance = INSTANCES[key];

    if (instance) {
        console.log('jodb:使用单例实例', key);
        return instance;
    }

    const jo = jsono(jsonFilePath, initData);

    // 得到一个数据管理层对象
    let dob = Array.isArray(initData) ? recordManager(conf) : objm();

    // 对数据管理层对象填充数据
    // 一开始初始化从json文件填充数据不用触发change事件
    dob.init(jo.json);

    // 其他地方的jodb修改了json，通过这种方式更新当前jodb
    // 更新成单例模式后，这个好像就没有必要了
    dob.refresh = function () {
        jo.refresh();
        dob.init(jo.json);
    };

    // 数据有更新保存到json文件
    dob.on('change', function (msg) {
        console.log('on dob.change', msg, jsonFilePath);
        jo.json = dob.get();
        jo.save();
    });

    // 缓存唯一同名json实例
    INSTANCES[key] = dob;

    console.log('jodb:第一个实例', key);

    return dob;

}
