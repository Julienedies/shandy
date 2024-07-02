/*!
 * Created by j on 2019-02-22.
 */

import 'babel-polyfill'

import './index.html'
import '../../css/common/common.scss'
import '../viewer/icViewer.scss'
import './style.scss'


import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'
import '../../js/common-stock.js'
import '../../js/utils.js'

import C from '../../js/constants.js'

import setTagCtrl from '../tags/set-tag-ctrl'
import viewerMarkTagCtrl from '../viewer/markTag-ctrl'

import bridge from '../../../libs/utils'
import attachCtrl from '../viewer/attach-ctrl'

const setting = bridge.setting();
//brick.set('debug', true)
//brick.set('ic-event.extend', 'click,change,drag,drop,dragover')


window.TAGS_FILTER = ['交易风险','行情类型', '目标行情', '行情驱动因素'];

brick.set('ic-select-cla', 'is-info');

brick.set('ic-viewer-interval', setting.get('icViewerInterval'));



///////////////////////////////////////////
/*function handleStopWheel(e) {
    e.preventDefault();
}

window.addEventListener("wheel", handleStopWheel, {
    passive: false
})

$(document).on('scroll', function (e){
    console.log(111, e);
// 禁止事件的默认行为
    e.preventDefault();
    // 禁止事件继续传播
    e.stopPropagation();
    return false;
});*/
///////////////////////////////////////////////////

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('viewerMarkTagCtrl', viewerMarkTagCtrl);

brick.reg('viewerAttachCtrl', attachCtrl);



brick.reg('systemCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let $details = $elm.find('[ic-popup="details"]')
    let systemManager = brick.services.get('recordManager')();
    let model = {};  // 存储ajax数据： stock/system
    let viewId = null;

    scope.vm = {};

    // 根据条件筛选交易系统
    scope.onConditionChange = function (e) {
        console.log(e);
        let filterArr = e.value;
        model.system.sort((a, b) => {
            let condArrA = a['交易系统条件'] || [null];
            let interArrA = _.intersection(filterArr, condArrA);
            let condArrB = b['交易系统条件'] || [null];
            let interArrB = _.intersection(filterArr, condArrB);
            return interArrB.length / condArrB.length - interArrA.length / condArrA.length;
        });
        scope.render('systemList', model.system);
    };

    // markTag模块也会调用ajax：/stock/system，所以页面实际会执行两次
    scope.onGetSystemDone = function (data) {
        console.info(data);
        model = data;
        systemManager.init(data.system);
        //scope.render('mqElement', data.tags['行情要素']);
        scope.render('condition', data.tags['交易系统条件']);
        scope.render('systemList', data.system, function () {
            $(this).find('>li')
                .on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('drop', scope.drop)
                .on('dragleave', scope.dragleave);
        });
    };

    scope.addSystem = function () {
        scope.emit(C.ADD_SYSTEM, {system: {}, tags: model.tags});
    };

    scope.edit = function (e, id) {
        scope.emit(C.EDIT_SYSTEM, {system: systemManager.get(id), tags: model.tags});
        return false;
    };

    scope.view = function (e, id) {
        viewId = id;
        let system = systemManager.get(id);
        scope.render('details', {model: system});
    };

    scope.view2 = function (e, id) {
        console.log(e.target.tagName)
        /*        if(!/li/img.test(e.target.tagName)){
                    return;
                }*/
        viewId = id;
        let system = systemManager.get(id);
        scope.render('details', {model: system});
        //$details.icPopup(true);
    };

    scope.onDeleteDone = function () {
        $(this).closest('li').remove();
    };

    // 刷新标签图片列表回调
    scope.onRefreshed = function (data) {
        alert(data);
    };

    scope.on(C.ON_SET_SYSTEM_DONE, function (e, msg) {
        console.info('ON_SET_SYSTEM_DONE =>', msg);
        scope.onGetSystemDone(msg);
        if (viewId) {
            scope.view({}, viewId);
        }
    });

    scope.on('tag.edit.done', function (e, data) {
        model.tags = data;
    });


    scope.dragstart = function (e) {
        let id = $(this).data('id');
        e.originalEvent.dataTransfer.setData("Text", id);
    };

    scope.dragover = function (e) {
        e.preventDefault();
        //e.stopPropagation();
        //e.originalEvent.dataTransfer.dropEffect = 'move';
        //console.log(4444, e.target)
        $(e.target).addClass('onDragOver');
        return false;
    };

    scope.dragleave = function (e) {
        $(e.target).removeClass('onDragOver');
    };

    scope.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        let $target = $(e.target);
        let id = e.originalEvent.dataTransfer.getData("Text");
        let distId = $target.data('id') || $target.closest('li[data-id]').data('id');
        if (!distId || distId === id) {
            return console.log('not dist');
        }
        //$elm.find(`#k${ id }`).insertBefore(`#k${ distId }`);
        $.ajax(`/stock/system/move/${ id }/${ distId }`).done((data) => {
            scope.onGetSystemDone(data);
        });
        return false;
    };

});




brick.reg('setSystemCtrl', function () {

    let scope = this;
    let $elm = this.$elm;
    let _model = {system: {}, tags: {}};
    let model = _model;
    let tagsManager = brick.services.get('recordManager')();

    // 获取表单数据model
    function getFormVm () {
        return $elm.find('[ic-form="setSystem"]').icForm();
    }

    function render (data) {
        tagsManager.init(scope.tagsMap2Arr(data));
        model.tags = data;
        model.system = getFormVm();
        scope.render(model);
    }

    function edit (e, msg) {
        model = msg || _model;
        tagsManager.init(scope.tagsMap2Arr(model.tags));
        scope.render(model);
        $elm.icPopup(true);
    }

    scope.submitBefore = function (data) {
        // note: 如果上传数据的值是空数组[]，则被jquery忽略，所以把[]替换为''，才能覆盖旧值;
        for (let i in data) {
            let v = data[i];
            if (Array.isArray(v) && v.length === 0) {
                data[i] = '';
            }
        }
        console.log('submitBefore =>', data);
    };

    scope.reset = function () {
        scope.render(_model);
    };

    // 添加或修改完成
    scope.done = function (data) {
        console.log(data);
        $elm.icPopup(false);
        scope.emit(C.ON_SET_SYSTEM_DONE, data);
    };

    scope.editTag = function (e, id) {
        scope.emit('tag.edit', tagsManager.get(id));
    };

    scope.onTagDeleteDone = render;

    scope.on(C.ADD_SYSTEM, edit);
    scope.on(C.EDIT_SYSTEM, edit);

    scope.on('tag.edit.done', function (e, data) {
        render(data);
    });

    /**
     * @param paths {Array} 图片路径数组, 可以是绝对路径或者url
     * @returns {boolean}
     */
    scope.onSelectPathDone = function (paths) {
        if (!paths) return false;
        let obj = getFormVm();
        obj['示例图片'] = obj['示例图片'] || [];
        paths.forEach((path, i) => {
            obj['示例图片'].push(path);
        });
        Object.assign(model.system, obj);
        scope.render(model);
        return false;
    };

});


