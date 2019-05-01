/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import electron from 'electron'
import $ from 'jquery'

import voiceWarnText from '../../js/warn-text'

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
let win
let timer

const socket = io()
let $msg = $('#msg')

// 有新消息显示窗口,  稍后隐藏窗口
function cb (msg) {

    clearTimeout(timer)

    $msg.text(msg)

    if (win) {

        win.showInactive()
        $msg.addClass('warn')

        timer = setTimeout(() => {
            win.hide()
            $msg.removeClass('warn')
        }, 17 * 1000);
    }
}


// 财经消息
socket.on('cls_news', cb);

// 交易警告文字版
socket.on('warn', (info) => {
    //cb(voiceWarnText.text[info])
})

ipc.on('id', function (event, windowID) {
    win = BrowserWindow.fromId(windowID);
    setTimeout(() => {
        win.hide();
    }, 14 * 1000);
});
