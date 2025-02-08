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

import debugMenu from 'debug-menu'

debugMenu.install();

const w1 = `
无系统,无计划，临盘被市场牵着鼻子走；随意冲动交易；
无系统,无计划，临盘被市场牵着鼻子走；随意冲动交易；
无系统,无计划，临盘被市场牵着鼻子走；随意冲动交易；
无系统,无计划，临盘被市场牵着鼻子走；随意冲动交易；`;

const w2 = `
卖飞、卖飞、卖飞、截断亏损、让利润奔跑；
卖飞、卖飞、卖飞、截断亏损、让利润奔跑；
卖飞、卖飞、卖飞、截断亏损、让利润奔跑；
卖飞、卖飞、卖飞、截断亏损、让利润奔跑；
`;

//const voiceWarnText = setting.get('voiceWarnText') || {};
const voiceWarnText = {
    'daban': w1,
    'buy': w1,
    'sell': w2,
}


const ipc = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;
let win;
let timer;


const socket = io();
let $news = $('#news');
let $warn = $('#warn');

let activeCla = 'active blink';
let activeCla2 = 'active blink2';

// 财联社消息数组，主要是保存旧消息
let newsArr = [];

///////////////////////////////////////////////////////////////
// 对财联社消息文本组装
function getNews (news) {
    let result = '';
    if(news !== newsArr[0]) {
        newsArr.unshift(news);
    }
    newsArr.splice(3);
    console.log(newsArr);
    newsArr.forEach((v, i) => {
        result += `<p>${ v }</p>`;
    });
    return result;
    //return newsArr.join('\r\n');
}

//////////////////////////////////////////////////////////////
// 隐藏窗口
function hideWin () {
    //win.hide();
    //win && win.minimize();
    //$news.removeClass(activeCla);
}

// 显示窗口
function showWin () {
    // win.showInactive();
    //win && win.restore();
    //$news.addClass(activeCla);
}

//////////////////////////////////////////////////////////////
// 获取窗口ID，只在窗口创建后触发一次
ipc.on('id', function (event, windowID) {
    win = BrowserWindow.fromId(windowID);
    setTimeout(() => {
        $news.removeClass(activeCla2);
    }, 19 * 1000);
});


//////////////////////////////////////////////////////////////
// 有财经新消息显示弹出层,  稍后隐藏窗口
socket.on('cls_news', (msg) => {
    clearTimeout(timer);

    let html = getNews(msg);
    $news.html(html).addClass(activeCla2);

    timer = setTimeout(() => {
        $news.removeClass(activeCla2);
    }, 2 * 1000);
});


//////////////////////////////////////////////////////////////
// 买入，卖出等 交易警告文字提示版
socket.on('warn', (info) => {

    if (info === 'esc') {
        $warn.removeClass(activeCla);
        $news.removeClass(activeCla2);
        return;
    }

    $news.removeClass(activeCla2);

    let text = voiceWarnText[info] || info;
    $warn.text(text).addClass(activeCla);

    setTimeout(function () {
        $warn.removeClass(activeCla);
        voice.clear();
    }, 1000 * 4);

    voice(text);

    if (info === 'daban') {
        //voice('控制本能！ 宁缺毋滥！只做风口龙头热门最强势! 绝不要做跟风杂毛趁势弱势!');
        //voice(voiceWarnText[info]);
    }
});


