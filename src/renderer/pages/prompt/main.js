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
import moment from 'moment'
import utils from '../../../libs/utils'
import userJodb from '../../../libs/user-jodb'

const ipc = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;

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

    scope.currentTodoItem = null;

    scope.hideWindow = function (e) {
        currentWindow && currentWindow.hide();
    };

    scope.complete = function (e) {
        if (scope.currentTodoItem) {
            scope.currentTodoItem.complete = true;
            todoJodb.set(scope.currentTodoItem);
        }
        scope.hideWindow();
    };

    scope.stop = function (e) {
        clearInterval(scope.timer);
    };

    // 每天早上开启时，清除昨天的提醒数据,重新开始
    (function () {
        let hour = moment().hour();
        if (hour < 9) {
            todoJodb.each((todoItem) => {
                delete todoItem.complete;
                delete todoItem.promptTimes;
                delete todoItem.prevPromptTime;
            }).save();
        }
    })();

    // 处理只执行一次的定时器
    todoJodb.each((todoItem) => {
        if (todoItem.disable) return;
        if (todoItem.repeat === 1 && todoItem.start) {
            utils.timer(todoItem.start, () => {
                currentWindow.showInactive();
                scope.emit(todoItem.type || 'prompt', todoItem);
            });
        }
    });

    // 每10分钟执行一次, 检查todo列表里是否有项需要提醒 win.showInactive()
    scope.timer = setInterval(() => {
        let todoArr = todoJodb.get();
        let over = false;
        todoArr.forEach((todoItem, index) => {
            // 每轮只执行一个提醒
            if (over) return;
            if (todoItem.disable) return;
            // 先判断任务是否完成，未完成才提醒
            if (todoItem.complete || todoItem.repeat === 1) {
                return;
            }
            // 计算当前时间和任务开始时间之差
            // moment().diff(moment('8:00', 'HH:mm'),'minutes');
            let diffM = moment().diff(moment(todoItem.start, 'HH:mm'), 'minutes');
            // 如果到达开始时间
            if (diffM > 0) {
                let promptTimes = todoItem.promptTimes || 0; // 提醒次数
                let prevPromptTime = todoItem.prevPromptTime; // 上次提醒时间
                // 如果还没有达到提醒次数
                if (promptTimes < todoItem.repeat) {
                    // 如果还没有提醒过; 或者
                    // 当前时间和上次提醒时间之差达到间隔时间
                    if (promptTimes === 0 || moment().diff(moment(prevPromptTime, 'x'), 'minutes') >= todoItem.interval) {
                        todoItem.promptTimes = promptTimes + 1;
                        todoItem.prevPromptTime = +new Date();
                        todoJodb.set(todoItem);
                        scope.currentTodoItem = todoItem;
                        currentWindow.showInactive();
                        setTimeout(() => {
                            scope.hideWindow();
                        }, 1000 * 18);
                        scope.emit(todoItem.type || 'prompt', todoItem);
                        over = true;  // 终止todo数组循环
                    }
                }
            }

        });

    }, 1000 * 60 * 10);


    $.get('/stock/tags/').done((data) => {
        console.log(data);
        let model = data;
        scope.render('prepare', {model});
        scope.render('mistake', {model});
        //scope.render('logic', model);
        //scope.render('principle', model);
    });

});

brick.reg('jobsCtrl', function (scope) {

    const dragOverCla = 'onDragOver';

    function render () {
        let todoArr = todoJodb.get();
        console.log(todoArr);
        scope.render('jobs', {model: todoArr}, function () {
            $(this).find('tr').on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);
        });
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

    scope.disable = function (e, id, isDisable) {
        let item = todoJodb.get2(id);
        item.disable = !item.disable;
        todoJodb.set(item);
    };

    todoJodb.on('change', render);

    render();

    // ------------------------------------------------------------
    scope.dragstart = function (e) {
        let id = $(this).data('id');
        e.originalEvent.dataTransfer.setData("Text", id);
        console.log('dragstart', id);
    };

    scope.dragover = function (e) {
        e.preventDefault();
        //e.stopPropagation();
        e.originalEvent.dataTransfer.dropEffect = 'move';
        $(e.target).addClass(dragOverCla);
        return false;
    };

    scope.dragleave = function (e) {
        $(e.target).removeClass(dragOverCla);
    };

    scope.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        let $target = $(e.target);
        let id = e.originalEvent.dataTransfer.getData("Text");
        let distId = $target.data('id') || $target.closest('tr[data-id]').data('id');
        if (!distId || distId === id) {
            return console.log('not dist');
        }
        console.log('drop', id, distId + '', e.target);
        todoJodb.insert(id, distId + '');
        return false;
    };
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

    scope.on('prompt', function (e, todoItem) {
        brick.view.to('prompt');
        $todoContent.text(todoItem.content);
    });

});


brick.reg('prepareCtrl', function (scope) {
    scope.on('prepare', function (e, _todoItem) {
        brick.view.to('prepare');
    });
});


brick.reg('mistakeCtrl', function (scope) {
    scope.on('mistake', function (e, _todoItem) {
        brick.view.to('mistake');
    });
});


brick.reg('planCtrl', function (scope) {

    $.get({
        url: '/stock/replay'
    }).done((data) => {
        console.info(data);
        scope.render('replay', {model: data.replay});
    });

    $.get({
        url: '/stock/plan'
    }).done((data) => {
        console.info(data);
        data.plans && data.plans.length && scope.render('plans', {model: data.plans});
    });

    scope.on('plan', function (e, _todoItem) {
        brick.view.to('plan');
    });

});



