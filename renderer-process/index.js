/**
 * Created by j on 18/5/22.
 */

const electron = require('electron');
const electronScreen = electron.screen;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

const screenshot = require('../libs/screenshot.js');
const baiduOcr = require('../libs/baidu-ocr.js');
const checkStockCode = require('../libs/check-stock-code');
//const tdx = require('../libs/tdx.js');

let {sw, sh} = electronScreen.getPrimaryDisplay().workAreaSize;

// 实际是 1480 * 820
let win = new BrowserWindow({ width: 1340, height:820, x: 100, y:0 });
win.on('close', function () { win = null });
win.loadURL('http://basic.10jqka.com.cn/000001/');
win.show();

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

let get_ycj_url = function(){
    let prefix_code = (/^6/.test(currentCode) ? 'sh' : 'sz') + currentCode;
    return 'http://www.yuncaijing.com/quote/*.html'.replace('*', prefix_code);
};


let $ycj = $('#ycj').on('click', function(e){
    shell.openExternal(get_ycj_url());
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
    let code = currentCode = checkStockCode(words);
    let ths_url = 'http://basic.10jqka.com.cn/*/'.replace('*', code );
    clipboard.writeText(code);
    if(noOpen){
        return;
    }
    if(isOpenByChrome){
        $ycj.click();
        //shell.openExternal(ths_url);
    }else{
        win.loadURL(ths_url);
        win.focus();
        setTimeout(function(){
            win.loadURL('http://basic.10jqka.com.cn/*/company.html'.replace('*', code));
        },15 * 1000);
    }
}


function screenshotWrap (){
    screenshot({
        returnType: 'dataUrl',
        crop: {x: 2372,y: 88, width: 220,height: 42},
        callback: function(dataUrl){
            drawImage(dataUrl);
            baiduOcr({
                image: dataUrl,
                callback: showStock
            });
        }
    });
}


// 接收主进程发来的按下截图快捷键消息
ipc.on('stock_code', function (event, arg) {
    console.log(arg);
    const message = `异步消息回复: ${arg}`;
    let words = '通达信金融终端V7.38 - [组合图-天首发展]'.replace('通达信金融终端V7.38 - [组合图-', '').replace(']','');
    showStock(words);
});


$('#test').on('click', function(){

/*    setTimeout(function(){
        tdx(['.','+','.','enter']);
        //tdx(['2', '1', 'enter']);
        console.log(new Date);
    },3000);*/


});


