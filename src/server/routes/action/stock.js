/*!
 * Created by j on 18/9/23.
 * 个股资料查看编辑
 */

import sdob from '../../../util/sdob.js'

export default {

    get: function (req, res) {
        let code = req.params.code;
        let dob = sdob(code);
        res.json(dob.get());
    },

    post: function (req, res) {
        let code = req.params.code;
        let data = req.body;
        let dob = sdob(code);
        dob.set(data);
        res.json(dob.get());
    }

}