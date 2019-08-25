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

        if (this.codes.length === 0 || this.state === STOP) {
            console.log('rts state is STOP.');
            return this._clearTimer();
        }

        request(options, function (error, response, body) {
            //console.log(error, response, body, +new Date);
            if (error) {
                console.error('error:', error);
                //that.toggle();
                return that.callback('请求实时行情数据出现错误！');
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

    /*
     * qq: http://qt.gtimg.cn/q=sz000858
     * v_sz000858="51~五 粮 液~000858~83.25~84.41~84.00~240696~114844~125666~83.25~628~83.24~8~83.23~22~83.22~6~83.21~66~83.26~194~83.27~8~83.28~134~83.29~71~83.30~189~15:00:04/83.25/2580/S/21475670/9656|14:57:01/83.26/57/S/474580/9570|14:56:58/83.28/23/B/191556/9568|14:56:55/83.25/31/S/258188/9566|14:56:52/83.26/64/S/532873/9564|14:56:49/83.25/102/S/849439/9562~20180615150130~-1.16~-1.37~84.51~82.61~83.25/240696/2003984497~240696~200398~0.63~29.24~~84.51~82.61~2.25~3159.98~3231.44~5.42~92.85~75.97~0.71~134~83.27~16.25~33.40";
     *
     * sina: http://hq.sinajs.cn/list=sh601006  （可以一次性请求多个如： https://hq.sinajs.cn/list=sh601003,sh601001）
     * var hq_str_sh601006=”大秦铁路, 27.55, 27.25, 26.91, 27.55, 26.20, 26.91, 26.92,
     22114263, 589824680, 4695, 26.91, 57590, 26.90, 14700, 26.89, 14300,
     26.88, 15100, 26.87, 3100, 26.92, 8900, 26.93, 14230, 26.94, 25150, 26.95, 15220, 26.96, 2008-01-11, 15:05:32”;
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
                    v: arr[6] * 1,
                    b1: arr[10] * 1,
                    price: arr[9],
                    time: time,
                    increase: arr[32] * 1,
                    timestamp: +new Date
                };
            } else if (api === sina) {
                let price = arr[11];
                let yesterday_price = arr[2];
                let increase = (price - yesterday_price) / yesterday_price * 100;
                increase = Math.round(increase * 100) / 100;   // increase.toFixed(2);  toFixed不是四舍五入计算, 不精确.
                return {
                    code: code,
                    name: arr[0],
                    v: Math.floor(arr[8] / 100),
                    b1: Math.floor(arr[10] / 100),
                    price: arr[11],
                    time: arr[31],
                    increase: increase,
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
