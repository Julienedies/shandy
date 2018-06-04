/**
 * Created by j on 18/5/22.
 */

const electron = require('electron');
const electronScreen = electron.screen;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

const path = require('path');

const screenshot = require('../libs/screenshot.js');
const baiduOcr = require('../libs/baidu-ocr.js');
const checkStockCode = require('../libs/check-stock-code.js');
const ac = require('../libs/ac.js');
const stockUrl = require('../libs/stockUrl.js');

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
let isOpenByChrome = false;
let domCanvas = document.getElementById('canvas');
let $openByChrome = $('#openByChrome').on('click', function(){
    isOpenByChrome = !isOpenByChrome;
});
$('#noOpen').on('click', function(){
    noOpen = !noOpen;
});

let $ycj = $('#ycj').on('click', function(e){
    shell.openExternal(stockUrl(currentCode, 7));
});

function drawImage(dataUrl){
    var ctx = domCanvas.getContext("2d");
    var image = new Image();
    image.onload = function() {
        ctx.drawImage(image, 0, 0);
    };
    image.src = dataUrl;
}

function showStock(words){
    let code =  checkStockCode(words);
    if(code == currentCode) {
        return;
    }
    if(code){
        clipboard.writeText(code);
        if(noOpen){
            return;
        }
        if(isOpenByChrome){
            shell.openExternal(stockUrl(code, 1));
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

// 接收主进程发来的按下截图快捷键消息
ipc.on('stock_code', function (event, arg) {
    const message = `异步消息回复: ${arg}`;
    showStock(arg);
});


$('#test').on('click', function(){

});


function voiceWarning(){
    let win;
    let createWin = function () {
        win = new BrowserWindow({width: 1240, height: 820, x: 200, y: 0});
        win.on('close', function () { win = null;});
        win.loadURL(path.join('file://', __dirname, '/voice-warning/index.html'));
        win.webContents.openDevTools();
        win.show();
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

function getStockNameTimer(){
    let timer;
    function f(){
        ac.getStockName(function(result){
            showStock(result);
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

getStockNameTimer();