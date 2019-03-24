/**
 * Created by j on 18/5/22.
 */

import electron from 'electron'

const {remote, shell, ipcRenderer} = electron
const {BrowserWindow} = remote

import voice from '../../../libs/voice'
import Win from '../../../libs/window'
import tdx from '../../../libs/tdx'
import stockQuery from '../../../libs/stock-query'
import captureOcr from '../../../libs/capture-ocr'
import schedule from '../../../libs/schedule'

console.log(`
We are using node ${process.versions.node}
chrome ${process.versions.chrome}
electron ${process.versions.electron}
`)

console.log('remote is =>', remote)
//const config = remote.getGlobal('config')
//const config = remote.app.config
//console.log(config)

import debugMenu from 'debug-menu'
debugMenu.install();

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import './style.scss'
import html from './index.html'
console.log(44444, html)

import './main-ctrl.js'
import './tool-bar-ctrl.js'
import view_stock from './view-stock-ctrl'
import rtsc from './real-time-stock-ctrl'


brick.bootstrap();

/////////////////////////////////////////////////////////////////////////////////////

schedule( () => {
    new Win('warn.html');
}, 8, 55);

// 接收主进程发来的消息
ipcRenderer.on('view_in_tdx', function (event, msg) {
    let code = msg.code;
    if (!/^\d{6}$/.test(code)) {
        let stock = stockQuery(code);
        code = stock.code;
    }
    code && tdx.view(code);
});

ipcRenderer.on('view_in_ftnn', function (event, msg) {
    let code = msg.code;
    if (!/^\d{6}$/.test(code)) {
        let stock = stockQuery(code);
        code = stock.code;
    }
    code && tdx.view_in_ftnn(code);
});

//
ipcRenderer.on('view_stock_info', function (event, stock) {
    if (stock.code) {
        view_stock(stock.code);
    } else {
        captureOcr(stock => {
            view_stock(stock.code);
        });
    }
});

//
ipcRenderer.on('set_stock_c', function (event, stock) {
    if (stock.code) {
        new Win({
            width: 1200,
            height: 700,
            x: 1800,
            y: 300,
            webPreferences: {
                // nodeIntegration: false  // 远程页面窗口不整合node,  避免jquery等外部类库因为require变量错判执行环境,导致加载错误.
            },
            url: `stock_c.html?code=${ stock.code }&edit=1`,
            onClose: function () {
                console.info('on close!');
                tdx.active();
            }
        })
    } else {
        captureOcr(stock => {

        });
    }
});

//
ipcRenderer.on('rts_db_monitor', function (event, stock) {
    if (stock.code) {
        rtsc.on_rts_db_monitor(stock);
    } else {
        captureOcr(stock => {
            rtsc.on_rts_db_monitor(stock);
        });
    }
});

//
ipcRenderer.on('rts_cancel', function (event, arg) {
    rtsc.on_rts_cancel(arg);
});


