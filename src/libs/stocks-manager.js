/**
 * Created by j on 18/8/24.
 * 股票管理器
 */

import fs from 'fs'
import path from 'path'

const json_file = '../../data/csd/stocks.json';
let stocks = require('../../data/csd/stocks.json');

export default {

    /**
     * @return {Array}
     */
    get: function(){
        return stocks;
    },
    add: function(stock){
        let arr = [stock.code, stock.name];
        stocks.unshift(arr);
        let json_str = JSON.stringify(stocks);
        fs.writeFileSync(path.join(__dirname, json_file), json_str);
    }

};