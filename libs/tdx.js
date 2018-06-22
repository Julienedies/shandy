/**
 * Created by j on 18/5/27.
 * @todo 通达信快捷键自动执行
 */

const robot = require("robotjs");

const ac = require('./ac.js');


function _keyTap(keys) {
    var delay = 100;
    var key = keys.shift();
    if (key) {
        //if (key == 'enter') delay = 300;
        setTimeout(function () {
            robot.keyTap(key);
            _keyTap(keys);
        }, delay);
    }

}

function keyTap(keys) {
    // 需要稍微延迟，确保通达信获得焦点
    setTimeout(function () {
        _keyTap(keys);
    }, 300);
}


module.exports = {
    datum: 30, //默认调用间隔限制为30秒
    _obj_limit:{},
    _call_limit: function(f_id, datum ){
        datum = datum || this.datum;
        let o = this._obj_limit;
        let f_o = o[f_id];
        let now = + new Date();
        if(!f_o){
            o[f_id] = {datum: datum, last: now};
            return true;
        }else{
            let reduce = now - f_o.last;
            let not_limit = reduce > 1000 * datum;
            this._limit_reduce = datum - Math.floor(reduce/1000);
            if(not_limit){
                f_o.last = now;
            }
            return not_limit;
        }
    },
    active: function () {
        ac.activeTdx();
    },
    view: function (code ){
       this.show(code);
    },
    show: function (code) {
        //需要做调用限制
        if(this._call_limit('show', 15)){
            this.active();
            let keys = code.split('');
            keys.push('enter');
            keyTap(keys);
        }else{
            //console.log(`tdx.show 调用限制,余${this._limit_reduce}秒`);
        }
    },
    cancel_order: function(){
        //需要做调用限制
        if(this._call_limit('cancel_order', 30)){
            this.active();
            keyTap(['2','2','enter']);
        }else{
            //console.log(`tdx.cancel_order 调用限制,余${this._limit_reduce}秒`);
        }
    },
    keystroke: function (str, enter) {
        str = str + '';
        this.active();
        let keys = str.split('');
        enter && keys.push('enter');
        keyTap(keys);
    }

};



