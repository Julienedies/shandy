/*!
 * Created by j on 18/9/23.
 * 个股资料查看编辑
 */

import sjo from '../../../libs/stock-jo.js'

export default {

    get: function (req, res) {
        let code = req.params.code
        let dob = sjo(code)
        res.json(dob.get())
    },

    post: function (req, res) {
        let code = req.params.code
        let data = req.body
        let dob = sjo(code)
        dob.merge(data).save()
        res.json(dob.get())
    }

}
