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

require('./index/main-ctrl.js');

require('./index/help-ctrl.js');

const view_stock = require('./index/view-stock-ctrl.js');

const rtsc = require('./index/real-time-stock-ctrl.js');

require('./index/voice-warning-ctrl.js');


// 接收主进程发来的消息
ipc.on('view_stock_info', function (event, code) {
    view_stock(code);
});

ipc.on('rts_db_monitor', function (event, stock) {
    rtsc.on_rts_db_monitor(stock);
});

ipc.on('rts_cancel', function (event, arg) {
    rtsc.on_rts_cancel(arg);
});


