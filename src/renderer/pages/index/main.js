/**
 * Created by j on 18/5/22.
 */

import electron from 'electron'

import Win from '../../../libs/window'
import tdx from '../../../libs/tdx'
import stockQuery from '../../../libs/stock-query'
import captureOcr from '../../../libs/capture-ocr'
import schedule from '../../../libs/schedule'
import voice from '../../../libs/voice'
import warnText from '../../js/warn-text'

import debugMenu from 'debug-menu'

const {remote, shell, ipcRenderer} = electron
const {BrowserWindow} = remote

debugMenu.install();

console.log(`
We are using node ${ process.versions.node }
chrome ${ process.versions.chrome }
electron ${ process.versions.electron }
`)

console.log('remote is =>', remote)
//const config = remote.getGlobal('config')
//const config = remote.app.config
//console.log(config)

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import './style.scss'
import html from './index.html'

//console.log('import html =>', html)

import './main-ctrl.js'
import './tool-bar-ctrl.js'
import view_stock from './view-stock-ctrl'
import rtsc from './real-time-stock-ctrl'

brick.bootstrap();

/////////////////////////////////////////////////////////////////////////////////////

schedule(() => {
    new Win('reminder.html');
}, 8, 55);


// --------------------------------接收主进程发来的消息 ------------------------
// 交易语音警告
ipcRenderer.on('voice_warn', (event, info) => {
    //voice(warnText.voice[info] || '')
})

// 通达信中查看该股票
ipcRenderer.on('view_in_tdx', function (event, msg) {
    let code = msg.code;
    if (!/^\d{6}$/.test(code)) {
        let stock = stockQuery(code);
        code = stock.code;
    }
    code && tdx.view(code);
});

// 富途牛牛中查看该股票
ipcRenderer.on('view_in_ftnn', function (event, msg) {
    let code = msg.code;
    if (!/^\d{6}$/.test(code)) {
        let stock = stockQuery(code);
        code = stock.code;
    }
    code && tdx.view_in_ftnn(code);
});

// 浏览器中查看该股资料
ipcRenderer.on('view_stock_info', function (event, stock) {
    if (stock.code) {
        view_stock(stock.code);
    } else {
        captureOcr(stock => {
            view_stock(stock.code);
        });
    }
});

// 打开股票内容修改窗口
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

// 打板监控
ipcRenderer.on('rts_db_monitor', function (event, stock) {
    if (stock.code) {
        rtsc.on_rts_db_monitor(stock);
    } else {
        captureOcr(stock => {
            rtsc.on_rts_db_monitor(stock);
        });
    }
});

// 取消监控
ipcRenderer.on('rts_cancel', function (event, arg) {
    rtsc.on_rts_cancel(arg);
});


