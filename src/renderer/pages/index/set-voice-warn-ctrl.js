/**
 *
 * Created by j on 2019-10-16.
 */

import electron from 'electron'

import userJodb from '../../../libs/user-jodb'
import voice from '../../../libs/voice'
import utils from '../../../libs/utils'

import _ from 'lodash'
import $ from 'jquery'

const {ipcRenderer} = electron;

export default function (scope) {

    const warnJodb = userJodb('warn', []);
    // 存储定时器句柄，用以取消
    let isAbleVoiceWarn = null;  // 语音警告是否启用
    const warnHandleMap = {};
    let warnIntervalArr = [];
    let warnIntervalTimer = null;
    const dragOverCla = 'onDragOver';
    const ignoreReg = /[(（].*[）)]/img;

    let currentTabType = 'interval';
    let currentTag = '';

    let cla = 'is-primary';

    let $toggleBtn = scope.$elm.find('button[role=toggleBtn]');

    // 通知主进程ipcMain, 主进程通过io广播给client
    function send(msg) {
        ipcRenderer.send('voice_warn', msg);
    }

    function copyX(str, count) {
        return _.fill(Array(count || 1), str).join('\r\n');
    }

    function render() {
        let model = currentTabType ? warnJodb.get(currentTabType, 'type') : warnJodb.get();

        if (currentTag) {
            currentTag = currentTag === '_null' ? '' : currentTag;
            model = model.filter((item) => {
                return currentTag ? item.name.includes(currentTag) : item.name === currentTag;
            });
        }

        scope.render('warnList', {model}, function () {
            $(this).find('tr')
                .on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);
        });

    }

    function render2() {
        let tagsModel = {};
        warnJodb.each((v, i) => {
            tagsModel[v.name || '_null'] = 1;
        });
        scope.render('tags', {model: tagsModel});
    }

    function init() {
        render();
        render2();
        // 如果语言警告明确设置为false，返回
        if (isAbleVoiceWarn === false) return;
        // 如果不是交易时段, 则不设置语音警告
        if (utils.isTrading() || isAbleVoiceWarn || 0) {
            isAbleVoiceWarn = true;  // 如果是交易时段, 语音警告可用
            updateVoiceWarn();
            $toggleBtn.text('关闭语音').addClass('is-primary');
        }
    }

    // 类型分为 定时; 动作; 间隔; 三个标签
    function getType(trigger) {
        if (/^\d+$/.test(trigger)) {
            return 'interval';
        } else if (/^\d\d?(?:[:]\d\d?)+$/.test(trigger)) {
            return 'timer';
        } else {
            return 'action';
        }
    }

    function setVoiceWarnForItem(item, cancel) {
        let id = item.id;
        let trigger = item.trigger;
        let content = item.content;
        let content2 = copyX(content, item.repeat);
        let disable = item.disable || cancel;
        let old = warnHandleMap[id];

        let type = getType(trigger);

        // interval => 10 : 间隔执行
        if (type === 'interval') {
            if (disable) {
                _.remove(warnIntervalArr, (v) => {
                    return v === id;
                });
                return;
            }
            let count = Math.ceil(60 / trigger);
            let arr = _.fill(Array(count), id);
            warnIntervalArr = warnIntervalArr.concat(arr);
            warnIntervalArr = _.shuffle(warnIntervalArr);
        }
        // timer => 9:00: 定时执行
        else if (type === 'timer') {
            if (old && old.handle) {
                old.handle.cancel();
                delete old.handle;
            }
            if (disable) {
                return;
            }
            let handle = utils.timer(trigger, () => {
                voice('timer', content2);
                send(content);
            });
            warnHandleMap[id] = {handle};
        }
        // active => 'daban': 打板动作触发
        else {
            old && delete warnHandleMap[old.handle];
            if (disable) {
                return;
            }
            warnHandleMap[trigger] = id;
            warnHandleMap[id] = {handle: trigger};
        }
    }

    function updateVoiceWarn(cancel) {
        warnIntervalArr = [];
        if (cancel) {
            clearInterval(warnIntervalTimer);
            warnIntervalTimer = null;
        }
        warnJodb.get().forEach((item, index) => {
            setVoiceWarnForItem(item, cancel);
        });

        if (!cancel && !warnIntervalTimer && isAbleVoiceWarn) {
            warnIntervalTimer = setInterval(() => {
                let id = warnIntervalArr.shift();
                let item = warnJodb.get2(id);
                let str = _.fill(Array(item.repeat || 1), item.content).join('\r\n');
                str = str.replace(ignoreReg, '');
                voice(str);
                //send(item.content);
                warnIntervalArr.push(id);
            }, 1000 * 60 * 1.1);
        }
    }

    scope.debug = function (e) {
        let str = JSON.stringify(warnIntervalArr, null, '\t');
        console.log(str);
    };

    scope.toggleShow = function (e) {
        $(this).toggleClass('is-primary');
        scope.$elm.find('tr.disable').toggle();
    };

    // 类型分为 定时; 动作; 间隔; 三个标签
    scope.onTypeChange = function (msg) {
        currentTabType = msg.value;
        currentTag = '';
        render();
    };

    scope.onTagFilterChange = function (msg) {
        currentTag = msg.value;
        render();
    };

    // 开启语音警告或关闭
    scope.toggle = function (e) {
        if ($toggleBtn.hasClass(cla)) {
            scope.stop();
        } else {
            scope.open();
        }
    };

    // 开启语音
    scope.open = function () {
        isAbleVoiceWarn = true;
        $toggleBtn.addClass(cla).text('关闭语音');
        updateVoiceWarn();
    };
    // 停止语音
    scope.stop = function () {
        isAbleVoiceWarn = false;
        $toggleBtn.removeClass(cla).text('开启语音');
        updateVoiceWarn(true);
        voice.cancel();
    };

    // 试听单项
    scope.hear = function (e, id) {
        let item = warnJodb.get2(id);
        let str = _.fill(Array(item.repeat || 1), item.content).join('\r\n');
        voice(str);
        send(str);
    };

    // 添加新项
    scope.add = function (e) {
        scope.render('setWarnItem', {model: {}});
    };

    // 修改单项
    scope.edit = function (e, id) {
        let model = warnJodb.get2(id);
        scope.render('setWarnItem', {model});
    };

    // 删除单项
    scope.rm = function (e, id) {
        warnJodb.remove(id);
    };

    // 置顶单项
    scope.up = function (e, id) {
        warnJodb.insert(id);
    };

    // 禁用单项
    scope.disable = function (e, id, isDisable) {
        let item = warnJodb.get2(id);
        item.disable = !item.disable;
        warnJodb.set(item);
        //$(this).text(isDisable ? '启用' : '禁用');
    };

    // 保存添加或修改
    scope.save = function (fields) {
        fields.type = getType(fields.trigger);
        warnJodb.set(fields);
        scope.$elm.find('[ic-popup="setWarnItem"]').icPopup(false);
    };

    scope.reset = () => {
        scope.render('setWarnItem', {model: {}});
    };

    utils.timer('8:45', () => {
        scope.open();
    });

    utils.timer('11:30', () => {
        scope.stop();
    });

    utils.timer('12:45', () => {
        scope.open();
    });

    utils.timer('15:00', () => {
        scope.stop();
    });

    // -------------------------------------------------------------------

    init();

    warnJodb.on('change', init);

    // 接收外部动作消息, 目前是 打板; 买入; 卖出;
    ipcRenderer.on('warn', (event, info) => {
        console.log(info, warnHandleMap[info]);
        let id = warnHandleMap[info] || '';
        let item = warnJodb.get2(id);
        let str = _.fill(Array(item.repeat || 1), item.content).join('\r\n');
        let str2 = str.replace(ignoreReg, '');
        voice('x', str2);
    });

    // --------------------------------------------------------------------

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
        warnJodb.insert(id, distId + '');
        return false;
    };

}
