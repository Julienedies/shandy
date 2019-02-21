/**
 * Created by j on 18/8/13.
 * 管理个股自定义数据
 */

import fs from 'fs'
import path from 'path'
import config from '../main/config'

function j_format (s) {
    return s.replace(/([{,])(?=".+"\s*[:]\s*)/img, '$1\r\n');
}

const base_path = path.join(config.DATA_DIR, './csd/s/');

class Sdob {
    constructor (code) {
        let file_path = path.join(base_path, `./${ code }.json`);
        this.file_path = file_path;

        if (!fs.existsSync(file_path)) {
            fs.createWriteStream(file_path);
            //fs.writeFileSync(file_path, '{}');
            this._pool = {};
        } else {
            try {
                let str = fs.readFileSync(this.file_path, 'utf8');
                this._pool = JSON.parse(str);
            } catch (e) {
                console.info(code);
                console.error(e);
                this._pool = {};
            }
        }
    }

    save (obj) {
        obj && Object.assign(this._pool, obj);
        let json = JSON.stringify(this._pool, null, '\t');
        fs.writeFileSync(this.file_path, json);
    }

    merge (obj) {
        Object.assign(this._pool, obj);
    }

    get (key) {
        return key ? (this._pool[key] || '') : this._pool;
    }

    match (key) {
        if (!key) return this._pool;

        let keys = key.split('.');

        return (function fx (namespace, keys) {
            let k = keys.shift();
            let o = namespace[k];
            if (o && keys.length) return fx(namespace[k], keys);
            return o;
        })(this._pool, keys);
    }

}


export { Sdob }

export default function (code) {
    return new Sdob(code);
}