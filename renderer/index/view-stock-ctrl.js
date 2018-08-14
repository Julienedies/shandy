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
    let win = new BrowserWindow({width: 1340, height: 820, x: 0, y: 0});
    win.on('close', function () {
        win = null;
    });
    win.webContents.openDevTools();
    win.maximize();
    win.show();
    return win;
}

function view_stock(code){

    if(code){

        objm.set('code', code);
        clipboard.writeText(code);

        let flag = objm.get('is_mashup') ? 0 : 1;

        if(!objm.get('is_open')){
            return ac.activeTdx();
        }
        if(objm.get('is_open_external')){
            shell.openExternal( stockUrl(code, flag) + (flag == 1 ? '?self=1':'') );
        }else{
            stockWin = stockWin || createWin();
            stockWin.loadURL(stockUrl(code, 0));
            stockWin.focus();
        }

        ac.activeTdx();

    }else{
        let msg = '不能查看个股资料，无效股票代码！';
        voice(msg);
        return console.error(msg);
    }
}


// 查看个股资料
brick.controllers.reg('view_stock_ctrl', function(scope){

    $(':checkbox').each(function(){
        let name = this.name;
        objm.set(name, $(this).prop('checked'));
    });

    scope.set_setting = function(e){
        objm.set(this.name, $(this).prop('checked'));
    };

    scope.go_ycj = function(){
        ac.getStockName(function(code){
            shell.openExternal(stockUrl(code, 7));
        });
    };

    scope.on_mousewheel = function(){

/*        const ioHook = require('iohook');

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


module.exports = view_stock;