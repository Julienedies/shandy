/**
 * Created by j on 18/5/27.
 * @todo 接受消息，按下对应的key序列
 */

const robot = require("robotjs");

const ac = require('./ac.js');


function keyTap(keys) {
    var delay = 200;
    var key = keys.shift();
    console.log(key);
    if (key) {
        //if (key == 'enter') delay = 300;
        // 需要稍微延迟，确保通达信获得焦点
        setTimeout(function () {
            robot.keyTap(key);
            keyTap(keys);
        }, delay);
    }
    return 1;
}


module.exports = {
    _datum: 1, //默认调用间隔限制为60秒
    _obj_limit:{},
    _call_limit: function(f_id, datum ){
        datum = datum || this._datum;
        let o = this._obj_limit;
        let f_o = o[f_id];
        let now = + new Date();
        if(!f_o){
            o[f_id] = {datum: datum, last: now};
            return true;
        }else{
            let last = f_o.last;
            return (now - last) > 1000 * 60 * datum;
        }
    },
    active: function () {
        ac.activeTdx();
    },
    _show: {},
    show: function (code) {
        code = code + '';
        this.active();
        let datum = this._datum;
        let o = this._show;
        let now = +new Date;
        let last = o.last;
        if (last && now - last < 1000 * 60 * datum/2) {
            return console.log('keyTap 调用限制');
        }
        if (o[code] && now - o[code] < 1000 * 60 * datum/2 ) {
            return console.log('keyTap 调用限制 2');  //避免短时间不断重复
        }
        let keys = code.split('');
        keys.push('enter');
        o[code] = now;
        o.last = now;
        keyTap(keys);
    },
    _cancel_order: {},
    cancel_order: function(){
        //需要做调用限制
        if(this._call_limit('cancel_order', 1)){
            this.active();
            keyTap(['2','2','enter']);
        }else{
            console.log('tdx.cancel_order 调用限制');
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


/*module.exports = function(msg){

 if(Array.isArray(msg)){
 return keyTap(msg);
 }

 if(msg == 'buy'){

 //keyTap(['2', '1', 'enter']);
 keyTap(['.','+', '.', 'enter']);

 //robot.keyTap("2");
 //robot.keyTap("1");
 //robot.keyTap("enter");

 }else if(msg == 'cancel'){

 keyTap(['esc']);

 }else if(msg == 'confirm'){

 keyTap(['enter']);

 }


 };*/

