/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import '@julienedies/brick/dist/brick.transition.js'

import '../../js/utils.js'

import electron from 'electron'
import utils from '../../../libs/utils'
import voice from '../../../libs/voice'
import warnText from '../../js/warn-text'
import userJodb from '../../../libs/user-jodb'

const ipc = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;

const warnJodb = userJodb('warn');
const warnArr = warnJodb.get() || [];

let win;
const socket = io();

let $body = $('body');
let $place = $('#place');
let $barrageBox = $('#barrageBox');

const warnHandleMap = {};
let warnIntervalArr = [];

let warnIntervalTimer = null;
let hideTimer = null;

function show () {
    $body.css('opacity', 1).show();
}

function show2 (content) {
    clearTimeout(hideTimer);
    let cla = 'aniIn';
    let x = Math.random() * 300 - 190;
    let y = Math.random() * 400 - 290;
    let size = 14 + Math.random() * 10;
    brick.view.to('place');
    $place.text(content).css({'left': `${ x }%`, 'top': `${ y }%`, color: `${ randomColor() }`, 'font-size': `${ size }px`});
    setTimeout(() => {
        //$place.css({'left': `${ 25 + Math.random() * 20 }%`, 'top': `${ 35 + Math.random() * 20 }%`, 'font-size': '28px'});
        $place.css({'left': `${ 36 }%`, 'top': `${ 30 }%`, 'font-size': '28px'});
    }, 200);
}

function hide () {
    brick.view.to('hide');
}

function copy (text, number) {
    let d = number || 16;
    let line = text.split(/[\n]/img);
    d = Math.ceil(d/line.length);
    let arr = _.fill(Array(d), text);
    return arr.join('\r');
}

/**
 * @todo 随机颜色函数
 * @returns {string}
 */
function randomColor () {
    return '#' + Math.random().toString(16).slice(-6);
}

/**
 * @todo 弹幕显示警告文本
 * @param txt {String} 弹幕文本内容
 * @param [cb] {Function}  可选，动画执行完的回调函数
 */
function barrage (txt, cb) {
    let y = 15 + Math.random() * 70;
    let d = 32 + Math.random() * 24;
    let size = 18 + Math.random() * 12;
    let str = `<div style="top: ${ y }%; color:${ randomColor() }; font-size: ${ size }px; animation: barrage ${ d }s;">${ txt }</div>`;
    $(str).appendTo($barrageBox).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        $(this).remove();
        cb && cb();
    });
}

warnArr.forEach((item, index) => {
    let id = item.id;
    let content = item.content;
    let trigger = item.trigger;
    let disable = item.disable;
    // trigger => 10 : 间隔执行
    if (/^\d+$/.test(trigger)) {
        let count = Math.ceil(240 / trigger);
        let arr = _.fill(Array(count), content);
        warnIntervalArr = warnIntervalArr.concat(arr);
        warnIntervalArr = _.shuffle(warnIntervalArr);
    }
    // trigger => 9:00: 定时执行
    else if (/^\d+[:]\d+$/.test(trigger)) {
        if (disable) return;
        let handle = utils.timer(trigger, () => {
            show2(content);
        });
    }
    // trigger => 'daban': 打板动作触发
    else {
        warnHandleMap[trigger] = content;
    }
});

// 定时弹幕
/*warnIntervalTimer = setInterval(() => {
    let warnText = warnIntervalArr.shift();
    if (warnText) {
        barrage(warnText);
        warnIntervalArr.push(warnText);
    }
}, 1000 * 24);*/


/*let intervalTimer = setInterval(() => {
    let warnText = warnIntervalArr.shift();
    warnIntervalArr.push(warnText);
    show2(warnText);
}, 1000 * 60 * 4);*/

/*[
    ['9:05', '交易准备'],
    ['9:29', '竞价研判'],
    ['9:45', '早盘'],
].forEach((item) => {
    utils.timer(item[0], () => {
        show();
        brick.view.to(item[1]);
    });
});*/


$('[ic-view]').on('ic-view.active', function (e) {
    hideTimer = setTimeout(() => {
        hide();
    }, 1000 * 4);
});

const audioMap = {
    'daban': require(`./audio/daban-10.mp3`)
};

socket.on('warn', (info) => {

    if (info === 'esc') {
        return hide();
    }

    if (info === 'sell' || info === 'buy' || info === 'daban') {
        let d = info === 'sell' ? 0 : 0;
        let str = warnHandleMap[info];
        //show2(copy(str));
        if(d > 0) {
            $body.css({backgroundColor: 'rgba(0,0,0,1)'});
            setTimeout(() => {
                $body.css({'backgroundColor': 'rgba(0,0,0,0)'});
            }, 1000 * d);
        }
    } else {
        show2(info);
    }

    /*        let audio = new Audio(audioMap[info]);
            audio.volume = 1;
            audio.play();*/
});

ipc.on('id', function (event, windowID, isFrameMode) {
    win = BrowserWindow.fromId(windowID);
    setTimeout(() => {
        if (isFrameMode) {
            setTimeout(hide, 1000 * 9);
        } else {
            $body.css('backgroundColor', 'black');
        }
    }, 1000 * 1.1);
});

ipc.on('view', (e, view) => {
    brick.view.to(view);
});


brick.reg('mainCtrl', function (scope) {
});


brick.bootstrap();
