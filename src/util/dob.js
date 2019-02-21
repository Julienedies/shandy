/**
 * Created by j on 18/7/21.
 * 数据层对象,用于管理数据的增删改查,序列化
 */

const fs = require('fs');
const path = require('path');

const recordManager = require('./recordManager.js');
const objm = require('./objm.js');

module.exports = function (name, conf) {

    let json_path = path.join(DATA_DIR, `${name}.json`);

    let data = require(json_path);

    let dob = Array.isArray(data) ? recordManager(conf) : objm();

    dob.on('change', function (msg) {
        let json = JSON.stringify(dob.get());
        fs.writeFileSync(json_path, json);
    });

    dob.init(data);
    return dob;

};