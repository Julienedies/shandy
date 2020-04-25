/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import electron from 'electron'
import $ from 'jquery'

import voice from '../../../libs/voice'

import setting from '../../../libs/setting'

const voiceWarnText = setting.get('voiceWarnText') || {};

const ipc = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;
let win;
let timer;

const socket = io();
let $msg = $('#msg');

function hideWin () {
    //win.hide();
    win && win.minimize();
    $msg.addClass('warn');
}

function showWin () {
    // win.showInactive();
    win && win.restore();
    $msg.removeClass('warn');
}


ipc.on('id', function (event, windowID) {
    win = BrowserWindow.fromId(windowID);
    setTimeout(() => {
        hideWin();
    }, 60 * 1000);
});

// 有新消息显示窗口,  稍后隐藏窗口
function cb (msg) {
    clearTimeout(timer)
    $msg.text(msg)

    if (win) {
        showWin();
        timer = setTimeout(() => {
            hideWin();
        }, 30 * 1000);
    }
}


// 财经消息
socket.on('cls_news', cb);

// 交易警告文字版
socket.on('warn', (info) => {
    //cb(voiceWarnText.text[info])
    if (info === 'daban') {
        //voice('控制本能！ 宁缺毋滥！只做风口龙头热门最强势! 绝不要做跟风杂毛趁势弱势!');
        //voice(voiceWarnText[info]);
    }
});


