/*!
 * Created by j on 18/9/20.
 */

import _dob from '../../../libs/x-dob.js'

let dob

function initDb(){
    dob = dob || _dob('news')
    return dob
}

export default {

    get: function (req, res) {
        initDb()
        res.json(dob.get());
    },

    post: function (req, res) {
        initDb()
        let data = req.body;
        dob.set(data);
        res.json(dob.get());
    },

    del: function (req, res) {
        initDb()
        let id = req.params.id;
        let result = dob.remove(id);
        res.json(dob.get());
    }
}
