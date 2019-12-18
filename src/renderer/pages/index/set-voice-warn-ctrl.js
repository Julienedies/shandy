/**
 *
 * Created by j on 2019-10-16.
 */

import electron from 'electron'

import userJodb from '../../../libs/user-jodb'
import voice from '../../../libs/voice'
import utils from '../../../libs/utils'

import $ from 'jquery'
import _ from 'lodash'

const {ipcRenderer} = electron;

export default function (scope) {

    const warnJodb = userJodb('warn', [], {joinType: 'push'});
    // 存储定时器句柄，用以取消
    const warnHandleMap = {};
    let warnIntervalArr = [];
    let warnIntervalTimer = null;
    const dragOverCla = 'onDragOver';

    ipcRenderer.on('warn', (event, info) => {
        console.log(info, warnHandleMap[info])
        voice(warnHandleMap[info] || '');
    });

    let render = () => {
        let model = warnJodb.get();
        scope.render('warnList', {model}, function() {
            $(this).find('tr').on('dragstart', scope.dragstart).on('dragover', scope.dragover).on('drop', scope.drop).on('dragleave', scope.dragleave);
        });
    };

    scope.save = function (fields) {
        warnJodb.set(fields);
        scope.reset();
        scope.$elm.find('[ic-popup="setWarnItem"]').icPopup(false);
    };

    scope.reset = (model = {}) => {
        scope.render('setWarnItem', {model});
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
        $(this).text(isDisable ? '启用' : '禁用');
    };

    // 开启语音警告或关闭
    scope.toggle = function (e) {
        let $th = $(this);
        let open = '开启语音';
        let close = '关闭语音';
        let cla = 'is-primary';
        let str = $th.text();
        if (str === open) {
            $th.addClass(cla).text(close);
            updateVoiceWarn();
        } else {
            $th.removeClass(cla).text(open);
            updateVoiceWarn(true);
            clearInterval(warnIntervalTimer);
            warnIntervalTimer = null;
        }
    };

    function setVoiceWarnForItem (item, cancel) {
        let id = item.id;
        let content = item.content;
        let trigger = item.trigger;
        let disable = item.disable || cancel;
        let old = warnHandleMap[id];

        // trigger => 10 : 间隔执行
        if (/^\d+$/.test(trigger)) {
            if (old) {
                _.remove(warnIntervalArr, (item) => {
                    return item === content;
                });
            }
            if (disable) {
                return;
            }

            let count = Math.ceil(240/trigger);
            let arr = _.fill(Array(count), content);
            warnIntervalArr = warnIntervalArr.concat(arr);
            warnIntervalArr = _.shuffle(warnIntervalArr);

            if(!warnIntervalTimer){
                warnIntervalTimer = setInterval(() => {
                    let warnText = warnIntervalArr.shift();
                    warnIntervalArr.push(warnText);
                    voice(warnText);
                    ipcRenderer.send('voice_warn', warnText);
                }, 1000 * 60 * 6);
            }

        }
        // trigger => 9:00: 定时执行
        else if (/^\d+[:]\d+$/.test(trigger)) {
            if (old && old.handle) {
                old.handle.cancel();
                delete old.handle;
            }
            if (disable) {
                return;
            }
            let handle = utils.timer(trigger, () => {
                voice(content);
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
        //if (utils.isTrading() || cancel) {
            warnJodb.get().forEach((item, index) => {
                setVoiceWarnForItem(item, cancel);
            });
        //}
    }

    warnJodb.on('change', function () {
        updateVoiceWarn();
        render();
        console.log('updateVoiceWarn on change =>', warnHandleMap);
    });

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

    render();
    updateVoiceWarn();

    // --------------------------------------------------------------------

    scope.dragstart = function (e) {
        let id = $(this).data('id');
        e.originalEvent.dataTransfer.setData("Text", id);
        console.log('dragstart', id);
    };

    scope.dragover = function (e) {
        e.preventDefault();
        //e.stopPropagation();
        //e.originalEvent.dataTransfer.dropEffect = 'move';
        $(e.target).addClass(dragOverCla);
        return false;
    };

    scope.dragleave = function(e) {
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
        console.log('drop', id, distId+'', e.target)
        warnJodb.insert(id, distId+'');
        // scope.$elm.find(`#k${ id }`).insertBefore(`#k${ distId }`);
        return false;
    };

};
