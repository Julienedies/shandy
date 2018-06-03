/**
 * Created by j on 18/5/26.
 * @todo 接收字符串参数
 */

const stocks = require('../stocks.json');

// words = '天首发展000611' or '天首发展'
module.exports = function (words) {

    let matchs = words.match(/([\u4e00-\u9fa5]+[A]?)(\d{4,6})?/) || ['', '', ''];
    console.log(matchs);
    let name = matchs[1];
    let code = matchs[2];
    let _code;

    if (name) {

        let _stocks = stocks.filter(function (stock) {
            return stock[1] == name;
        });
        let stock = _stocks[0] || [''];
        _code = stock[0];

    }
    console.log(name, _code, code);
    return _code || code;

};