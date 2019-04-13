/**
 * Created by j on 18/8/24.
 * 股票管理器
 */

import path from 'path'

import jo from './jsono'
import config from './config'

const jsonPath = path.resolve(config.CSD_DIR, './stocks.json')

let stocksJo

function getStocksJo () {
    stocksJo = stocksJo || jo(jsonPath)
/*    stocksJo.json.forEach((arr, i) => {
        arr[1] = arr[1].replace('Ａ', 'A')
    })
    stocksJo.save()*/
    return stocksJo
}

export default {

    /**
     * @return {Array}
     */
    get: function(){
        stocksJo = getStocksJo ()
        console.log(stocksJo.json[0])
        return stocksJo.json
    },
    add: function(stock){
        stocksJo = getStocksJo ()
        stocksJo.json.unshift([stock.code, stock.name])
        stocksJo.save()
    }

}
