/*!
 * Created by j on 18/11/25.
 * 股票市场概念列表
 */

import sdob from '../../../util/sdob.js'
import stocksManager from '../../../libs/stocks-manager'

export default {

    get: function (req, res) {
        let stocks = stocksManager.get()
        let concept = req.params.name;
        let result = [];
        stocks.forEach(function (v, i) {
            let code = v[0];
            let dob = sdob(code);
            let data = dob.match(`概念详情.${ concept }`);
            if (data) {
                result.push({
                    code: code,
                    name: v[1],
                    text: data
                });
            }
        });

        res.json(result);
    }

}