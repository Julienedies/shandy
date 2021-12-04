/**
 *
 * Created by j on 2021/12/4.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import '@julienedies/brick/dist/brick.transition.js'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'

import '../../js/utils.js'
import { FroalaEditorConfig } from '../../js/constants'

import moment from 'moment'
import voice from '../../../libs/voice'

let $body = $('body');
let socket = io();

import setTagCtrl from '../tags/set-tag-ctrl'


brick.reg('mainCtrl', function (scope) {

});

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('tagsCtrl', function (scope) {

    let model = {tags:[], rp: {}};
    // 获取视图内容并显示
    $.get('/stock/tags/').done((data) => {
        console.log(data);
        model.tags = data;
        scope.render('tags', {model});
    });

    //scope.on()

});


brick.reg('todoListCtrl', function (scope) {

    const dragOverCla = 'onDragOver';
    let filterByType = null;

    let listManager = brick.services.get('recordManager')();

    function getMapByType (arr) {
        let mapByType = {};
        arr.forEach((v, i) => {
            let arr2 = mapByType[v.type || '_null'] = mapByType[v.type || '_null'] || [];
            arr2.push(v);
        });

        //console.log(mapByType);
        return mapByType;
    }

    function render () {
        let todoArr = listManager.get();
        let mapByType = getMapByType(todoArr);
        if (filterByType) {
            todoArr = mapByType[filterByType];
        }
        //console.log(filterByType, todoArr);
        scope.render('types', {model: {mapByType: mapByType, filterByType: filterByType}});
        scope.render('todoList', {model: todoArr}, function () {
            $(this).find('tr').on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);
        });
    }


    function getRpData () {
        $.get('/stock/rp').done((data) => {
            setList(data);
        });
    }

    function setList (data) {
        listManager.init(data);
        render();
    }

    getRpData();

    scope.on('rp.change', function (e, data) {
        console.log('rp.change', data);
        setList(data);
    });

    scope.on('move', function (e, data) {
        $.post('/stock/rp/move', data).done((data) => {
            setList(data);
        });
    });

    scope.filter = function (e, type) {
        _onFilter(type);
    };

    scope.onFilterKeyChange = function (msg) {
        _onFilter(msg.value);
    };

    function _onFilter (type) {
        filterByType = type;
        render();
    }

    scope.toggle = function (e) {
        let cla = 'toggle';
        $(this).toggleClass(cla);
    };

    scope.allToggle = function (e) {
        let cla = 'toggle';
        $('.pre.text').toggleClass(cla);
    };

    scope.addTodo = function (e) {
        scope.emit('setTodo', {});
    };

    scope.edit = function (e, id) {
        scope.emit('setTodo', listManager.get(id));
    };

    scope.delBeforeConfirm = function (e) {
        return confirm('确认删除？');
    };

    scope.onDelDone = function (data) {
        setList(data);
    };

    // 置顶
    scope.focus = function (e, id) {
        //todoJodb.insert(id);
        scope.emit('move', {id});
    };

    scope.test = function (e, id) {
        let item = listManager.get(id);
        scope.activePrompt(item);
    };

    scope.complete = function (e, id, isComplete) {
        //let item = todoJodb.get2(id);
        // item.complete = !item.complete;
        //todoJodb.set(item);
    };

    scope.disable = function (e, id, isDisable) {
        //let item = todoJodb.get2(id);
        //item.disable = !item.disable;
        //todoJodb.set(item);
    };


    // ---------------------------------------------------------------------------------------
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
        scope.emit('move', {id, dist: distId + ''});
        return false;
    };
});


brick.reg('setTodoCtrl', function (scope) {

    let $elm = scope.$elm;
    let $editor;

    this.before = function (fields) {
        fields.content = $editor.froalaEditor('html.get', true);
        //$editor.froalaEditor('destroy');
    };

    this.done = function (data) {
        scope.emit('rp.change', data);
        brick.view.to('todoList');
    };

    this.reset = function () {
        scope.render('setTodo', {model: {}});
    };

    this.cancel = function (e) {
        brick.view.to('todoList');
    };

    scope.on('setTodo', function (e, msg) {
        brick.view.to('setTodo');
        let model = msg || {};
        scope.render('setTodo', {model}, function () {
            $editor = $elm.find('#editor').froalaEditor({
                ...FroalaEditorConfig,
                height: 360,
            });
            $editor.froalaEditor('html.set', model.content || '');
        });
    });

});


brick.reg('promptCtrl', function () {

    const scope = this;
    let _todoItem = null;
    let $todoContent = scope.$elm.find('#todoContent');

    scope.edit = function (e) {
        scope.emit('setTodo', _todoItem);
    };

    scope.on('prompt', function (e, todoItem) {
        brick.view.to('prompt');
        _todoItem = todoItem
        $todoContent.html(todoItem.content);
        let str = $todoContent.text();
        console.log(str, str.substr(0, 240));
        //voice(str.substr(0, 240));
    });

});


brick.reg('prepareCtrl', function (scope) {
    scope.on('prepare', function (e, _todoItem) {
        brick.view.to('prepare');
    });
});


brick.reg('mistakeCtrl', function (scope) {
    scope.on('mistake', function (e, _todoItem) {
        brick.view.to('mistake');
    });
});


brick.reg('planCtrl', function (scope) {

    $.get({
        url: '/stock/replay'
    }).done((data) => {
        //console.info(data);
        scope.render('replay', {model: data.replay});
    });

    $.get({
        url: '/stock/plan'
    }).done((data) => {
        //console.info(data);
        data.plans && data.plans.length && scope.render('plans', {model: data.plans});
    });

    scope.on('plan', function (e, _todoItem) {
        brick.view.to('plan');
    });

});



