/*!
 * Created by j on 2019-02-09.
 */

import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

brick.set('debug', false);
brick.set('render.wrapModel', true);

const socket = io();

const channel = 'shandy';
const $rts_list = $('#rts_list');
const $notify_news = $('#notify_news');

function emit (msg) {
    console.log('emit:', msg);
    socket.emit(channel, msg);
}

// 计算买一金额
window.b1Amount = function (n) {
    let y = 10000 * 10000;
    let qw = 1000 * 10000;
    return  n/y > 1 ? (n/y).toFixed(1) + '亿' : (n/10000).toFixed(0) + '万';
};

socket.on('rts_push', function (arr) {
    //console.log(arr, +new Date);
    $rts_list.icRender(arr);
});

socket.on('cls_news', function (msg) {
    console.log('通过socket接收cls news.其实消息本来就是从这里先传给服务器的.');
    $notify_news.text(msg).toggleClass('warn');
});

//
brick.reg('rts_ctrl', function (scope) {

    scope.cancel = function () {
        let $th = $(this);
        let code = $th.attr('code');
        $th.closest('li').remove();
        emit({event: 'rts_cancel', code: code});
    };

    scope.view = function () {
        let $th = $(this);
        let code = $th.attr('code');
        let event = $th.attr('event') || 'view_in_tdx';
        emit({event: event, code: code});
    };

    scope.active_ftnn = function () {
        emit({event: 'active_ftnn'});
    };

    scope.notify_news = function () {
        console.log('通过socket把cls news发给服务器.');
        let msg = $(this).text();
        socket.emit('cls_news', msg);
    };

});

//
brick.reg('help_ctrl', function (scope) {
    scope.render('links', {ip: location.host});
});

//
brick.reg('plansCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    $.get({
        url: '/stock/replay'
    }).done((data) => {
        console.info(data);
        scope.render('replay', data.replay);
    });

    $.get({
        url: '/stock/plan'
    }).done((data) => {
        console.info(data);
        list.init(data.plans);
        data.plans && data.plans.length && scope.render('plans', data.plans);
    });

});


brick.bootstrap();
