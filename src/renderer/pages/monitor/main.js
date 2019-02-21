/*!
 * Created by j on 2019-02-09.
 */

import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

brick.set('debug', false)
brick.set('render.wrapModel', true)

const channel = 'jhandy';
const socket = io();
const $rts_list = $('#rts_list');
const $notify_news = $('#notify_news');

function emit (msg) {
    socket.emit(channel, msg);
}

socket.on('rts_push', function (arr) {
    //console.log(arr, +new Date);
    $rts_list.icRender(arr);
});

socket.on('cls_news', function (msg) {
    $notify_news.text(msg);
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
        let event = $th.attr('event');
        emit({event: event, code: code});
    };

    scope.active_ftnn = function () {
        emit({event: 'active_ftnn'});
    };

    scope.notify_news = function () {
        let msg = $(this).text();
        socket.emit('cls_news', msg);
    };

});

//
brick.reg('help_ctrl', function (scope) {
    var ip = location.hostname;
    scope.render('links', {ip: ip});
});

//
brick.reg('plans_ctrl', function () {

    var scope = this;
    var $elm = scope.$elm;
    var list = brick.services.get('recordManager')();

    scope.replay_get_done = function (data) {
        console.info(data);
        scope.render('replay', data.replay);
    };

    scope.plan_get_done = function (data) {
        console.info(data);
        list.init(data.plans);
        data.plans && data.plans.length && scope.render('plans', data.plans);
    };

    /*      $.ajax({
              url:'http://localhost:3000/stock/plan',
              dataType:'json',
              processData: false,
              type:'get',
              success:function(data){
                  console.log(data);
              },
              error:function(XMLHttpRequest, textStatus, errorThrown) {
                  console.log(XMLHttpRequest);
              }});*/

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let data = JSON.parse(this.responseText);
            scope.plan_get_done(data);
        }
    };
    xhr.open("GET", `http:\/\/${ location.hostname }:3000/stock/plan`, true);
    xhr.send();

});


brick.bootstrap()