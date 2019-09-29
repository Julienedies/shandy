/*!
 * Created by j on 2019-02-22.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common.js'
import '../../../js/common-stock.js'
import '../../../js/utils.js'

import C from '../../../js/constants.js'

import setTagCtrl from '../tags/set-tag-ctrl'

//brick.set('debug', true)
//brick.set('ic-event.extend', 'click,change,drag,drop,dragover')

brick.set('ic-select-cla', 'is-info');

brick.reg('setTagCtrl', setTagCtrl)

brick.reg('systemCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let $details = $elm.find('[ic-popup="details"]')
    let list = brick.services.get('recordManager')();
    let model = {};  // 存储ajax数据： stock/system
    let viewId = null;

    scope.dragstart = function (e) {
        console.log(1111, e, this)
        let id = $(this).data('id');
        e.originalEvent.dataTransfer.setData("Text", id);
    };

    scope.dragover = function (e) {
        e.preventDefault();
        e.stopPropagation();
        //e.originalEvent.dataTransfer.dropEffect = 'move';
        //console.log(4444, e.target)
        let $target = $(e.target);
        //$target.css('border', 'solid 1px blue');
        return false;
    };

    scope.drop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(333, e.target)
        let $target = $(e.target);
        let id = e.originalEvent.dataTransfer.getData("Text");
        let distId = $target.data('id') || $target.closest('li[data-id]').data('id');
        if (!distId || distId === id) {
            return console.log('not dist');
        }
        $elm.find(`#k${ id }`).insertBefore(`#k${ distId }`);
        $.ajax(`/stock/system/move/${ id }/${ distId }`).done((data) => {
            //brick.controllers.get('systemCtrl').onGetSystemDone(data);
        });
        return false;
    };

    scope.onGetSystemDone = function (data) {
        console.info(data);
        model = data;
        list.init(data.system);
        scope.render('mqElement', data.tags['行情要素']);
        scope.render('systemList', data.system, function () {
            console.log(this);
            $(this).find('>li').on('dragstart', scope.dragstart).on('dragover', scope.dragover).on('drop', scope.drop);
        });
    };

    scope.addSystem = function () {
        scope.emit(C.ADD_SYSTEM, {system: {}, tags: model.tags});
    };

    scope.edit = function (e, id) {
        let arr = list.get(id);
        scope.emit(C.EDIT_SYSTEM, {system: arr[0], tags: model.tags});
        return false;
    };

    scope.view = function (e, id) {
        viewId = id;
        let system = list.get(id)[0];
        scope.render('details', {model: system});
    };

    scope.view2 = function (e, id) {
        console.log(e.target.tagName)
        /*        if(!/li/img.test(e.target.tagName)){
                    return;
                }*/
        viewId = id;
        let system = list.get(id)[0];
        scope.render('details', {model: system});
        $details.icPopup(true);
    };

    scope.onDeleteDone = function () {
        $(this).closest('li').remove();
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
        for(let i in data){
            let v = data[i];
            if(Array.isArray(v) && v.length===0){
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
