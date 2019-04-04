/**
 * Created by j on 18/8/24.
 * 股票管理器
 */

import path from 'path'

import jo from './jsono'
import config from './config'

const jsonPath = path.resolve(config.CSD_DIR, './stocks.json')

let stocksJo

export default {

    /**
     * @return {Array}
     */
    get: function(){
        stocksJo = stocksJo || jo(jsonPath)
        console.log(stocksJo.json[0])
        return stocksJo.json
    },
    add: function(stock){
        stocksJo = stocksJo || jo(jsonPath)
        stocksJo.json.unshift([stock.code, stock.name])
        stocksJo.save()
    }

}
