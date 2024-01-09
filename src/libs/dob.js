/**
 *  数据层对象,用于管理数据的增删改查,序列化
 *  Created by j on 18/7/21.
 */

import fs from 'fs'
import path from 'path'

import recordManager from './recordManager.js'
import objm from './objm.js'

import config from './config'

// 需要先创建一个json文件(类似先创建数据库) ，初始数据可以是object 或 数组
// 方法会根据name读取对应的json文件
export default function (name, conf) {

    let jsonPath = path.join(config.DATA_DIR, `./${ name }.json`);
    let data = fs.readFileSync(jsonPath, 'utf8');
    data = JSON.parse(data);

    // 数组数据或map数据
    let dob = Array.isArray(data) ? recordManager(conf) : objm();

    dob.init(data);

    dob.on('change', function (msg) {
        let json = JSON.stringify(dob.get(), null, '\t');
        fs.writeFileSync(jsonPath, json);
    });


    return dob;
}
