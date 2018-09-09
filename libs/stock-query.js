/*!
 * Created by j on 18/5/26.
 * @todo 根据股票名称，查找股票代码
 */

const stocksManager = require('./stocks-manager.js');
const _ = require('underscore');

/**
 * @param words {String} words = '天首发展000611' or '天首发展'
 * @returns {Object|undefined|String}  没有找到股票代码或股票代码字符串 或者 {code:'000002', name:'万科'}
 */
module.exports = function (words) {
    console.log(words);
    if(!words) return {};
    let stocks = stocksManager.get();
    let arr = words.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]*[\u4e00-\u9fa5][A]?)(\d{4,6})?/) || ['', '', ''];
    console.log(arr);
    let name = arr[1] || words;
    let code = arr[2];
    let _code;

    let r_name = new RegExp(name);

    let result = stocks.filter(stock => {
        return words == stock[1];
    });

    result = result.length ? result : stocks.filter(stock => {
        return name == stock[1];
    });

    result = result.length ? result : stocks.filter(stock => {
        return r_name.test(stock[1]);
    });

    let stock = result[0] || [''];
    _code = stock[0];

    //console.log(name, _code, code);
    //return _code || code;
    return {code:stock[0], name:stock[1]};

};