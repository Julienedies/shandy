/**
 * Created by j on 18/5/22.
 */

const os = require("os");
const electron = require('electron');
const remote = electron.remote;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;

const bw = require('../libs/window.js');
const screenshot = require('../libs/screenshot.js');
const baiduOcr = require('../libs/baidu-ocr.js');
const stockUrl = require('../libs/stockUrl.js');
const ac = require('../libs/ac.js');
const tdx = require('../libs/tdx.js');

// activate context menu
const debugMenu = require('debug-menu');
debugMenu.install();

const main_ctrl = require('./index/main-ctrl.js');

const view_stock = require('./index/view-stock-ctrl.js');

const rtsc = require('./index/real-time-stock-ctrl.js');

require('./index/voice-warning-ctrl.js');

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


// 接收主进程发来的按下快捷键消息
ipc.on('stock_code', function (event, arg) {
    const message = `异步消息回复: ${arg}`;
    view_stock(arg);
    rtsc.on_view_stock(arg);
});

ipc.on('real-time-stock', function (event, arg) {
    rtsc.on_real_time_stock(arg);
});

ipc.on('rts_cancel', function (event, arg) {
    rtsc.on_rts_cancel(arg);
});


try {
    let networkInterfaces = os.networkInterfaces();
    let ip = networkInterfaces.en0[0].address;
    let home_url = 'http://*:3000/'.replace('*', ip);
    console.log(home_url);
    $('#open_client').click(function () {
        shell.openExternal(home_url);
    }).text(home_url);
} catch (e) {
    console.error(e);
}

const shelljs = require('shelljs');
$('#test').click(function () {
  console.log(shelljs.which('jhandy'))
});