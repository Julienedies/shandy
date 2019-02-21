/*!
 * Created by j on 18/11/11.
 */

const fs = require('fs');
const path = require('path');

const dob = require('../libs/dob.js')('txt');

module.exports = {

    get: function (req, res) {
        res.json(dob.get());
    },

    post: function (req, res) {
        var obj = req.body;  // obj => {title:'', text:'', url:'', type:'', id:''}
        var text = obj.text;
        delete obj.text;
        dob.set(obj);
        let txt_path = path.join(__dirname, `../../data/txt/${obj.title}.txt`);
        fs.writeFileSync(txt_path, text);
        res.json(dob.get());
    },

    del: function (req, res) {
        var id = req.params.id;
        var result = dob.remove(id);
        res.json(dob.get());
    }
};