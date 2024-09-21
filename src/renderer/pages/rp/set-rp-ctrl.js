/**
 *
 * Created by j on 2024/4/14.
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
    let $editor;
    let model = {};
    let isAction = false; // 是否处于激活状态

    scope.on('setRp', function (e, data) {
        brick.view.to('setRp');
        isAction = true;
        model = data || {};
        scope.emit(READY_SELECT_TAGS, model.options);
        render();
    });

    scope.on(TAG_SELECT_CHANGE, function (e, data) {
        console.log('ON_TAG_SELECT_CHANGE', data);
        if(isAction){
            model = getFormVm();
            model.content = $editor.froalaEditor('html.get', true);
            model.options = data.value;
            render();
        }
    });

    function getFormVm () {
        return $elm.find('[ic-form]').icForm();
    }

    function render () {
        scope.render('setRp', {model}, function () {
            $editor = $elm.find('#editor').froalaEditor({
                ...FroalaEditorConfig,
                height: 330,
            });
            $editor.froalaEditor('html.set', model.content || '');
        });
    }

    // ajax请求服务端前的表单数据处理
    this.before = function (fields) {
        console.log(222, fields);
        if(fields.line){
            return alert(fields.title);
        }
        fields.content = $editor.froalaEditor('html.get', true);
        //$editor.froalaEditor('destroy');
    };


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
        scope.render('setRp', {model: {}});
    };

}
