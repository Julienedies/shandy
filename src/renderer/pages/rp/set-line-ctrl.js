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
    let tags = {}; // tags_map
    let isAction = false;

    const SET_LINE = 'SET_LINE';
    const _SET_LINE = 'setLine';

    function getFormVm () {
        return $elm.find('[ic-form]').icForm();
    }

    function render () {
        scope.render(_SET_LINE, { line: vm, tags });
    }

    // 接收SET_LINE事件并处理
    scope.on(SET_LINE, function (e, data) {
        brick.view.to(_SET_LINE);
        isAction = true;
        vm = data || {};
        scope.emit(READY_SELECT_TAGS, vm.options);
        render();
    });

    // 从set-tag ctrl 获取最新的tagsMap数据
    scope.on(GET_TAGS_DONE, (e, data) => {
        tags = data;
    });

    scope.on(TAG_SELECT_CHANGE, function (e, data) {
        console.log('ON_TAG_SELECT_CHANGE', data);
        if(isAction){
            vm = getFormVm();
            vm.options = data.value;
            render();
        }
    });



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
        isAction = false;
    };


    this.cancel = function (e) {
        brick.view.to('rpList');
        isAction = false;
    };


    this.reset = function () {

    };


}
