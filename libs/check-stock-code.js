/**
 * Created by j on 18/5/26.
 * @todo 根据股票名称，查找股票代码
 */

const stocks = require('../data/stocks.json');
const _ = require('underscore');

/**
 * @param words {String} words = '天首发展000611' or '天首发展'
 * @returns {undefined|string}  没有找到股票代码或股票代码字符串
 */
module.exports = function (words) {
    let matchs = words.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]*[\u4e00-\u9fa5][A]?)(\d{4,6})?/) || ['', '', ''];
    console.log(matchs);
    let name = matchs[1] || words;
    let code = matchs[2];
    let _code;

    let r_name = new RegExp(name);
    let _stocks = [];
    let _stocks_2 = [];
    for (let i in stocks) {
        let stock = stocks[i];
        let _name = stock[1];
        if (name == _name || words == _name) {  // 股票名称完全匹配  或者   股票名称部分匹配
            _stocks.push(stock);
        }
        else
        {
            r_name.test(_name) && _stocks_2.push(stock);
        }
    }

    let stock = _stocks[0] || _stocks_2[0] || [''];
    _code = stock[0];

    //console.log(name, _code, code);
    return _code || code;

};