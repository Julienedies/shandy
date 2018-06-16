/**
 * Created by j on 18/5/27.
 * @todo 接受消息，按下对应的key序列
 */

const robot = require("robotjs");

const ac = require('./ac.js');

function keyTap(keys){
    let key = keys.shift();
    console.log(key);
    let delay = 200;
    if(key){
        if(key == 'enter') delay = 350;
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
        let _show = this._show;
        console.log(+new Date - _show[code]);
        if(_show[code] && +new Date - _show[code] < 1000 * 60 * 2){
            return;  //避免短时间不断重复
        }
        let keys = code.split('');
        keys.push('enter');
        this.active();
        keyTap(keys);
        this._show[code] = +new Date;
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

