/*!
 * Created by j on 2019-03-16.
 */

import path from 'path'
import fse from 'fs-extra'
import request from 'request'
import moment from 'moment'

import config from './config'

async function main(){
// 生成分时序列 ['09:36:00', '09:36:00']




}

/**
 * http://quotes.money.163.com/service/zhubi_ajax.html?symbol=002230&end=09%3A36%3A00
 * symbol: 002230
 * end: 09:36:00
 */
function download(url){
    request.get(url).pipe()
}



export default main