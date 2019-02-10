/**
 * Created by j on 18/8/24.
 * 股票管理器
 */

const fs = require('fs');
const path = require('path');

const json_file = '../../data/csd/stocks.json';
var stocks = require('../../data/csd/stocks.json');

module.exports = {

    get: function(){
        return stocks;
    },
    add: function(stock){
        var arr = [stock.code, stock.name];
        stocks.unshift(arr);
        let json_str = JSON.stringify(stocks);
        fs.writeFileSync(path.join(__dirname, json_file), json_str);
    }

};