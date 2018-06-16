/**
 * Created by j on 18/6/15.
 */

const electron = require('electron');
const electronScreen = electron.screen;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

const stockUrl = require('../../libs/stockUrl.js');
const ac = require('../../libs/ac.js');
const schedule = require('../../libs/schedule.js');

const objm = require('../../libs/objm.js')('view_stock_info');
const voice = require('../../js/libs/voice.js');

let stockWin;

function createWin() {
    //实际是 1480 * 820
    let win = new BrowserWindow({width: 1340, height: 820, x: 100, y: 0});
    win.on('close', function () {
        win = null;
    });
    win.show();
    return win;
}

function showStock(code){

    if(code){

        objm.set('code', code);
        clipboard.writeText(code);

        if(!objm.get('open')){
            return ac.activeTdx();
        }
        if(objm.get('open_external')){
            shell.openExternal( stockUrl(code, 1) + '?self=1' );
        }else{
            stockWin = stockWin || createWin();
            stockWin.loadURL(stockUrl(code, 2));
            stockWin.focus();
        }

        ac.activeTdx();

    }else{
        let msg = '不能查看个股资料，没有获取到有效的股票代码！';
        voice(msg);
        return console.error(msg);
    }
}


// 查看个股资料
brick.controllers.reg('view_stock_ctrl', function(scope){

    let $open = $('#open');
    let $open_external = $('#open_external');

    objm.set('open_external', $open_external.prop('checked'));
    objm.set('open', $open.prop('checked'));

    $open_external.on('click', function(){
        objm.set('open_external', $(this).prop('checked'));
    });
    $open.on('click', function(){
        objm.set('open', $(this).prop('checked'));
    });

    scope.go_ycj = function(){
        ac.getStockName(function(code){
            shell.openExternal(stockUrl(code, 7));
        });
    };

});


module.exports = showStock;