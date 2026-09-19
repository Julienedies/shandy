/**
 *  股票列表管理器
 * Created by j on 18/8/24.
 */

import path from 'path'

import jo from './jsono'
import config from './config'

const jsonPath = path.resolve(config.CSD_DIR, './stocks.json');

let stocksJo;
// [新增] 是否已经接入进程间通知(每个进程只处理一次)
let ipcReady = false;
// [删除] let id = +new Date;  ——  它只用于 get() 里那句每次调用都会执行的 console.log(id)

/* ===================================== [新增] 开始: stocks.json 变更通知 ===================================== */
// [新增] 重新从磁盘读取 stocks.json
function loadFromFile () {
    stocksJo = jo(jsonPath);
    return stocksJo;
}

/*
 * [新增] 惰性接入进程间通知(每个进程只执行一次, 调用方无需关心):
 * 渲染进程写完 stocks.json 后通知主进程, 主进程再广播给各个渲染窗口;
 * 这样任意一个窗口"添加股票"后, 其它进程(主进程的截屏命名 / 其它窗口)无需重启即可读到最新数据;
 * 缓存为空时的第一次读取一定会读盘, 所以不存在"通知比监听先到"而漏掉数据的问题;
 * web server 模式(纯 node)没有 ipc, 只能等进程重启后重新读盘.
 */
function ensureIpc () {
    if (ipcReady) return;
    ipcReady = true;

    let electron;
    try {
        electron = require('electron');
    } catch (e) {
        return;
    }

    if (process.type === 'renderer') {
        // [新增] 收到主进程的广播后, 重新读取文件
        electron.ipcRenderer.on('stocks_changed', function () {
            loadFromFile();
        });
    } else if (process.type === 'browser') {
        // [新增] 收到任一渲染进程的通知后, 重读文件并广播给所有窗口
        electron.ipcMain.on('stocks_changed', function () {
            loadFromFile();
            electron.BrowserWindow.getAllWindows().forEach(function (win) {
                win.webContents.send('stocks_changed');
            });
        });
    }
}

// [新增] stocks.json 已变更, 通知其它进程
function notifyChange () {
    ensureIpc();
    if (process.type !== 'renderer') return;
    try {
        require('electron').ipcRenderer.send('stocks_changed');
    } catch (e) {
        console.log('stocks-manager: 通知主进程刷新股票列表失败. =>', e);
    }
}
/* ===================================== [新增] 结束 ===================================== */

function getStocksJo () {
    ensureIpc();  // [新增] 让每个读过股票列表的进程都能收到其它进程发出的刷新通知
    stocksJo = stocksJo || jo(jsonPath);
    /*    stocksJo.json.forEach((arr, i) => {
            arr[1] = arr[1].replace('Ａ', 'A')
        })
        stocksJo.save()*/
    return stocksJo;
}

export default {

    /**
     * @return {Array}
     */
    get: function () {
        // [删除] console.log(id);  ——  高频调用时是无效开销(实测比一次文件 stat 还贵)
        stocksJo = getStocksJo();
        return stocksJo.json;
    },
    /**
     * 添加股票
     * @param stock {Object} {code:'000001', name:'平安银行'}
     * @return {Array} 添加后的股票列表
     */
    add: function (stock) {
        // [新增] 名称为空就不写盘(避免 stocks.json 里出现 [code, null]); code 去掉两端空白, 避免 stock-query 精确匹配失配
        if (!stock || !stock.name) return;
        stock.code = `${ stock.code || '' }`.trim();
        stocksJo = loadFromFile();  // [修改] 原为 getStocksJo(): 写盘前先读磁盘最新内容, 避免覆盖其它进程刚刚添加的股票
        stocksJo.json.unshift([stock.code, stock.name]);
        stocksJo.save();
        notifyChange();             // [新增] 通知主进程(截屏命名方)及其它窗口刷新缓存
        return stocksJo.json;       // [新增] 返回添加后的股票列表(原来返回 undefined)
    },
    /**
     * 重新读取 stocks.json
     * @return {Array} 磁盘上最新的股票列表(原来返回 undefined)
     */
    refresh: function () {
        loadFromFile();             // [修改] 原为 stocksJo = jo(jsonPath);
        notifyChange();             // [新增] 通知主进程及其它窗口刷新缓存
        return stocksJo.json;       // [新增] 返回磁盘上最新的股票列表
    }

}
