/**
 * Created by j on 18/7/22.
 */

import dob from '../../../libs/dob.js'

let mistake

function data () {
    mistake = mistake || dob('mistake')
    return mistake.get()
}

export default {

    get: function (req, res) {
        res.json(data());
    },

    post: function (req, res) {
        let obj = req.body;
        res.json(data());
    },

    del: function (req, res) {
        let id = req.params.id;
        mistake.find(id).remove();
        res.json(data());
    }
}
