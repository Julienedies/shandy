/*!
 * Created by j on 18/11/25.
 * 股票市场概念列表
 */

import sjo from '../../../libs/sjo.js'
import stocksManager from '../../../libs/stocks-manager'

function getStocksForConcept (concept) {
    let stocks = stocksManager.get()
    let result = [];
    stocks.forEach(function (stock, i) {
        let code = stock[0];
        let dob = sjo(code);
        let data = dob.match(`概念详情.${ concept }`);
        if (data) {
            result.push({
                code: code,
                name: stock[1],
                text: data
            });
        }
    });
    return result;
}

function getAllConcept () {
    if (getAllConcept.result) return getAllConcept.result;
    let stocks = stocksManager.get()
    let result = {};
    stocks.forEach(([code, name]) => {
        let stock = sjo(code);
        let o = stock.json['概念详情'];
        if (o) {
            Object.keys(o).forEach((concept) => {
                result[concept] = true;
            })
        }
    });
    getAllConcept.result = result;
    return result;
}

export default {

    get: function (req, res) {
        let conceptName = req.params.name;
        let result = conceptName ? getStocksForConcept(conceptName) : getAllConcept();
        res.json(result);
    }

}
