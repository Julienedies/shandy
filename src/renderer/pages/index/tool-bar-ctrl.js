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

    this.showIp = function () {
        scope.$elm.find('#ip').text(utils.getIp())
    }

    this.showIp()

    this.view_403 = function () {
        tdx.keystroke('.403', true)
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
