/**
 * Created by j on 18/5/26.
 * @todo 根据股票名称，查找股票代码
 */

const stocks = require('../stocks.json');
const _ = require('underscore');

/**
 * @param words {String} words = '天首发展000611' or '天首发展'
 * @returns {undefined|string}  没有找到股票代码或股票代码字符串
 */
module.exports = function (words) {
    let matchs = words.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]+[\u4e00-\u9fa5][A]?)(\d{4,6})?/) || ['', '', ''];
    console.log( matchs);
    let name = matchs[1];
    let code = matchs[2];
    let _code;

    if (name) {

        let _stocks = [];
        let _stocks_2 = [];
        for(let i in stocks){
            let stock = stocks[i];
            let _name = stock[1];
            if(name == _name){
                _stocks.push(stock);
                break;
            }else{
                let r = new RegExp(name);
                //r.test(_name) && console.log(r,_name, r.test(_name))
                r.test(_name) && _stocks_2.push(stock);
            }
        }

        let stock = _stocks[0] || _stocks_2[0] || [''];
        _code = stock[0];

    }
    //console.log(name, _code, code);
    return _code || code;

};