/*!
 * Created by j on 2019-03-17.
 */

import 'babel-polyfill'

import csd from '../../../libs/csd'

export default {
    async getDays (req, res) {
        const data = await csd.getDay(req.query)
        res.json(data)
    },
    async getTick (req, res) {
        const data = await csd.getTick(req.query)
        res.json(data)
    }
}