/**
 * Created by j on 18/6/14.
 */

const request = require('request');
const schedule = require('node-schedule');
const iconv = require('iconv-lite');

module.exports = function(code, callback){
    return new Rts(code, callback);
};

function Rts(code, callback){
    let _opt = {};
    if(typeof code == 'object'){
        let opt = code;
        Object.assign(this, _opt, opt);
        code = opt.code;
        callback = this.callback;
    }
    this.codes = this._codes(code);
    this.callback = callback;
    this.createUrl();
    this.query();
}

Rts.prototype = {
    codes:[],
    url: '',
    timer: null,
    interval: 2,
    stock_api: 'http://qt.gtimg.cn/q=*',
    _qq:'http://qt.gtimg.cn/q=*',
    _sina: 'http://hq.sinajs.cn/list=*',
    query: function(){
        let that = this;
        let interval = this.interval;
        console.log(this.codes);
        clearInterval(this.timer);
        if(interval){
            this.timer = setInterval(function(){
                that._query();
            }, 1000 * interval);
        }else{
            this._query();
        }
    },
    _query: function(){
        var that = this;
        let url = this.url;
        console.log(this.url);
        if(this.url == this.stock_api){
            console.err('没有有效的股票代码可用');
            return clearInterval(this.timer);
        }
        let options = {
            url: url,
            encoding : null
        };
        request(options, function (error, response, body) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            //console.log('body:', body);
            body = iconv.decode(body, 'GBK');
            let obj = that.parse(body);
            that.callback(obj);
        });
    },
    add: function(code){
        let codes = this._codes(code);
        this.codes = this.codes.concat(codes);
        this.update();
    },
    change: function(code){
        this.codes = this._codes(code);
        this.update();
    },
    update: function(){
        this.createUrl();
        this.query();
    },
    parse: function(str){
        let arr = str.split(/;\s*/);
        arr = arr.filter(function(v){
            return v.length;
        });
        console.log(arr);
        return arr.map(function(v){
            let arr = v.split('=');
            arr = arr[1].split('~');
            console.log(arr);
            return {name: arr[1], b1: arr[10], p: arr[9]};
        });
    },
    createUrl: function(){
        let codes = this.codes;
        codes = codes.map(this._prefix);
        codes = codes.join(',');
        this.url = this.stock_api.replace('*', codes);
    },
    _codes: function(code){
        let codes;
        if(Array.isArray(code)){
            return code;
        }else{
            return code.split(',');
        }
    },
    _prefix: function(code){
        return (/^6/.test(code) ? 'sh' : 'sz') + code;
    },
    clear: function(){
        clearInterval(this.interval);
    },
    config: function(conf){
    },
    callback: function(data){
        let arr = data.split('=');
        arr = arr[1].split('~');
        console.log(data);
    }
};

/*new Rts('601138', function(data){
    let arr = data.split('=');
    arr = arr[1].split('~');
    arr.forEach(function(v, i){
        console.log(i, '  ', v);
    });
});*/
