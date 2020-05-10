/**
 * Created by j on 18/6/15.
 */

import electron from 'electron'

import utils from '../../../libs/utils'
import stocksManager from '../../../libs/stocks-manager.js'
import stockUrl from '../../../libs/stockUrl.js'
import tdx from '../../../libs/tdx.js'
import ac from '../../../libs/ac.js'

import _objm from '../../../libs/objm.js'
import voice from '../../../libs/voice.js'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

const objm = _objm('view_stock_info')


let stockWin;

function createWin () {
    //实际是 1480 * 820
    let win = new BrowserWindow({width: 1340, height: 820, x: 0, y: 0});
    win.on('close', function () {
        win = null;
    });
    win.webContents.openDevTools();
    win.maximize();
    win.show();
    return win;
}

function view_stock (code) {

    if (!code) return voice('不能查看个股资料，无效股票代码！');

    objm.set('code', code);
    clipboard.writeText(code);


    let flag = objm.get('is_mashup') ? 0 : 1;


    shell.openExternal(stockUrl(code, flag) + (flag === 1 ? '?self=1' : ''));
    //ac.activeTdx();

    /*    if (!objm.get('is_open')) {
            return ac.activeTdx();
        }
        if (objm.get('is_open_external')) {
            shell.openExternal(stockUrl(code, flag) + (flag === 1 ? '?self=1' : ''));
            ac.activeTdx();
        } else {
            stockWin = stockWin || createWin();
            stockWin.loadURL(stockUrl(code, 0));
            stockWin.focus();
        }*/

    setTimeout(function () {
        ac.activeTdx();
    }, 1000);

}

// 查看个股资料
brick.reg('viewStockCtrl', function (scope) {

    this.$elm.find(':checkbox').each(function () {
        objm.set(this.name, $(this).prop('checked'));
    });

    scope.set_setting = function (e) {
        objm.set(this.name, $(this).prop('checked'));
    };

    scope.viewStock = function () {
        utils.getStockNameFromScreen().then(({code}) => {
            utils.openExternal(stockUrl(code, 0))
        })
    };

    scope.go_ycj = function () {
        utils.getStockNameFromScreen().then(({code}) => {
            utils.openExternal(stockUrl(code, 7));
        });
    };

    scope.view_in_ftnn = function () {
        utils.getStockNameFromScreen().then(({code}) => {
            utils.view_in_ftnn(code);
        });
    };

    scope.addStock = function (stock) {
        stock.name && stocksManager.add(stock);
    };

});

export default view_stock
