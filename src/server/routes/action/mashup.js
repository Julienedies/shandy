/**
 * Created by j on 18/8/13.
 */

import fs from 'fs'
import sjo from '../../../libs/sjo'

export default {

    news: function (req, res) {

    },

    basic: function (req, res) {

    },

    get: function (req, res) {
        let code = req.params.code;
        let data = sjo(code).json
        res.json(data);
    },

    _get: function (req, res) {
        let code = req.params.code;
    },

    post: function (req, res) {
        let obj = req.body;
    }

}
