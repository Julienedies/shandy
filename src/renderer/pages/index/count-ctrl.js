/*!
 * Created by j on 18/12/2.
 */

import electron, { shell, clipboard } from 'electron'

const electronScreen = electron.screen;
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;

import rts from '../../../libs/real-time-stock.js'
import stocksManager from '../../../libs/stocks-manager.js'
import stockUrl from '../../../libs/stockUrl.js'
import tdx from '../../../libs/tdx.js'
import ac from '../../../libs/ac.js'

import _objm from '../../../libs/objm.js'
import voice from '../../../libs/voice.js'

import brick from '@julienedies/brick'

const objm = _objm('view_stock_info')

// 个股涨跌停价格计算
brick.reg('count_ctrl', function (scope) {

    scope.view_403 = function () {
        tdx.keystroke('.403', true);
    };

    // 涨跌停价计算
    scope.swing_10 = function () {

        ac.getStockName(function (stock) {

            rts({
                interval: false, code: stock.code, callback: function (data) {

                    console.info(data[0]);
                    let p = data[0].price * 1;
                    console.info(p);
                    let a = p + p * 0.1;
                    console.info(a);
                    a = Math.round(a * 100) / 100;
                    console.info(a);
                    let b = p - p * 0.1;
                    console.info(b);
                    b = Math.round(b * 100) / 100;
                    console.info(b);

                    console.info(`${ stock.name } => 涨停价: ${ a }; 跌停价: ${ b }`);

                }
            });

        });
    };


});


