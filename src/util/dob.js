/**
 * Created by j on 18/7/21.
 * 数据层对象,用于管理数据的增删改查,序列化
 */

import fs from 'fs'
import path from 'path'

import recordManager from '../libs/recordManager.js'
import objm from '../libs/objm.js'

import config from '../main/config'

export default function (name, conf) {

    let json_path = path.join(config.DATA_DIR, `./${ name }.json`);
    let data = fs.readFileSync(json_path, 'utf8');
    data = JSON.parse(data);

    let dob = Array.isArray(data) ? recordManager(conf) : objm();

    dob.on('change', function (msg) {
        let json = JSON.stringify(dob.get());
        fs.writeFileSync(json_path, json);
    });

    dob.init(data);
    return dob;

}