/*!
 * Created by j on 18/11/11.
 */

import fs from 'fs'
import path from 'path'

import _dob from '../../../libs/dob.js'

let dob

function initDb () {
    dob = dob || _dob('txt')
    return dob
}

export default {

    get: function (req, res) {
        initDb()
        res.json(dob.get());
    },

    post: function (req, res) {
        initDb()
        let obj = req.body;  // obj => {title:'', text:'', url:'', type:'', id:''}
        let text = obj.text;
        delete obj.text;
        dob.set(obj);
        let txt_path = path.join(__dirname, `../../data/txt/${ obj.title }.txt`);
        fs.writeFileSync(txt_path, text);
        res.json(dob.get());
    },

    del: function (req, res) {
        initDb()
        let id = req.params.id;
        let result = dob.remove(id);
        res.json(dob.get());
    }
}