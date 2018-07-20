/**
 * Created by j on 18/5/22.
 */

const electron = require('electron');
const remote = electron.remote;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;

const screenshot = require('../libs/screenshot.js');
const baiduOcr = require('../libs/baidu-ocr.js');
const stockUrl = require('../libs/stockUrl.js');
const bw = require('../libs/window.js');
const ac = require('../libs/ac.js');
const tdx = require('../libs/tdx.js');

const voice = require('../js/libs/voice.js');

// activate context menu
const debugMenu = require('debug-menu');
debugMenu.install();

console.log(`mainWindow start at ${(new Date).toLocaleString()}`);
voice('初始化.');

const main_ctrl = require('./index/main-ctrl.js');

const view_stock = require('./index/view-stock-ctrl.js');

const rtsc = require('./index/real-time-stock-ctrl.js');

require('./index/voice-warning-ctrl.js');


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


