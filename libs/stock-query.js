/*!
 * Created by j on 18/5/26.
 * @todo 根据股票名称，查找股票代码
 */

const stocksManager = require('./stocks-manager.js');
const _ = require('underscore');

function trim(str){
    return str.replace(/\s+/img, '');
}

/**
 * @param words {String} words = '天首发展000611' or '天首发展'
 * @returns {Object|undefined|String}  没有找到股票代码或股票代码字符串 或者 {code:'000002', name:'万科'}
 */
module.exports = function fn(words) {
    console.info(words);
    if(!words) return {};

    var stocks = stocksManager.get();
    var code_reg = /^\d{6}$/img;

    if(code_reg.test(words)){
        let result = stocks.filter(stock => {
            return words == stock[0];
        });
        result = result[0] || [];
        return {code: result[0], name: result[1]};
    }

    let arr = words.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]*[\u4e00-\u9fa5][A]?)(\d{4,6})?/) || ['', '', ''];
    console.info(arr);
    let name = arr[1] || words;
    let code = arr[2];

    name = trim(name);
    let r_name = new RegExp(name);

    let result = stocks.filter(stock => {
        return words == stock[1];
    });

    result = result.length ? result : stocks.filter(stock => {
        return name == stock[1];
    });

    result = result.length ? result : stocks.filter(stock => {
        return r_name.test( stock[1] );
    });

    let stock = result[0] || [];

    if(stock.length == 0 && code_reg.test(code)) return fn(code);

    return {code:stock[0], name:stock[1]};

};