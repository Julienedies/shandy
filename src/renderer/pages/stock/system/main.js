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

import setTagCtrl from '../tags/set-tag-ctrl'

const ADD_SYSTEM = 'ADD_SYSTEM';
const ON_SET_SYSTEM_DONE = 'ON_SET_SYSTEM_DONE';
const EDIT_SYSTEM = 'EDIT_SYSTEM';

//brick.set('debug', true)

brick.reg('setTagCtrl', setTagCtrl)

brick.reg('systemCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let model = {};  // 存储ajax数据： stock/system
    let viewId = null;

    scope.onGetSystemDone = function (data) {
        console.info(data);
        model = data;
        list.init(data.system);
        scope.render('systemList', data.system);
    };

    scope.addSystem = function () {
        scope.emit(ADD_SYSTEM, {system: {}, tags: model.tags});
    };

    scope.edit = function (e, id) {
        let arr = list.get(id);
        scope.emit(EDIT_SYSTEM, {system: arr[0], tags: model.tags});
        return false;
    };

    scope.view = function (e, id) {
        viewId = id;
        let system = list.get(id)[0];
        scope.render('details', {model: system});
    };

    scope.onDeleteDone = function () {
        $(this).closest('li').remove();
    };

    scope.on(ON_SET_SYSTEM_DONE, function (e, msg) {
        //$elm.find('#getSystem').click();
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
    let tags = brick.services.get('recordManager')();

    function render (data) {
        tags.init(scope.tags_convert(data));
        model.tags = data;
        model.system = $elm.find('[ic-form="system"]').icForm();
        scope.render(model);
    }

    function edit (e, msg) {
        model = msg || _model;
        tags.init(scope.tags_convert(model.tags));
        scope.render('setSystem', model);
        $elm.icPopup(true);
    }

    scope.submitBefore = function (data) {
        console.log(222,data);
    };

    scope.reset = function () {
        scope.render(_model);
    };

    // 添加或修改完成
    scope.done = function (data) {
        console.log(data);
        $elm.icPopup(false);
        scope.emit(ON_SET_SYSTEM_DONE, data);
    };


    scope.tag_edit = function (e, id) {
        scope.emit('tag.edit', tags.get(id));
    };

    scope.tag_remove_done = render;

    scope.on(ADD_SYSTEM, edit);
    scope.on(EDIT_SYSTEM, edit);

    scope.on('tag.edit.done', function (e, data) {
        render(data);
    });


    /**
     *
     * @param data {Array} 图片路径数组, 可以是绝对路径或者url
     * @returns {boolean}
     */
    scope.onSelectPathDone = function (data) {
        // 获取表单数据model
        let systemVm = $elm.find('[ic-form="setSystem"]').icForm();
        systemVm['示例图片'] = systemVm['示例图片'] || [];
        data.forEach((path, i) => {
            let url = `/file/?path=${ encodeURIComponent(path) }`;
            systemVm['示例图片'].push(url);
        });
        Object.assign(model.system, systemVm);
        console.log(model);
        scope.render('setSystem', model);
        return false;
    };


});
