/**
 * Created by j on 18/6/14.
 */

const request = require('request');
const schedule = require('node-schedule');
const iconv = require('iconv-lite');

const _ = require('underscore');

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
        let api = this.stock_api;
        if(api == 'qq' || api == 'sina'){
            this.stock_api = this[api];
        }

        this.codes = this._codes(code);
        this.createUrl();

    }else if(code == 'qq' || code == 'sina'){

        this.stock_api = this[code];
        this.callback = callback;

    }else{

        this.codes = this._codes(code);
        this.callback = callback;
        this.createUrl();

    }

}

Rts.prototype = {
    codes:[],
    url: '',
    timer: null,
    interval: 2,
    stock_api: 'http://qt.gtimg.cn/q=*',
    qq:'http://qt.gtimg.cn/q=*',
    sina: 'https://hq.sinajs.cn/list=*',
    query: function(){
        let that = this;
        let interval = this.interval;
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
        //let url = this.url;
        let options = {
            url: this.url,
            encoding : null
        };
        request(options, function (error, response, body) {
            error && console.log('error:', error);
            //console.log('statusCode:', response && response.statusCode);
            //console.log('body:', body);
            body = iconv.decode(body, 'GBK');
            let arr = that.parse(body);
            let item;
            while(item = arr.shift()){
                console.log(item);
                that.callback(item);
            }
        });
    },
    parse: function(str){
        let that = this;
        let arr = str.split(/;\s*/);
        arr = arr.filter(function(v){
            return v.length;
        });
        return arr.map(function(v){
            let arr = v.split('=');
            let code = arr[0].match(/\d{6}/)[0];
            arr = arr[1].split(/[~,]/);
            if(that.stock_api == that.qq){
                return {code: arr[2], name: arr[1], v: arr[6], b1: arr[10], p: arr[9]};
            } else if(that.stock_api == that.sina){
                return {code: code, name: arr[0], v: arr[8], b1: arr[10], p: arr[11]};
            }
        });
    },
    add: function(code){
        let codes = this._codes(code);
        this.codes = this.codes.concat(codes);
        this.codes = _.uniq(this.codes);
        this.update();
    },
    change: function(code){
        this.codes = this._codes(code);
        this.update();
    },
    update: function(){
        this.createUrl();
    },
    createUrl: function(){
        let codes = this.codes;
        if(!codes.length){
            return;
        }
        codes = codes.map(this._prefix);
        codes = codes.join(',');
        this.url = this.stock_api.replace('*', codes);
        this.query();
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
    pause: function(){
        clearInterval(this.timer);
    },
    clear: function(){
        this.codes = [];
        clearInterval(this.timer);
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
