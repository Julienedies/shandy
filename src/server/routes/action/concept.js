/*!
 * Created by j on 18/11/25.
 * 股票市场概念列表
 */
import pinyin from 'pinyin'
import sjo from '../../../libs/stock-jo.js'
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
    result = Object.keys(result).map((name) => {
        let key = pinyin(name, {
            style: pinyin.STYLE_FIRST_LETTER
        });
        key = key[0][0];
        return {name, key};
    });
    result.sort((a, b) => {
        return a.key.localeCompare(b.key)
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
