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

import '../../js/utils.js'
import '../../js/common-stock.js'
import setTagCtrl from '../tags/set-tag-ctrl'
import selectTagsCtrl from '../tags/select-tags-ctrl'

//brick.set('ic-event.extend', 'click,change,dblclick,focus,hover');

brick.set('ic-select-cla', 'is-info');

brick.reg('setTagCtrl', setTagCtrl);
brick.reg('selectTagsCtrl', selectTagsCtrl);


brick.reg('todoListCtrl', function (scope) {

    const dragOverCla = 'onDragOver';
    let filterByType = 'rp';
    let rpMap = window.RPMQS_MAP = {};

    let $elm = this.$elm;

    let rpForm = {};

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
        let rpList = listManager.get();
        let mapByType = getMapByType(rpList);
        if (filterByType) {
            rpList = mapByType[filterByType];
        }
        //console.log(filterByType, todoArr);
        scope.render('types', {model: {mapByType: mapByType, filterByType: filterByType}});

        scope.render('todoList', {model: {rpList, rpForm}}, function () {
            $(this).find('li').on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);
        });
    }

    //-----------------------------------------------------------
    let def2 = $.Deferred();
    let def3 = $.Deferred();

    function getRpData () {
        $.get('/stock/rp').done((data) => {
            def2.resolve(data);
        });
    }

    function getRpForm () {
        $.get(`/stock/replay?date=${ formatDate2() }`).done((data) => {
            def3.resolve(data);
        });
    }

    function setList (d2, d3) {
        listManager.init(d2);
        rpForm = d3 || rpForm;
        render();
    }

    // 等待标签数据获取后，否则 TAGS_MAP_BY_ID 不存在
    scope.on(GET_TAGS_DONE, function (e, data) {
        $.when(window.GET_TAGS_DEF, def2, def3).done((d1, d2, d3) => {
            console.log('when', d2, d3);
            setList(d2, d3);
        });
    });

    getRpData();
    getRpForm();

    function submit () {
        $elm.find('[ic-form="rp"]').icFormSubmit();
    }

    $elm.on('keyup', 'textarea', _.throttle(submit, 900));

    scope.on('rp.change', function (e, data) {
        setList(data);
    });

    scope.on('move', function (e, data) {
        $.post('/stock/rp/move', data).done((data) => {
            setList(data);
        });
    });

    scope.replay = {
        before: function (fields) {
            console.info(fields);
            return fields;
        },
        done: function (data) {
            //$.icMsg(JSON.stringify(data.replay));
            rpForm = data || rpForm;
        }
    };

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
        $(this).nextAll().find('.pre.text').toggle();
    };

    scope.toggleForm = function (e) {
        $elm.find('#mainFooter').toggle();
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



    $elm.on('ic-select.change', '[ic-select][ic-form-field]', function (e) {
        let data = $elm.find('[ic-form="rp"]').icForm();
        let $th = $(this)
        let name = $th.attr('ic-form-field')
        model.replay[name] = $th.attr('ic-val')
    });



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


brick.reg('replayCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    let list = brick.services.get('recordManager')();
    let model;

    scope.onGetReplayDone = function (data) {
        console.info(data);
        list.init(scope.tags_convert(data.tags));
        model = data;
        scope.render('replay', data);
    };

    scope.replay = {
        before: function (fields) {
            console.info(fields);
            return fields;
        },
        done: function (data) {
            scope.onGetReplayDone(data);
            $.icMsg(JSON.stringify(data.replay));
        }
    };

    scope.tag_edit = function (e, id) {
        scope.emit('tag.edit', list.get(id));
    };

    scope.tag_remove_done = function (data) {
        model.replay = $elm.find('[ic-form="replay"]').icForm();
        model.tags = data;
        scope.onGetReplayDone(model);
    };


    scope.on('tag.edit.done', function (e, msg) {
        console.info(e, msg);
        scope.tag_remove_done(msg);
    });


    $elm.on('ic-select.change', '[ic-select][ic-form-field]', function (e) {
        let $th = $(this)
        let name = $th.attr('ic-form-field')
        model.replay[name] = $th.attr('ic-val')
    });

    $.get(`/stock/replay?date=${ formatDate() }`).done(scope.onGetReplayDone);

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



