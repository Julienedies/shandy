/*!
 * Created by j on 2019-02-25.
 */

import electron from 'electron'
import $ from 'jquery'

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
let win


let socket = io()
let $msg = $('#msg')

socket.on('cls_news', function (msg) {
    $msg.text(msg)
    if (win) {
        win.showInactive()
        win.setSize(1400, 102, true)
        setTimeout(function () {
            //win.setPosition(1600, 3)
            win.setSize(1400, 32, true)
        }, 12 * 1000)
    }
})


ipc.on('id', function (event, windowID) {
    console.log(event, windowID)
    win = BrowserWindow.fromId(windowID)
})