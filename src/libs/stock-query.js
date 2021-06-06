/*!
 * 根据股票名称，查找股票代码
 * Created by j on 18/5/26.
 */

import stocksManager from './stocks-manager.js'

function trim (str) {
    return str.replace(/\s+/img, '');
}

/**
 * @param words {String} words = '天首发展000611' or '天首发展' or 'TCL 集团'
 * @returns {Object}  {code:'000002', name:'万科'} or {name:undefined, code:undefined} or {}
 */
export default function (words) {

    console.info('参数 =>', words);

    if (!words) return {};

    let stocks = stocksManager.get();

    // 简写code, 譬如002714的简写: 2714
    if (/^\d{3,}$/img.test(words)) {
        let result = stocks.filter((arr) => {
            return arr[0].endsWith(words);
        });
        result = result[0] || [];
        return {code: result[0], name: result[1]};
    }

    let code_arr = words.match(/\b\d{6}(?!\d)/);
    if (code_arr) {
        let result = stocks.filter(stock => {
            return code_arr[0] === stock[0];
        });
        result = result[0] || [];
        return {code: code_arr[0], name: result[1]};
    }

    // (?:.+)?
    let arr = words.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]*[\u4e00-\u9fa5][A]?)(\d{4,6})?/) || ['', '', ''];
    //console.info(arr);
    let name = arr[1] || words;
    let code = arr[2];

    name = trim(name);
    let r_name = new RegExp(name);

    let result = stocks.filter(stock => {
        return words === stock[1] || code === stock[0];
    });

    //console.log(result && result[0]);

    result = result.length ? result : stocks.filter(stock => {
        return name === stock[1] || stock[0] === code;
    });

    //console.log(result && result[0]);

    result = result.length ? result : stocks.filter(stock => {
        return r_name.test(stock[1]);
    });

    console.log(result && result[0]);

    let stock = result[0] || [];

    return {code: stock[0], name: stock[1]};

}

