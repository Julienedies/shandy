/**
 * Created by j on 18/5/22.
 */

const electron = require('electron');
const electronScreen = electron.screen;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

const bw = require('../libs/window.js');
const screenshot = require('../libs/screenshot.js');
const baiduOcr = require('../libs/baidu-ocr.js');
const rts = require('../libs/real-time-stock.js');
const stockUrl = require('../libs/stockUrl.js');
const ac = require('../libs/ac.js');
const schedule = require('../libs/schedule.js');

var voice = require('../assets/js/libs/voice.js');

let {sw, sh} = electronScreen.getPrimaryDisplay().workAreaSize;

function createWin() {
    //实际是 1480 * 820
    let win = new BrowserWindow({width: 1340, height: 820, x: 100, y: 0});
    win.on('close', function () {
        win = null
    });
    win.show();
    return win;
    //win.loadURL('http://basic.10jqka.com.cn/000001/');
}

let stockWin;

let currentCode;

let noOpen = false;
let isOpenByChrome = true;
let $openByChrome = $('#openByChrome').on('click', function(){
    isOpenByChrome = !isOpenByChrome;
});
$('#noOpen').on('click', function(){
    noOpen = !noOpen;
});

let $ycj = $('#ycj').on('click', function(e){
    ac.getStockName(function(code){
        shell.openExternal(stockUrl(code, 7));
    });
});

let $stock_code = $('#stock_code');

require('./index/real-time-stock-ctrl.js');

/*(function(scope){

    let $stock_code = $('#stock_code');
    var rtso;
    var prev_data = window.prev_data = {};
    window.rts_b = 15;
    var cc = {};
    var vv = {};

    $('#reset').on('click', function(){
        prev_data = window.prev_data = {};
        cc = {};
        vv = {};
    });
    $('#clear').on('click', function clear(){
        rtso && rtso.clear();
    });
    $('#change').on('click', function change(){
        rtso && rtso.change($stock_code.val());
    });
    $('#query').on('click', function query(){
        rtso && rtso.query();
    });
    $('#add').on('click', function(){
        let code = $stock_code.val();
        if(rtso){
            rtso.add(code);
        }else{
            rtso = rts(code, function(data){
                data.forEach(function(item){
                    console.log(item); // data => [{name: arr[1], b1: arr[10], p: arr[9]}]
                    let code = item.code;
                    let prev = prev_data[code];
                    let vx = vv[code];
                    let cx = cc[code];
                    if(!prev){
                        prev_data[code] = item;
                        cc[code] = Math.floor(item.b1 / rts_b);
                        vv[code] = Math.floor(item.v / rts_b);
                        console.log(cc[code]);
                        return;
                    }else{
                        let pb1 = prev.b1;
                        let b1 = item.b1;
                        let pv1 = prev.v;
                        let v1 = item.v;
                        console.log(pb1,b1,cx, v1,pv1,vx);
                        if(pb1 - b1 > cx || v1 - pv1 > vx){
                            let t = item.name + ' ' + item.b1 + '手';
                            voice(t);
                            prev.b1 = b1;
                        }
                    }
                });
            });
        }
    });

})();*/

function showStock(code){
    if(code){
        currentCode = code;
        clipboard.writeText(code);
        $stock_code.val(code);

        if(noOpen){
            return;
        }
        if(isOpenByChrome){
            shell.openExternal( stockUrl(code, 1) + '?self=1' );
            ac.activeTdx();
        }else{
            stockWin = stockWin || createWin();
            stockWin.loadURL(stockUrl(code, 2));
            stockWin.focus();
            ac.activeTdx();
        }
    }else{
        return console.error('没有获取到有效的股票代码！');
    }
}


function screenshotWrap (){
    screenshot({
        returnType: 'dataUrl',
        crop: {x: 2372,y: 88, width: 220,height: 42},
        callback: function(dataUrl){
            baiduOcr({
                image: dataUrl,
                callback: showStock
            });
        }
    });
}



function voiceWarning(){
    let win;
    let createWin = function () {
        let winCtrl = bw('/voice-warning/index.html');
        win = winCtrl.win;
    };
    $('#voiceWarning').on('change', function(){
            if($(this).prop('checked')){
                if(win){
                    win.focus();
                }else{
                    createWin();
                }
            }else{
                win && win.close();
            }
    });
}

voiceWarning();




/*function getStockNameTimer(){
    let timer;
    function f(){
        ac.getStockName(function(code){
            showStock(code);
        });
    }
    $('#getStockNameTimer').on('change', function(){
        if($(this).prop('checked')){
            clearInterval(timer);
            timer = setInterval(f,1000 * 15);
        }else{
            clearInterval(timer);
            stockWin && stockWin.close();
        }
    });
}

getStockNameTimer();*/

// 接收主进程发来的按下截图快捷键消息
ipc.on('stock_code', function (event, arg) {
    const message = `异步消息回复: ${arg}`;
    showStock(arg);
});




schedule.voiceWarning(function createVoiceWarningWindow(){
    let winCtrl = bw('/voice-warning/index.html');
});