/**
 *
 * Created by j on 2024/8/10.
 */


import $ from 'jquery'
import brick from '@julienedies/brick'
import {
    EDIT_TAG,
    ADD_TAG,
    DEL_TAG,
    GET_TAGS_DONE,
    ON_DEL_TAG_DONE,
    TAGS_CHANGE,
    READY_SELECT_TAGS,
    TAG_SELECT_CHANGE, FroalaEditorConfig
} from '../../js/constants'


export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let vm = {};
    let rp = {};
    let tags = {}; // tags_map

    const _ADD_Line = 'addLine';

    scope.on(_ADD_Line, function (e, data) {
        brick.view.to(_ADD_Line);
        rp = data || {};
        scope.render(_ADD_Line, { line: {}, tags }, function () {

        });
    });

    // 从set-tag ctrl 获取最新的tagsMap数据
    scope.on(GET_TAGS_DONE, (e, data) => {
        console.log(777, data);
        tags = data;
    });

    scope.on(TAG_SELECT_CHANGE, function (e, data) {
        console.log('ON_TAG_SELECT_CHANGE', data);
        vm = getFormVm();
        vm.options = data.value;
        render();
    });

    function getFormVm () {
        return $elm.find('[ic-form]').icForm();
    }

    function render () {
        /*scope.render(_ADD_ITEM, { vm }, function () {

        });*/
    }

    // 提交保存表单数据
    this.submit = function (fields) {
        console.log(666, fields);
    };

    // ajax请求服务端前的表单数据处理
    this.before = function (fields) {
    };

    // 表单提交完成后
    this.done = function (data) {
        scope.emit('rp.change', data);
        brick.view.to('rpList');
    };

    this.reset = function () {
        scope.render(_ADD_Line, {model: {}});
    };

    this.cancel = function (e) {
        brick.view.to('rpList');
    };


}
