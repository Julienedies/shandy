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

    active: function () {
        ac.activeTdx();
    },
    _show: {},
    _limit: 1,
    show: function (code) {
        code = code + '';
        this.active();
        let limit = this._limit;
        let o = this._show;
        let now = +new Date;
        let last = o.last;
        if (last && now - last < 1000 * 60 * (limit / 2)) {
            return console.log('keyTap 调用限制');
        }
        if (o[code] && now - o[code] < 1000 * 60 * (limit * 2)) {
            return console.log('keyTap 调用限制 2');  //避免短时间不断重复
        }
        let keys = code.split('');
        keys.push('enter');
        o[code] = now;
        o.last = now;
        keyTap(keys);
    },
    cancel_order: function(){
        this.active();
        keyTap(['2','2','enter']);
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

