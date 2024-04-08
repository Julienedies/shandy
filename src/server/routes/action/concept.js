/*!
 * Created by j on 18/11/25.
 * 股票市场概念列表
 */
import _ from 'lodash'
import pinyin from 'pinyin'
import sjo from '../../../libs/stock-jo.js'
import stocksManager from '../../../libs/stocks-manager'

const _POSTFIX = '_x';
const _POSTFIX_REG = /_x$/img;

// 根据概念名称获取对应公司列表
function getStocksForConcept (concept) {
    let stocks = stocksManager.get()
    let result = [];
    stocks.forEach(function (stock, i) {
        let code = stock[0];
        let dob = sjo(code);
        let data;
        if(_POSTFIX_REG.test(concept)){
            data = dob.match(`概念xgb.${ concept.replace(_POSTFIX,'') }`);
        }else{
            data = dob.match(`概念详情.${ concept }`);
        }
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

// 获取所有概念列表
function getAllConcept () {
    if (getAllConcept.result) return getAllConcept.result;
    let stocks = stocksManager.get();
    let result = {};
    stocks.forEach(([code, name]) => {
        let stock = sjo(code);
        let o = stock.json['概念详情'];
        let o2 = stock.json['概念xgb'];
        if (o) {
            Object.keys(o).forEach((concept) => {
                result[concept] = true;
            })
        }
        if (o2) {
            Object.keys(o2).forEach((concept) => {
                result[`${ concept }${ _POSTFIX }`] = true;
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
        return a.key.localeCompare(b.key);
    });
    getAllConcept.result = result;
    return result;
}

function getConceptByKey (key) {
    let arr = getAllConcept();
    let reg = new RegExp(key, 'img');

    return arr.filter((item, i,) => {
        if (_.isObject(item)) {
            let result = _.filter(item, function (v) {
                return reg.test(v);
            });
            return result.length;
        } else {
            return reg.test(item);
        }
    });

}

export default {

    get: function (req, res) {
        let result = [];
        let conceptName = req.params.name;
        let key = req.query.key;
        if (key) {
            result = getConceptByKey(key);
        } else {
            result = conceptName ? getStocksForConcept(conceptName) : getAllConcept();
        }

        res.json(result);
    }

}
