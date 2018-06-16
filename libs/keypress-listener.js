/**
 * Created by j on 18/5/26.
 * @todo 监听系统键盘鼠标事件,发送给其它程序
 */

const ioHook = require('iohook');

const messenger = require('messenger');
const client = messenger.createSpeaker(8001);

let timer;

ioHook.on('mouseclick', event => {

    console.log(event);

    let x = event.x;
    let y = event.y;

    if(x > 2800 && x < 3000 && y > 100 && y <300){

        if(timer){
            clearTimeout(timer);
        }

        timer = setTimeout(function(){
            client.request('tdx', {msg: 'buy'}, function (data) {
                console.log(data.greetings);
            });
        },500);

    }


});


/*ioHook.on('keydown', event => {

    return console.log('keyPress-Listener', event);

    // 按下空格键
    if (event.keycode == 57) {
        client.request('tdx', {msg: 'confirm'}, function (data) {
            console.log(data.greetings);
        });
    }

    // 按下alt键
    if (event.keycode == 56) {
        client.request('tdx', {msg: 'buy'}, function (data) {
            console.log(data.greetings);
        });
    }

    // 按下ctrl键
    if (event.keycode == 29) {
        client.request('tdx', {msg: 'buy'}, function (data) {
            console.log(data.greetings);
        });
    }


    // 按下alt键
    if (event.keycode == 239) {
        client.request('tdx', {msg: 'confirm'}, function (data) {
            console.log(data.greetings);
        });
    }


});*/

// Register and start hook
ioHook.start();


