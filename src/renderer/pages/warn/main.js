/*!
 * Created by j on 2019-02-25.
 */

import electron from 'electron'
import $ from 'jquery'

import warnText from '../../js/warn-text'
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
        //win.setSize(600, 100, true)
        timer = setTimeout( () => {
            $msg.removeClass('warn')
            win.hide()
            //win.setSize(1400, 32, true)
            //win.setPosition(1600, 3)
        }, 10 * 1000);
    }
}

// 交易警告文字版
socket.on('voice_warn',  (info) => {
    if(info === 'esc'){
       return win.hide()
    }
    cb(warnText.text[info])
})


ipc.on('id', function (event, windowID) {
    console.log(event, windowID)
    win = BrowserWindow.fromId(windowID)
})
