/**
 * Created by j on 18/5/22.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import fs from 'fs'
import electron from 'electron'

import config from '../../../libs/config'
import utils from '../../../libs/utils'
import Win from '../../../libs/window'
import tdx from '../../../libs/tdx'
import screenCapture from '../../../libs/screen-capture'
import stockQuery from '../../../libs/stock-query'
import captureOcr from '../../../libs/capture-ocr'
import voice from '../../../libs/voice'

import debugMenu from 'debug-menu'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import './main-ctrl.js'
import './tool-bar-ctrl.js'
import view_stock from './view-stock-ctrl'
import rtsc from './real-time-stock-ctrl'


const {remote, shell, ipcRenderer} = electron;
const {BrowserWindow} = remote;

debugMenu.install();

window.voice = voice;

console.log(`
We are using node ${ process.versions.node }
chrome ${ process.versions.chrome }
electron ${ process.versions.electron }
`);

console.log('remote is =>', remote);
//const config = remote.getGlobal('config')
//const config = remote.app.config
//console.log(config)

utils.timer('23:55', function () {
    if (window.confirm('夜晚了，是否退出？')) {
        ipcRenderer.send('quit', true);
    }
});

brick.set('ic-event.extend', 'click,change,dblclick');

brick.bootstrap();

voice('voice test.', () => {
    $.icMsg('voice test Ok.');
});

let kcAudio = new Audio(require('./audio/kc.mp3'));
//let audio = new Audio(require('./audio/不要忘记那些恐惧和痛苦.mp3'));
// setInterval( () => {
//      audio.play();
// }, 1000 * 60 * 60 * 7);


// -------------------------- 接收主进程发来的消息 ------------------------
// 通达信中查看该股票
ipcRenderer.on('view_in_tdx', function (event, msg) {
    console.log('view in tdx =>', msg);
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


// 打开股票内容修改窗口
ipcRenderer.on('set_stock_c', function (event, stock) {
    if (stock.code) {
        new Win({
            name:'stock_c',
            // width: 1200,
            // height: 800,
            // x: 2800,
            // y: 400,
            alwaysOnTop: true,
            webPreferences: {
                // nodeIntegration: false  // 远程页面窗口不整合node,  避免jquery等外部类库因为require变量错判执行环境,导致加载错误.
            },
            url: `web/stock_c.html?code=${ stock.code }&edit=1`,
            onClose: function () {
                console.info('on close!');
                //tdx.active();
            }
        })
    } else {
        console.log(`找不到${stock.code}`);
        // captureOcr(stock => {
        //
        // });
    }
});



// 浏览器中查看该股资料
ipcRenderer.on('view_stock_info', function (event, arg) {
    console.log(arg);

    if (arg.name) {
        let stock = stockQuery(arg.name);
        view_stock(stock.code);
    } else {
        console.log(`找不到${arg.name}`);
        captureOcr(stock => {
            view_stock(stock.code);
        });
    }
});



// 打板监控
ipcRenderer.on('rts_db_monitor', function (event, arg) {
    console.log(arg);

    if (arg.name) {
        let stock = stockQuery(arg.name);
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

// 截屏
ipcRenderer.on('screenCapture', function (event, arg) {

    console.log(arg);
    let stock = stockQuery(arg.name);

    screenCapture({
        returnType: 'file', dir: config.STOCK_IMG_DIR, callback: (imgPath) => {
            kcAudio.play();
            let rename = imgPath
                .replace('屏幕快照', stock.name)
                .replace('(2)', `-${ stock.name }`)
                .replace(/\.png$/, `-${ stock.code }.png`);
            fs.renameSync(imgPath, rename);
        }
    }, );
});


