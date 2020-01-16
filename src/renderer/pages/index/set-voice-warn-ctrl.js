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
    let isAbleVoiceWarn = false;  // 语音警告是否启用
    const warnHandleMap = {};
    let warnIntervalArr = [];
    let warnIntervalTimer = null;
    const dragOverCla = 'onDragOver';

    let currentType;

    /*    warnJodb.each((item) => {
            item.type = getType(item.trigger);
        });
        warnJodb.save();*/

    ipcRenderer.on('warn', (event, info) => {
        console.log(info, warnHandleMap[info]);
        voice(warnHandleMap[info] || '');
    });

    function render (model) {
        model = currentType ? warnJodb.get(currentType, 'type') : warnJodb.get();
        scope.render('warnList', {model}, function () {
            $(this).find('tr')
                .on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);
        });
    }

    function init () {
        render();
        // 如果不是交易时段, 则不设置语音警告
        if (utils.isTrading() || isAbleVoiceWarn) {
            isAbleVoiceWarn = true;  // 如果是交易时段, 语音警告可用
            updateVoiceWarn();
            scope.$elm.find('button[role=toggleBtn]').text('关闭语音').addClass('is-primary');
        }
    }

    function getType (trigger) {
        if (/^\d+$/.test(trigger)) {
            return 'interval';
        } else if (/^\d\d?(?:[:]\d\d?)+$/.test(trigger)) {
            return 'timer';
        } else {
            return 'action';
        }
    }

    function setVoiceWarnForItem (item, cancel) {
        let id = item.id;
        let content = item.content;
        let trigger = item.trigger;
        let disable = item.disable || cancel;
        let old = warnHandleMap[id];

        let type = getType(trigger);

        // trigger => 10 : 间隔执行
        if (type === 'interval') {
            if (disable) {
                _.remove(warnIntervalArr, (text) => {
                    return text === content;
                });
                return;
            }
            let count = Math.ceil(60 / trigger);
            let arr = _.fill(Array(count), content);
            warnIntervalArr = warnIntervalArr.concat(arr);
            warnIntervalArr = _.shuffle(warnIntervalArr);
        }
        // trigger => 9:00: 定时执行
        else if (type === 'timer') {
            if (old && old.handle) {
                old.handle.cancel();
                delete old.handle;
            }
            if (disable) {
                return;
            }
            let handle = utils.timer(trigger, () => {
                voice('timer', content);
                ipcRenderer.send('voice_warn', content);
            });
            warnHandleMap[id] = {handle};
        }
        // trigger => 'daban': 打板动作触发
        else {
            old && delete warnHandleMap[old.handle];
            if (disable) {
                return;
            }
            warnHandleMap[trigger] = content;
            warnHandleMap[id] = {handle: trigger};
        }
    }

    function updateVoiceWarn (cancel) {
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
                let warnText = warnIntervalArr.shift();
                if (warnText) {
                    voice(warnText);
                    warnIntervalArr.push(warnText);
                    ipcRenderer.send('voice_warn', warnText);
                }
            }, 1000 * 60 * 3);
        }
    }

    warnJodb.on('change', init);

    scope.debug = function (e) {
        let msg = JSON.stringify(warnIntervalArr, null, '\t');
        utils.msg(msg);
    };

    scope.onTypeChange = function (msg) {
        currentType = msg.value;
        render();
    };

    // 开启语音警告或关闭
    scope.toggle = function (e) {
        let $th = $(this);
        let open = '开启语音';
        let close = '关闭语音';
        let cla = 'is-primary';
        let str = $th.text();
        isAbleVoiceWarn = !isAbleVoiceWarn;
        if (str === open) {
            $th.addClass(cla).text(close);
            updateVoiceWarn();
        } else {
            $th.removeClass(cla).text(open);
            updateVoiceWarn(true);
        }
    };

    scope.save = function (fields) {
        fields.type = getType(fields.trigger);
        warnJodb.set(fields);
        scope.reset();
        scope.$elm.find('[ic-popup="setWarnItem"]').icPopup(false);
    };

    scope.reset = () => {
        scope.render('setWarnItem', {model: {}});
    };

    scope.edit = function (e, id) {
        let model = warnJodb.get2(id);
        scope.render('setWarnItem', {model});
        //scope.$elm.animate({scrollTop: scope.$elm.height()}, 400);
    };

    scope.rm = function (e, id) {
        warnJodb.remove(id);
    };

    scope.up = function (e, id) {
        warnJodb.insert(id);
    };

    scope.disable = function (e, id, isDisable) {
        let item = warnJodb.get2(id);
        item.disable = !item.disable;
        warnJodb.set(item);
        //$(this).text(isDisable ? '启用' : '禁用');
    };

    utils.timer('11:30', () => {
        updateVoiceWarn(true);
    });

    utils.timer('12:45', () => {
        updateVoiceWarn();
    });

    utils.timer('15:00', () => {
        updateVoiceWarn(true);
    });

    // -------------------------------------------------------------------

    init();

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
