/*!
 * Created by j on 2019-02-25.
 */

import electron from 'electron'
import $ from 'jquery'

import voiceWarnText from '../../js/warn-text'

import './index.html'

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
let win
let timer

let socket = io()
let $place = $('#place')
let $msg = $('#msg')

// 有新消息显示窗口,  稍后隐藏窗口
function cb(msg){
    clearTimeout(timer)
    $msg.text(msg)
    if (win) {
        $msg.addClass('warn')
        win.showInactive()
        win.setSize(1600, 84, true)
        timer = setTimeout( () => {
            $msg.removeClass('warn')
            win.hide()
            //win.setSize(1400, 32, true)
            //win.setPosition(1600, 3)
        }, 17 * 1000);
    }
}

// 交易警告文字版
socket.on('warn',  (info) => {
    //cb(voiceWarnText.text[info])
})

// 财经消息
socket.on('cls_news', cb)


ipc.on('id', function (event, windowID) {
    console.log(event, windowID)
    win = BrowserWindow.fromId(windowID)
})
