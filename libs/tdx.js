/**
 * Created by j on 18/5/27.
 * @todo 接受消息，按下对应的key序列
 */

const robot = require("robotjs");

function keyTap(keys){
    let key = keys.shift();
    console.log(key);
    if(key){
        robot.keyTap(key);
        //setTimeout(function(){
            keyTap(keys);
        //}, 300);
    }

}

module.exports = function(msg){

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


};

