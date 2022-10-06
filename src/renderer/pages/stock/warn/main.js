/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import '@julienedies/brick/dist/brick.transition.js'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'

import '../../../js/utils'
import '../../../js/common-stock.js'
import { FroalaEditorConfig, SET_TODO, SET_TODO_DONE } from '../../../js/constants'

brick.reg('todoCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let $title = $('title');
    let list = brick.services.get('recordManager')();

    scope.mapByType = {};
    scope.mapForTag = {};
    scope.filterByType = '错误';

    function getMapByType (arr) {
        let mapByType = {};
        let mapForTag = {};
        arr.forEach((v, i) => {
            let arr2 = mapByType[v.type || '_null'] = mapByType[v.type || '_null'] || [];
            arr2.push(v);
            let arr3 = mapForTag[v.tag || 'null_'] = mapForTag[v.tag || 'null_'] || [];
            arr3.push(v);
        });

        console.log(mapByType, mapForTag);
        scope.mapForTag = mapForTag;
        scope.mapByType = mapByType;
    }


    function render () {
        let todoArr = list.get();
        let mapByType = scope.mapByType;
        let mapForTag = scope.mapForTag;
        let filterByType = scope.filterByType;

        if (filterByType) {
            todoArr = mapByType[filterByType] || mapForTag[filterByType];
        }

        todoArr.sort((a, b) => {
            let al = a.level || 0;
            let bl = b.level || 0;
            return bl - al;
        });

        $.icMsg(`render ${ filterByType } => ${ todoArr.length }`);
        scope.render('types', scope);
        scope.render('list', todoArr);

        $title.text(`todo_${ scope.filterByType }_${ formatDate() }`);
    }

    function _onFilter (type) {
        scope.filterByType = type;
        render();
    }

    this.onGetTodoDone = function (data) {
        list.init(data);
        getMapByType(data);
        render();
    };
    this.onGetWarnDone = function (data) {
        scope.render('list', data);
    };

    scope.onFilterKeyChange = function (msg) {
        _onFilter(msg.value);
    };

    scope.allToggle = function (e) {
        let cla = 'shirk';
        $elm.toggleClass(cla);
        $(this).text($elm.hasClass(cla) ? '精简模式' : '展开模式');
    };

    scope.toggle = function (e) {
        let cla = 'toggle';
        $(this).toggleClass(cla);
    };

    this.edit = function (e, id) {
        let item = id ? list.get2(id) : {};
        scope.emit(SET_TODO, item);
    };

    // 加权
    scope.plus = function (e, id) {
        let item = list.get(id);
        let level = (item.level || 1) * 1;
        item.level = level + 5;
        $.post('/stock/todo', item).done((data) => {
            scope.onGetTodoDone(data);
        });
    };

    scope.delBeforeConfirm = function (e) {
        return confirm('确认删除？');
    };

    scope.onDelDone = function (data) {
        scope.onGetTodoDone(data);
    };

/*    scope.rm = function (e, id) {
        if (confirm('确认删除？')) {
            $.del(`/stock/todo/${ id }`, function (data) {
                scope.onGetTodoDone(data);
            });
        }
    };*/

    this.on(SET_TODO_DONE, function (e, data) {
        scope.onGetTodoDone(data);
    });

});


brick.reg('setTodoCtrl', function (scope) {

    let $elm = scope.$elm;
    let $editor;

    this.save = function (fields) {
        //console.log(fields);
        fields.content = $editor.froalaEditor('html.get', true);
        $.post('/stock/todo', fields).done((data) => {
            console.log(data);
            brick.view.to('todoList');
            scope.emit(SET_TODO_DONE, data);
        });

        //$editor.froalaEditor('destroy');
        /* console.log(result);
         let item = result[0];
         let id = 'k'+item.id;
         scope.emit('scrollToNewItem', id);*/
    };

    this.reset = function () {
        scope.render('setTodo', {model: {}});
    };

    this.cancel = function (e) {
        brick.view.to('todoList');
    };

    scope.on(SET_TODO, function (e, model) {
        brick.view.to('setTodo');
        model = model || {};
        scope.render('setTodo', {model}, function () {
            $editor = $elm.find('#editor').froalaEditor({
                ...FroalaEditorConfig,
                height: 420,
            });
            $editor.froalaEditor('html.set', model.content || '');
        });
    });

});
