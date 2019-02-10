/**
 * Created by j on 18/6/15.
 */

import electron from 'electron'
const electronScreen = electron.screen;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

import stocksManager from '../../../libs/stocks-manager.js'
import stockUrl from '../../../libs/stockUrl.js'
import tdx from '../../../libs/tdx.js'
import ac from '../../../libs/ac.js'

import _objm from '../../../libs/objm.js'
import voice from '../../../libs/voice.js'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

const objm = _objm('view_stock_info')


let stockWin;

function createWin() {
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

function view_stock(code) {

    if (!code) return voice('不能查看个股资料，无效股票代码！');

    objm.set('code', code);
    clipboard.writeText(code);

    let flag = objm.get('is_mashup') ? 0 : 1;

    if (!objm.get('is_open')) {
        return ac.activeTdx();
    }
    if (objm.get('is_open_external')) {
        shell.openExternal(stockUrl(code, flag) + (flag === 1 ? '?self=1' : ''));
        ac.activeTdx();
    } else {
        stockWin = stockWin || createWin();
        stockWin.loadURL(stockUrl(code, 0));
        stockWin.focus();
    }

    setTimeout(function(){
        ac.activeTdx();
    }, 1000);


}

// 查看个股资料
brick.controllers.reg('view_stock_ctrl', function (scope) {

    this.$elm.find(':checkbox').each(function () {
        objm.set(this.name, $(this).prop('checked'));
    });

    scope.set_setting = function (e) {
        objm.set(this.name, $(this).prop('checked'));
    };

    scope.go_ycj = function () {
        ac.getStockName(function (stock) {
            shell.openExternal(stockUrl(stock.code, 7));
        });
    };

    scope.view_in_ftnn = function () {
        ac.getStockName(function (stock) {
            tdx.view_in_ftnn(stock.code);
        });
    };

    scope.add_stock = function (stock){
        stock.name && stocksManager.add(stock);
    };

    scope.on_mousewheel = function () {

        /*        import ioHook from 'iohook'

         console.info(ioHook);

         function callback(event){
         console.info(event);
         }

         if($(this).prop('checked')){
         ioHook.on('mousewheel', callback);
         ioHook.start();
         }else{
         ioHook.off('mousewheel', callback);

         }*/

    };

});

export default view_stock
