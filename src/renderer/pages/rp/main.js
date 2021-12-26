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

import {
    GET_TAGS_DONE,
    ON_SET_TAG_DONE,
    ON_DEL_TAG_DONE,
    DEL_TAG,
    TAG_SELECT_CHANGE,
    READY_SELECT_TAGS,
    TAGS_CHANGE,
    FroalaEditorConfig
} from '../../js/constants'

import '../../js/common-stock.js'
import setTagCtrl from '../tags/set-tag-ctrl'
import selectTagsCtrl from '../tags/select-tags-ctrl'

brick.set('ic-select-cla', 'is-info');

brick.reg('setTagCtrl', setTagCtrl);
brick.reg('selectTagsCtrl', selectTagsCtrl);


brick.reg('todoListCtrl', function (scope) {

    const dragOverCla = 'onDragOver';
    let filterByType = 'rp';
    let rpMap = window.RPMQS_MAP = {};

    let listManager = brick.services.get('recordManager')();

    function getMapByType (arr) {
        let mapByType = {};
        let rpmqs = TAGS_MAP['rpmqs'];
        for(let i in rpmqs) {
            let o = rpmqs[i];
            let key = o.key;
            mapByType[key] = [];
            rpMap[key] = o.text;
        }

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
            $(this).find('li').on('dragstart', scope.dragstart)
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

    // 等待标签数据获取后，否则 TAGS_MAP_BY_ID 不存在
    scope.on(GET_TAGS_DONE, function (e, data) {
        getRpData();
    });


    scope.on('rp.change', function (e, data) {
        //console.log('rp.change', data);
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
    };

    scope.toggle = function (e) {
        $(this).nextAll().find('.pre.text').toggle();
    };

    scope.allToggle = function (e) {
        let cla = 'toggle';
        $('.pre.text').toggleClass(cla);
    };

    scope.refreshTags = function (e) {
        scope.emit(TAGS_CHANGE);
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
        scope.emit('move', {id});
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
        let destId = $target.data('id') || $target.closest('li[data-id]').data('id');
        if (!destId || destId === id) {
            return console.log('not dist');
        }
        //console.log('drop', id, destId + '', e.target);
        scope.emit('move', {id, dest: destId + ''});
        return false;
    };
});


brick.reg('setTodoCtrl', function (scope) {

    let $elm = scope.$elm;
    let $editor;
    let model = {};

    scope.on('setTodo', function (e, data) {
        brick.view.to('setTodo');
        model = data || {};
        scope.emit(READY_SELECT_TAGS, model.tags);
        render();
    });

    scope.on(TAG_SELECT_CHANGE, function (e, data) {
        console.log('ON_TAG_SELECT_CHANGE', data);
        model = getFormVm();
        model.content = $editor.froalaEditor('html.get', true);
        model.tags = data.value;
        render();
    });

    function getFormVm () {
        return $elm.find('[ic-form]').icForm();
    }

    function render () {
        scope.render('setTodo', {model}, function () {
            $editor = $elm.find('#editor').froalaEditor({
                ...FroalaEditorConfig,
                height: 360,
            });
            $editor.froalaEditor('html.set', model.content || '');
        });
    }

    // ajax请求服务端前的表单数据处理
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


});


brick.reg('tagsCtrl', function (scope) {

    let model = {tags: {}, rp: {}};

    // tags数据保存在setTagCtrl
    scope.on(GET_TAGS_DONE, function (e, data) {
        //console.log(data);
        model.tags = data;
        render();
    });

    scope.on('setTodo', function (e, data) {
        model.rp = data || {};
        render();
    });

    // tag select change
    scope.onChange = function (data) {
        model.rp.tags = data.value;
        scope.emit(TAG_SELECT_CHANGE, data);
    };

    function render () {
        scope.render('tags', {model});
    }

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



