/*!
 * Created by j on 18/11/9.
 * 把json文件包装成对象进行增删改查
 */

import fs from 'fs'
import path from 'path'


function F(json_file) {
    let file_path = path.join(__dirname, `${json_file}`);
    this.file_path = file_path;
    //
    if (!fs.existsSync(file_path)) {
        fs.createWriteStream(file_path);
        //fs.writeFileSync(file_path, '{}');
        this._json = {};
    } else {
        try {
            let str = fs.readFileSync(this.file_path, 'utf8');
            this._json = JSON.parse(str);
        } catch (e) {
            console.info(json_file);
            console.error(e);
            this._json = {};
        }
    }
}

F.prototype.save = function () {
    let json = JSON.stringify(this._json, null, '\t');
    fs.writeFileSync(this.file_path, json);
};

F.prototype.merge = function (obj) {
    Object.assign(this._json, obj);
};

F.prototype.get = function (key) {
    return key ? (this._json[key] || '' ) : this._json;
};


export default function (json_file) {
    return new F(json_file);
}