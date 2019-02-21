/**
 * Created by j on 18/5/22.
 */

//import '../../css/vendor/photon/css/photon.css'

import electron from 'electron'

const {remote, shell, ipcRenderer} = electron
const {BrowserWindow} = remote

import voice from '../../../libs/voice'
import bw from '../../../util/window'
import tdx from '../../../libs/tdx'
import stockQuery from '../../../libs/stock-query'
import captureOcr from '../../../libs/capture-ocr'

console.log(remote)
//const config = remote.getGlobal('config')
//const config = remote.app.config
//console.log(config)

import debugMenu from 'debug-menu'
debugMenu.install();

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import './style.scss'

import './main-ctrl.js'
import './help-ctrl.js'
import './voice-warning-ctrl.js'
import './count-ctrl.js'
import view_stock from './view-stock-ctrl'
import rtsc from './real-time-stock-ctrl'

voice('初始化.')

console.log(`
We are using node ${process.versions.node}
chrome ${process.versions.chrome}
electron ${process.versions.electron}
`)



brick.bootstrap();

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
        bw({
            width: 1200,
            height: 700,
            x: 1800,
            y: 300,
            webPreferences: {
                nodeIntegration: false  // 远程页面窗口不整合node,  避免jquery等外部类库因为require变量错判执行环境,导致加载错误.
            },
            url: `http://localhost:2018/public/static/html/stock/c/index.html?code=${ stock.code }&edit=1`,
            on_close: function () {
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


