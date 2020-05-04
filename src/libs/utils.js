/*!
 * Created by j on 2019-02-28.
 */

import os from 'os'
import electron from 'electron'

import pinyin from 'pinyin'
import schedule from 'node-schedule'
import fse from 'fs-extra'
import moment from 'moment'
import shellJs from 'shelljs'
import jhandy from 'jhandy'

import Win from './window'
import setting from './setting'
import tdx from './tdx'
import ac from './ac'
import captureOcr from './capture-ocr'
import stocksManager from './stocks-manager'

const {remote, shell} = electron;
const dialog = remote.dialog;

// https://github.com/shelljs/shelljs/issues/480
let nodePath = (shellJs.which('node').toString());
shellJs.config.execPath = nodePath;
// https://github.com/shelljs/shelljs/issues/480

export default {
    preview (file) {
        shellJs.exec(`open -a Preview "${ file }"`);
    },
    showItemInFolder (filePath) {
        shell.showItemInFolder(filePath);
    },
    open (option) {
        return new Win(option);
    },
    openItem (file) {
        shell.openItem(file);
    },
    openExternal (url) {
        shell.openExternal(url);
    },
    fetch (csdPath, index, watcher) {
        return jhandy.fetch(csdPath, null, index, null, watcher);
    },
    setting () {
        return setting;
    },
    select () {
        return dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
    },
    msg (msg, title = '') {
        dialog.showMessageBox({type: 'info', title, message: msg}, (res) => {
            console.log(res);
        });
    },
    err (msg, title = '') {
        dialog.showErrorBox(title, msg);
    },
    timer (time = '8:55', f) {
        let [h, m, s] = time.split(/\D/g).map((v) => v * 1);
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [0, new schedule.Range(1, 6)];
        rule.hour = h;
        rule.minute = m;
        rule.second = s;
        console.log('define timer', time, f);
        return schedule.scheduleJob(rule, function () {
            console.log('exec timer ', (new Date).toLocaleString());
            f();
        });
    },
    getIp () {
        let ip;
        try {
            let networkInterfaces = os.networkInterfaces();
            ip = networkInterfaces.en0[0].address;
        } catch (e) {
            console.log('ip address 获取失败. =>', e);
        }
        return ip;
    },
    activeTdx () {
        tdx.active();
    },
    activeFtnn () {
        ac.activeFtnn();
    },
    viewInFtnn (code) {
        tdx.viewInFtnn(code);
    },
    viewInTdx (code) {
        tdx.view(code);
    },
    toggleApp () {
        ac.toggleApp();
    },
    /**
     * 添加股票
     * @param stock {Object} {code:'000001', name:'万科'}
     */
    addStock (stock) {
        stocksManager.add(stock);
    },
    /**
     * 文件拷贝
     * @param src
     * @param dist
     * @returns {*}
     */
    copy (src, dist) {
        return fse.copy(src, dist);
    },
    /**
     * 移动文件
     * @param src
     * @param dist
     * @returns {*|void}
     */
    move (src, dist) {
        return fse.move(src, dist);
    },
    /**
     * 是否是交易日; 周一至周五返回true
     * @returns {boolean}
     */
    isTradingDate () {
        let mo = moment();
        let day = mo.day(); // 礼拜几: 0 - 6
        return day > 0 && day < 6;
    },
    /**
     * 是否是交易时段
     * @returns {boolean}
     */
    isTradingTime () {
        let mo = moment();
        let h = mo.hour(); // 0 - 23
        return h > 5 && h < 15;
    },
    /**
     * 是否是A股交易时间
     * @returns {boolean}
     */
    isTrading () {
        let a = this.isTradingDate();
        let b = this.isTradingTime();
        return a && b;
    },
    getStockNameFromScreen () {
        return new Promise((resolve, reject) => {
            ac.getStockName((stock) => {
                stock.code ? resolve(stock) : reject(stock)
            })
        });
    },
    /**
     * 获取当前通达信界面个股名称; 通过apple script获取或截屏识图
     * @returns {Promise<any>}
     */
    getStock () {
        return new Promise((resolve, reject) => {
            ac.getStockName((stock) => {
                if (stock.code) {
                    resolve(stock);
                } else {
                    captureOcr(stock => {
                        stock.code ? resolve(stock) : reject(stock);
                    });
                }
            });
        });
    },

    /**
     * 安排拼音字母排序
     * @param arr {Object|Array}
     */
    sortByPinYin (arr) {

        return arr.sort((a, b) => {
            let aKeys = pinyin(a, {
                style: pinyin.STYLE_FIRST_LETTER
            });
            let bKeys = pinyin(b, {
                style: pinyin.STYLE_FIRST_LETTER
            });
            let aKey = aKeys[0][0];
            let bKey = bKeys[0][0];
            return aKey.localeCompare(bKey);
        });

    }

}

