/**
 *  股票列表管理器
 * Created by j on 18/8/24.
 */

import path from 'path'

import jo from './jsono'
import config from './config'

const jsonPath = path.resolve(config.CSD_DIR, './stocks.json');

let stocksJo;
let id = +new Date;

function getStocksJo () {
    stocksJo = stocksJo || jo(jsonPath);
    /*    stocksJo.json.forEach((arr, i) => {
            arr[1] = arr[1].replace('Ａ', 'A')
        })
        stocksJo.save()*/
    return stocksJo;
}

export default {

    /**
     * @return {Array}
     */
    get: function () {
        console.log(id);
        stocksJo = getStocksJo();
        return stocksJo.json;
    },
    add: function (stock) {
        stocksJo = getStocksJo();
        stocksJo.json.unshift([stock.code, stock.name]);
        stocksJo.save();
    },
    refresh: function () {
        stocksJo = jo(jsonPath);
    }

}
