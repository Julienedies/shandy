/**
 * Created by j on 18/6/16.
 */
import os from 'os'
import electron from 'electron'

import $ from 'jquery'
import brick from '@julienedies/brick'

import Win from '../../../libs/window.js'

import tdx from '../../../libs/tdx'
import ac from '../../../libs/ac'
import rts from '../../../libs/real-time-stock'

import cm from '../../../libs/console'
import schedule from '../../../libs/schedule.js'
import config from '../../../libs/config'
import getToken from '../../../libs/get-baidu-token'

const {remote, BrowserWindow, shell} = electron
const {dialog} = electron.remote

schedule(function createVoiceWarningWindow () {
    new Win('warn.html');
}, 8, 55);


brick.reg('tool_bar_ctrl', function (scope) {

    this.warn = function () {
        let winCtrl = new Win('warn.html')
        winCtrl.maximize()
        winCtrl.dev()
    }

    scope.news = function () {
        let newsWin = scope.newsWin
        if (newsWin) {
            newsWin.close()
            scope.newsWin = newsWin = null
        } else {
            let opt = {
                width: 1400,
                height: 32,
                x: 1600,
                y: 3,
                //width:700,
                //height:200,
                //x:300,
                //y:400,
                opacity: 0.8,
                frame: false,
                hasShadow: false,
                alwaysOnTop: true,
                center: true,
                url: 'news.html'
            }
            scope.newsWin = newsWin = new Win(opt);
            newsWin.maximize()
            newsWin.dev()
            newsWin.win.setIgnoreMouseEvents(true)
            newsWin.win.webContents.on('did-finish-load', function () {
                newsWin.win.webContents.send('id', newsWin.win.id)
            })
        }
    }

    scope.viewImg = function () {
        dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}, function (filePaths) {
            console.info(filePaths)
            if (!filePaths) return
            let dir = encodeURIComponent(filePaths[0])
            let url = `viewer.html?dir=${ dir }`
            let win = scope.view_img_win
            if (win && win.win) {
                win.load(url)
            } else {
                win = scope.view_img_win = new Win({x: 1440, url: url})
                win.maximize()
                win.dev()
            }
        })
    }

    this.view_403 = function () {
        tdx.keystroke('.403', true)
    }

    // 涨跌停价计算
    this.swing_10 = function () {
        ac.getStockName(function (stock) {

            rts({
                interval: false,
                code: stock.code,
                callback: function (data) {

                    console.info(data[0])
                    let p = data[0].price * 1
                    console.info(p)
                    let a = p + p * 0.1
                    console.info(a)
                    a = Math.round(a * 100) / 100
                    console.info(a)
                    let b = p - p * 0.1
                    console.info(b)
                    b = Math.round(b * 100) / 100
                    console.info(b)

                    let result = `${ stock.name } => 涨停价: ${ a }; 跌停价: ${ b }`
                    console.log(result)
                    dialog.showMessageBox(null, {type: 'info', message: `${ result }`})

                }
            })
        })
    }

    this.relaunch = function () {
        remote.app.relaunch()
        remote.app.exit()
    }

    this.refresh = function (e) {
        location.reload()
    }

    this.openInWeb = function () {
        shell.openExternal(`http://${ scope.getIp() }:${config.SERVER_PORT}`)
    }

    this.showIp = function () {
        let ip = scope.getIp()
        dialog.showMessageBox(null, {type: 'info', message:`${ip}`})
    }


    this.updateToken = function () {
        getToken()
    }

    this.openSetting = function () {
        new Win('setting.html')
    }

    this.getIp = function () {
        let ip
        try {
            let networkInterfaces = os.networkInterfaces()
            ip = networkInterfaces.en0[0].address
        } catch (e) {
            console.log('ip address 获取失败. =>', e)
        }
        return ip
    }

})