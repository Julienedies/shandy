/**
 * Created by j on 18/6/16.
 */

import electron from 'electron'

import $ from 'jquery'
import brick from '@julienedies/brick'

import Win from '../../../libs/window.js'

import tdx from '../../../libs/tdx'
import ac from '../../../libs/ac'
import rts from '../../../libs/real-time-stock'

import cm from '../../../libs/console'
import config from '../../../libs/config'
import getToken from '../../../libs/get-baidu-token'
import utils from '../../../libs/utils'

const {remote, shell} = electron
const {dialog} = electron.remote


brick.reg('toolBarCtrl', function (scope) {

    scope.$elm.find('#ip').text(utils.getIp())



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

                    let result = `${ stock.name } : 当前价: ${ p }; 涨停价: ${ a }; 跌停价: ${ b }`
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
        shell.openExternal(`http://127.0.0.1:${ config.SERVER_PORT }/web/stock_index.html`)
    }

    this.updateToken = function () {
        getToken()
    }

})