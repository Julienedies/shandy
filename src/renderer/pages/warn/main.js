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

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow

const warnJodb = userJodb('warn');
const warnArr = warnJodb.get() || [];

let win;
const socket = io();
const $body = $('body');
const $place = $('#place');

const warnHandleMap = {};
let warnIntervalArr = [];


const show = () => {
    $body.css('opacity', 1).show();
};

const show2 = (content) => {
    $place.text(content);
    brick.view.to('place');
};

const hide = () => {
    //$body.css('opacity', 0).hide();
    brick.view.to('hide');
};


ipc.on('id', function (event, windowID, isFrameMode) {
    win = BrowserWindow.fromId(windowID);
    setTimeout(() => {
        if (isFrameMode) {
            // hide();  // 设置透明，鼠标忽略，保持始终窗口显示;
            setTimeout(hide, 1000 * 9);
        } else {
            $body.css('backgroundColor', 'black');
        }
    }, 1000 * 1);
});

ipc.on('view', (e, view) => {
    brick.view.to(view);
});


warnArr.forEach((item, index) => {
    let id = item.id;
    let content = item.content;
    let trigger = item.trigger;
    let disable = item.disable;
    /*
        if (disable) {
            return;
        }*/

    // trigger => 10 : 间隔执行
    if (/^\d+$/.test(trigger)) {
        let count = Math.ceil(240 / trigger);
        let arr = _.fill(Array(count), content);
        warnIntervalArr = warnIntervalArr.concat(arr);
        warnIntervalArr = _.shuffle(warnIntervalArr);
    }
    // trigger => 9:00: 定时执行
    else if (/^\d+[:]\d+$/.test(trigger)) {
        let handle = utils.timer(trigger, () => {
            show2(content);
        });
    }
    // trigger => 'daban': 打板动作触发
    else {
        warnHandleMap[trigger] = content;
    }
});

console.log(warnIntervalArr);

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
    setTimeout(() => {
        hide();
    }, 1000 * 24);
});

const audioMap = {
    'daban': require(`./audio/daban-10.mp3`)
};

socket.on('warn', (info) => {

    if (info === 'esc') {
        return hide();
    }

    if (info === 'sell' || info === 'buy' || info === 'daban') {
        show2(warnHandleMap[info]);
    } else {
        show2(info);
    }

    /*        let audio = new Audio(audioMap[info]);
            audio.volume = 1;
            audio.play();*/

    /*setTimeout(() => {
        //hide();
        brick.view.to('hide');
    }, 1000 * 5);*/
});

brick.reg('mainCtrl', function (scope) {
});

brick.bootstrap();
