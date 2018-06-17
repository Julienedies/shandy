/**
 * Created by j on 18/5/27.
 * @todo 接受消息，按下对应的key序列
 */

const robot = require("robotjs");

const ac = require('./ac.js');

function keyTap(keys){
    let key = keys.shift();
    console.log(key);
    let delay = 100;
    if(key){
        if(key == 'enter') delay = 300;
        setTimeout(function(){
            robot.keyTap(key);
            keyTap(keys);
        }, delay);
    }
}


module.exports = {

    active: function(){
        ac.activeTdx();
    },
    _show:{},
    show: function(code){
        let o = this._show;
        let now = + new Date;
        let last = o.last;
        if(last && now - last < 1000 * 60 * 0.5){
            return console.log('keyTap 调用限制');
        }
        if(o[code] && now - o[code] < 1000 * 60 * 2){
            return console.log('keyTap 调用限制 2');  //避免短时间不断重复
        }
        let keys = code.split('');
        keys.push('enter');
        this.active();
        o[code] = now;
        o.last = now;
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

