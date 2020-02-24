/**
 * Created by j on 18/6/14.
 */

import request from 'request'
import iconv from 'iconv-lite'
import _ from 'lodash'

const READY = 'ready';
const STOP = 'stop';

class Rts {

    static _codes (code) {
        let codes;
        if (Array.isArray(code)) {
            return code;
        } else {
            return code.split(',');
        }
    }

    static _prefix (code) {
        return (/^6/.test(code) ? 'sh' : 'sz') + code;
    }

    /**
     * @param option  {Object|String}
     * @param callback  {Function} 行情数据接收处理回调函数
     * @constructor
     */
    constructor (option, callback) {
        this.codes = [];
        this.url = '';
        this.state = READY;
        this.timer = null;
        this.interval = 2;
        this.qq = 'http://qt.gtimg.cn/q=*';
        this.sina = 'https://hq.sinajs.cn/list=*';
        this.stock_api = this.qq;

        this.callback = callback;

        if (typeof option == 'object') {

            Object.assign(this, option);

            if (option.apiName) {
                this.stock_api = this[option.apiName];
            }

            this.add(option.code)

        } else if (option === 'qq' || option === 'sina') {

            this.stock_api = this[option];

        } else {
            // 股票code: 单个code或者code数组
            this.add(option)

        }
    }

    query (readyState) {
        let that = this;
        let interval = this.interval;

        readyState && this._setState(READY);

        this._clearTimer();
        this._query();

        if (interval) {
            this.timer = setInterval(function () {
                that._query();
            }, 1000 * interval);
        }
    }

    _query () {
        let that = this;
        let options = {
            url: this.url,
            encoding: null
        };

        console.log('rts', this.state);

        if (this.codes.length === 0 || this.state === STOP) {
            console.log('rts state is STOP.');
            return this._clearTimer();
        }

        request(options, function (error, response, body) {
            //console.log(error, response, body, +new Date);
            if (error) {
                console.error('error:', error);
                that.callback('请求实时行情数据出现错误！');
                return that.query();
            }
            //console.log('statusCode:', response && response.statusCode);
            //console.log('body:', body);
            body = iconv.decode(body, 'GBK');
            try {
                let arr = that.parse(body);
                that.callback(arr);
            } catch (e) {
                console.error(e);
                console.info(that.url);
                console.info('body:', body);
                that.toggle();
                that.callback('解析错误，查看控制台');
            }
        });
    }

    /* qq接口:
     * qq: http://qt.gtimg.cn/q=sz000858
     * v_sz000858="51~五 粮 液~000858~83.25~84.41~84.00~240696~114844~125666~83.25~628~83.24~8~83.23~22~83.22~6~83.21~66~83.26~194~83.27~8~83.28~134~83.29~71~83.30~189~15:00:04/83.25/2580/S/21475670/9656|14:57:01/83.26/57/S/474580/9570|14:56:58/83.28/23/B/191556/9568|14:56:55/83.25/31/S/258188/9566|14:56:52/83.26/64/S/532873/9564|14:56:49/83.25/102/S/849439/9562~20180615150130~-1.16~-1.37~84.51~82.61~83.25/240696/2003984497~240696~200398~0.63~29.24~~84.51~82.61~2.25~3159.98~3231.44~5.42~92.85~75.97~0.71~134~83.27~16.25~33.40";
     * 返回数据解析:
     * 以 ~ 分割字符串中内容，下标从0开始，依次为
     * 0: 未知
 1: 名字
 2: 代码
 3: 当前价格
 4: 昨收
 5: 今开
 6: 成交量（手）
 7: 外盘
 8: 内盘
 9: 买一
10: 买一量（手）
11-18: 买二 买五
19: 卖一
20: 卖一量
21-28: 卖二 卖五
29: 最近逐笔成交
30: 时间
31: 涨跌
32: 涨跌%
33: 最高
34: 最低
35: 价格/成交量（手）/成交额
36: 成交量（手）
37: 成交额（万）
38: 换手率
39: 市盈率
40:
41: 最高
42: 最低
43: 振幅
44: 流通市值
45: 总市值
46: 市净率
47: 涨停价
48: 跌停价
————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
*/

    /* 新浪接口:
     *
     *
     * sina: http://hq.sinajs.cn/list=sh601006  （可以一次性请求多个如： https://hq.sinajs.cn/list=sh601003,sh601001）
     * var hq_str_sh601006=”大秦铁路, 27.55, 27.25, 26.91, 27.55, 26.20, 26.91, 26.92,
     22114263, 589824680, 4695, 26.91, 57590, 26.90, 14700, 26.89, 14300,
     26.88, 15100, 26.87, 3100, 26.92, 8900, 26.93, 14230, 26.94, 25150, 26.95, 15220, 26.96, 2008-01-11, 15:05:32”;
     *
新浪接口数据返回
以大秦铁路（股票代码：601006）为例，如果要获取它的最新行情，只需访问新浪的股票数据接口：
http://hq.sinajs.cn/list=sh601006
这个url会返回一串文本，例如：
var hq_str_sh601006="大秦铁路, 27.55, 27.25, 26.91, 27.55, 26.20, 26.91, 26.92,
22114263, 589824680, 4695, 26.91, 57590, 26.90, 14700, 26.89, 14300,
26.88, 15100, 26.87, 3100, 26.92, 8900, 26.93, 14230, 26.94, 25150, 26.95, 15220, 26.96, 2008-01-11, 15:05:32";
这个字符串由许多数据拼接在一起，不同含义的数据用逗号隔开了，按照程序员的思路，顺序号从0开始。
0：”大秦铁路”，股票名字；
1：”27.55″，今日开盘价；
2：”27.25″，昨日收盘价；
3：”26.91″，当前价格；
4：”27.55″，今日最高价；
5：”26.20″，今日最低价；
6：”26.91″，竞买价，即“买一”报价；
7：”26.92″，竞卖价，即“卖一”报价；
8：”22114263″，成交的股票数，由于股票交易以一百股为基本单位，所以在使用时，通常把该值除以一百；
9：”589824680″，成交金额，单位为“元”，为了一目了然，通常以“万元”为成交金额的单位，所以通常把该值除以一万；
10：”4695″，“买一”申请4695股，即47手；
11：”26.91″，“买一”报价；
12：”57590″，“买二”
13：”26.90″，“买二”
14：”14700″，“买三”
15：”26.89″，“买三”
16：”14300″，“买四”
17：”26.88″，“买四”
18：”15100″，“买五”
19：”26.87″，“买五”
20：”3100″，“卖一”申报3100股，即31手；
21：”26.92″，“卖一”报价
(22, 23), (24, 25), (26,27), (28, 29)分别为“卖二”至“卖四的情况”
30：”2008-01-11″，日期；
31：”15:05:32″，时间；
     */
    parse (str) {
        let api = this.stock_api;
        let qq = this.qq;
        let sina = this.sina;
        let arr = str.split(/;\s*/);
        arr = arr.filter(function (v) {
            return v.length;
        });
        return arr.map(function (v) {
            let arr = v.split('=');
            let code = arr[0].match(/\d{6}/)[0];
            arr = arr[1].replace('"', '').split(/[~,]/);
            if (api === qq) {
                let time = arr[30].replace(/^\d{8}/, '').replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3');
                return {
                    code: arr[2],
                    name: arr[1],
                    v: arr[6] * 1,  // 成交量
                    price: arr[9] * 1,  // 买一价
                    yesterdayPrice: arr[4] * 1,  // 昨日收盘价
                    maxPrice: arr[47] * 1,  // 涨停价
                    b1: arr[10] * 1,
                    s1: arr[20] * 1,
                    time: time,
                    increase: arr[32] * 1,
                    timestamp: +new Date
                };
            } else if (api === sina) {
                let price = arr[11];
                let yesterdayPrice = arr[2];
                let maxPrice = Math.round(yesterdayPrice * 1.1 * 100) / 100;
                let increase = (price - yesterdayPrice) / yesterdayPrice * 100;
                increase = Math.round(increase * 100) / 100;   // increase.toFixed(2);  toFixed不是四舍五入计算, 不精确.
                return {
                    code: code,
                    name: arr[0],
                    v: Math.floor(arr[8] / 100),
                    b1: Math.floor(arr[10] / 100),
                    price: arr[11],
                    maxPrice,
                    yesterdayPrice,
                    increase: increase,
                    time: arr[31],
                    timestamp: +new Date
                };
            }
        });
    }

    add (code) {
        let that = this;
        let codes = Rts._codes(code);
        codes.map(code => {
            that.codes.unshift(code);
        });
        this.codes = _.uniq(this.codes);
        this.update();
    }

    change (code) {
        this.codes = Rts._codes(code);
        this.update();
    }

    remove (code) {
        this._clearTimer();
        this.codes = _.without(this.codes, code);
        if (this.state !== STOP) {
            this.update();
        }
    }

    pause () {
        this._clearTimer();
        this._setState(STOP);
    }

    clear () {
        this.codes = [];
        this.pause();
    }

    update () {
        this._setState(READY);
        this.createUrl();
        this.query();
    }

    createUrl () {
        let codes = this.codes;
        if (!codes.length) {
            return console.log('无股票代码.');
        }
        codes = codes.map(Rts._prefix);
        codes = codes.join(',');
        this.url = this.stock_api.replace('*', codes);
    }

    toggle () {
        //this.stock_api = this.stock_api == this.qq ? this.sina : this.sina;
        //this.update();
    }

    _setState (state) {
        this.state = state;
    }

    _clearTimer () {
        clearInterval(this.timer);
    }


}

/*new Rts('601138', function(data){
 let arr = data.split('=');
 arr = arr[1].split('~');
 arr.forEach(function(v, i){
 console.log(i, '  ', v);
 });
 });*/


export default function (code, callback) {
    return new Rts(code, callback);
};
