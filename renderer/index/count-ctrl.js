/*!
 * Created by j on 18/12/2.
 */

const electron = require('electron');
const electronScreen = electron.screen;
const shell = electron.shell;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;

const rts = require('../../libs/real-time-stock.js');
const stocksManager = require('../../libs/stocks-manager.js');
const stockUrl = require('../../libs/stockUrl.js');
const tdx = require('../../libs/tdx.js');
const ac = require('../../libs/ac.js');

const objm = require('../../libs/objm.js')('view_stock_info');
const voice = require('../../js/libs/voice.js');


// 查看个股资料
brick.controllers.reg('count_ctrl', function (scope) {

    scope.view_403 = function(){
        tdx.keystroke('.403', true);
    };

    // 涨跌停价计算
    scope.swing_10 = function(){

        ac.getStockName(function (stock) {

            rts({
                interval: false, code: stock.code, callback: function (data) {

                    console.info(data[0]);
                    let p = data[0].price * 1; console.info(p);
                    let a = p + p * 0.1;  console.info(a);
                    a = Math.round(a * 100) / 100;  console.info(a);
                    let b = p - p * 0.1; console.info(b);
                    b = Math.round(b * 100) / 100; console.info(b);

                    console.info(`${stock.name} => 涨停价: ${a}; 跌停价: ${b}`);

                }
            });

        });
    };


});


module.exports = function(){

};