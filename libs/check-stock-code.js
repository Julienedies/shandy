/**
 * Created by j on 18/5/26.
 * @todo 根据股票名称，查找股票代码
 */

const stocks_manager = require('./stocks-manager.js');
const _ = require('underscore');

/**
 * @param words {String} words = '天首发展000611' or '天首发展'
 * @returns {Object|undefined|String}  没有找到股票代码或股票代码字符串 或者 {code:'000002', name:'万科'}
 */
module.exports = function (words) {
    let stocks = stocks_manager.get();
    let matchs = words.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]*[\u4e00-\u9fa5][A]?)(\d{4,6})?/) || ['', '', ''];
    console.log(words, matchs);
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
            break;
        }
        else if(r_name.test(_name))
        {
             _stocks_2.push(stock);
            break;
        }
    }

    let stock = _stocks[0] || _stocks_2[0] || [''];
    _code = stock[0];

    //console.log(name, _code, code);
    //return _code || code;
    return {code:stock[0], name:stock[1]};

};