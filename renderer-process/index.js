/**
 * Created by j on 18/5/22.
 */

const path = require('path');

const electron = require('electron');
const electronScreen = electron.screen;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

const window = require('../libs/window.js');
const screenshot = require('../libs/screenshot.js');
const baiduOcr = require('../libs/baidu-ocr.js');
const rts = require('../libs/real-time-stock.js');
const stockUrl = require('../libs/stockUrl.js');
const ac = require('../libs/ac.js');
const schedule = require('../libs/schedule.js');

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
let rtso;
let speechSU = new SpeechSynthesisUtterance();
$('#clear').on('click', function(){
    rtso && rtso.clear();
});
$('#change').on('click', function(){
    rtso && rtso.change($stock_code.val());
});
$('#query').on('click', function(){
    rtso && rtso.query();
});
$('#add').on('click', function(){
    let code = $stock_code.val();
    if(rtso){
        rtso.add(code);
    }else{
        rtso = rts(code, function(data){
            console.log(data); // data => [{name: arr[1], b1: arr[10], p: arr[9]}]
            var item = data.shift();
            speechSU.text = item.name + ' ' + item.b1 + '手';
            speechSynthesis.speak(speechSU);
            speechSU.onend = function(){
                var item = data.shift();
                if(item){
                    speechSU.text = item.name + ' ' + item.b1 + '手';
                    speechSynthesis.speak(speechSU);
                }
            };
        });
    }
});


function showStock(code){
    if(code){
        currentCode = code;
        clipboard.writeText(code);

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
        let winCtrl = window('/voice-warning/index.html');
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
    let winCtrl = window('/voice-warning/index.html');
});