/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import '@julienedies/brick/dist/brick.transition.js'

import '../../js/utils.js'

import electron from 'electron'
import utils from '../../../libs/utils'
import userJodb from '../../../libs/user-jodb'

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow

const todoJodb = userJodb('todo');

let currentWindow;
let $body = $('body');
let socket = io();

// 显示随机背景图片
function randomBgImg () {
    // $body.css('background-image', `url("/file/random/?time=${ +new Date }")`);
}


ipc.on('id', function (event, windowID) {
    console.log(event, windowID);
    currentWindow = BrowserWindow.fromId(windowID);
})

ipc.on('view', (e, view) => {
    brick.view.to(view);
});


brick.reg('mainCtrl', function (scope) {

    scope.hideWindow = function (e) {
        currentWindow.hide();
    };

    // 每10分钟执行一次, 检查todo列表里是否有项需要提醒 win.showInactive()
    setInterval(() => {
        let todoArr = todoJodb.get();

        todoArr.forEach( (item, index) => {

            if(index ===0) {
                currentWindow.showInactive();
                brick.view.to('prompt');
                scope.emit('prompt', item);
            }

        });


    }, 1000 * 60 * 10);

});

brick.reg('jobsCtrl', function (scope) {

    function render () {
        let todoArr = todoJodb.get();
        console.log(todoArr);
        scope.render('jobs', {model: todoArr});
    }

    scope.addJob = function (e) {
        brick.view.to('setJob');
        scope.emit('setJob', {});
    };

    scope.edit = function (e, id) {
        brick.view.to('setJob');
        scope.emit('setJob', todoJodb.get2(id));
    };

    scope.rm = function (e, id) {
        todoJodb.remove(id);
    };

    scope.complete = function (e, id, isComplete) {
        let item = todoJodb.get2(id);
        item.complete = !item.complete;
        todoJodb.set(item);
    };

    todoJodb.on('change', render);

    render();
});

brick.reg('setJobCtrl', function (scope) {

    this.save = function (fields) {
        console.log(fields);
        todoJodb.set(fields);
        brick.view.to('jobs');
    };

    this.reset = function () {
        scope.render('setJob', {model: {}});
    };

    this.cancel = function (e) {
        brick.view.to('jobs');
    };

    scope.on('setJob', function (e, msg) {
        console.log(33, msg, e);
        scope.render('setJob', {model: msg || {}});
    });

});

brick.reg('promptCtrl', function () {

    const scope = this;
    let $todoContent = scope.$elm.find('#todoContent');
    let todoItem = {};

    scope.complete = function (e) {
        todoItem.complete = true;
        todoJodb.set(todoItem);
        scope.hideWindow();
    };

    scope.on('prompt', function (e, _todoItem) {
        todoItem = _todoItem;
        $todoContent.text(todoItem.content);
    });

});


brick.reg('planCtrl', function () {

    let scope = this
    let $elm = scope.$elm

    $.get({
        url: '/stock/replay'
    }).done((data) => {
        console.info(data)
        scope.render('replay', {model: data.replay})
    })

    $.get({
        url: '/stock/plan'
    }).done((data) => {
        console.info(data)
        data.plans && data.plans.length && scope.render('plans', {model: data.plans})
    })

});

brick.reg('mistakeCtrl', function (scope) {
    $.get('/stock/tags')
        .done((data) => {
            console.log(data)
            let vm = data['交易错误']
            //scope.render('mistake', vm)
        });
});

