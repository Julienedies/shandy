/*!
 * 提供交易行情数据
 * Created by j on 2019-03-14.
 */
import 'babel-polyfill'

import iconv from 'iconv-lite'
import request from 'request'
import csv from 'csv'
import moment from 'moment'

import jsonDb from './json-jo'

const tempDb = jsonDb('temp')

/*const stock = require('tushare').stock;
const options = {
    code: '600848',
    date: '2015-12-31'
};

stock.getTodayAll().then(({data}) => {
    console.log(data);
});

stock.getTick(options).then(({data}) => {
    console.log(data);
});*/

/*
网易财经api: 返回csv文件
http://quotes.money.163.com/service/chddata.html?code=0000001&start=19901219&end=20150911&fields=TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;VOTURNOVER;VATURNOVER
if code is 6xxxxxx, 000001 then add 0 as prefix. Otherewise, use 1 as prefix
for example 600149, it will be 0600149
000002, it will be 1000002
 */

/**
 *
 * @param opt
 * @param resolve
 * @param reject
 * @param cb
 */
function getDayBy163 (opt, resolve, reject, cb) {
    let {code, start, end} = opt
    let prefix = /^6/.test(code) ? '0' : '1'

    let url = `http://quotes.money.163.com/service/chddata.html?code=${ prefix + code }&start=${ start }&end=${ end }&fields=TOPEN;TCLOSE;LOW;HIGH;VOTURNOVER;LCLOSE;CHG;PCHG;VATURNOVER`

    console.log('getDayBy163 =>', url)

    return request.get({url, encoding: null}, (err, res, body) => {
        if (err) return reject(err)
        body = iconv.decode(body, 'GBK');
        csv.parse(body, {}, (err, data) => {
            if (err) return reject(err)
            cb(data)
            resolve(data)
        });
    });
}

/**
 * getDayByTushare
 * @param opt
 * @param reslove
 * @param reject
 * @param cb
 *  "params": {"ts_code": "600570.SH", "start_date": "20190224", "end_date": "20190314"}
 */
function getDayByTushare (opt, reslove, reject, cb) {
    let {code, start, end} = opt
    code = `${ code }.${ /^6/.test(code) ? 'SH' : 'SZ' }`
    request.post({
        url: 'http://api.tushare.pro',
        body: JSON.stringify({
            "api_name": "daily",
            "token": "067808f36dceef6c992fd17edab59fa379af09ea71cb7f40f6c1dca9",
            "params": {"ts_code": `"${ code }"`, "start_date": `"${ start }"`, "end_date": `"${ end }"`}
        })
    }, (err, res, body) => {
        if (err) return reject(err)
        console.log(body)
        cb(body)
        resolve(body)
    })
}

/**
 * 获取日K数据
 * @param opt {Object} details:
 *          {
 *               code: {String} 股票代码，6位数字代码
 *                ktype: {String} 数据类型，day=日k线 week=周 month=月 5=5分钟 15=15分钟 30=30分钟 60=60分钟，默认为day
 *                start: {String} 开始日期，格式YYYY-MM-DD
 *                end: {String} 结束日期，格式YYYY-MM-DD
 *                autype: {String} 复权，默认前复权(fq), 不复权(last)
 *           }
 * @param f {Function}
 * @returns {Promise<any>}
 */
function getDay (opt, f) {
    let {code, day} = opt
    let start = moment(day).subtract(130, 'days').format('YYYYMMDD')
    let end = moment(day).add(10, 'days').format('YYYYMMDD')

    let name = `day-${ code }-${ start }-${ end }`
    let tempJo = tempDb(name, [])
    let json = tempJo.get()
    let cb = (data) => {
        // 缓存数据
        tempJo.set(data)
        tempJo.save()
    }

    return new Promise((resolve, reject) => {
        // 如果已经缓存, 返回缓存数据
        if (json.length) {
            return resolve(json)
        }
        return f({code, start, end}, resolve, reject, cb)
    });

}

export default {
    async getDay (opt) {
        return getDay(opt, getDayBy163)
    },
    async getDayBy163 (opt) {
        return getDay(opt, getDayBy163)
    },
    async getDayByTushare (opt) {
        return getDay(opt, getDayByTushare)
    },
    async getTick (opt) {
        return getTickByQq(opt)
    }
}


/*
腾讯股票接口：
分时图
http://data.gtimg.cn/flashdata/hushen/minute/sz000001.js?maxage=110&0.28163905744440854
五天分时图
http://data.gtimg.cn/flashdata/hushen/4day/sz/sz000002.js?maxage=43200&visitDstTime=1
日k
http://data.gtimg.cn/flashdata/hushen/latest/daily/sz000002.js?maxage=43201&visitDstTime=1
 */

function getTickByQq (opt) {
    let {code, day} = opt
    let url = `http://data.gtimg.cn/flashdata/hushen/minute/${ /^6/.test(code) ? 'sh' : 'sz' }${ code }.js`

    let name = `tick-${ code }-${ day || '20190315' }`
    let tempJo = tempDb(name, [])
    let json = tempJo.get()
    let cb = (data) => {
        // 缓存数据
        tempJo.set(data)
        tempJo.save()
    }

    return new Promise((resolve, reject) => {

        if (json.length) {
            return resolve(json)
        }

        request.get({url}, (err, res, data) => {
            if (err) return reject(err)
            //console.log(data, typeof data)
            let arr = data.match(/^\d{4}[.\d\s]+/img)
            arr = arr.map((v, i) => {
                let arr = v.split(/\s+/)
                return arr.map((v, i) => {
                    return i ? v * 1 : v;
                })
            })
            cb(arr)
            resolve(arr)
        });
    });
}
