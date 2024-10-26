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
    DEL_TAG,
    TAG_SELECT_CHANGE,
    READY_SELECT_TAGS,
    ADD_TAG,
    TAGS_CHANGE,
    FroalaEditorConfig
} from '../../js/constants'

import '../../js/utils.js'
import '../../js/common-stock.js'

import setTagCtrl from '../tags/set-tag-ctrl'
import selectTagsCtrl from '../tags/select-tags-ctrl'

import setRpCtrl from './set-rp-ctrl'
import setLineCtrl from './set-line-ctrl'

import replayCtrl from './replayCtrl'

//brick.set('ic-event.extend', 'click,change,dblclick,focus,hover');
brick.set('ic-select-cla', 'is-info');

brick.reg('setTagCtrl', setTagCtrl);
brick.reg('selectTagsCtrl', selectTagsCtrl);

brick.reg('setRpCtrl', setRpCtrl);
brick.reg('setLineCtrl', setLineCtrl);
brick.reg('replayCtrl', replayCtrl);

window.brick = brick;


brick.reg('rpListCtrl', function (scope) {

    let filterByType = '复盘&计划';  // 默认要显示的类型
    let dragOverCla = 'onDragOver';
    //let rpMap = window.RPMQS_MAP = {};
    let rpMapByType = {};

    let $elm = this.$elm;
    let $title = $('title');

    let rpForm = {};

    let isFilterLine = 0;

    let listManager = brick.services.get('recordManager')();

    scope.listManager = listManager;

    window.GET_TAGS_DEF = window.GET_TAGS_DEF || $.Deferred();

    window._GET_RP_KEY = function (rp, tagType) {
        let key = '';
        if (rp.line) {
            key = 'line.' + (rp.alias || rp.title) + '.' + tagType;
        } else {
            // 如果以.结尾，
            if (/[.]$/img.test(rp.alias)) {
                key = rp.alias + tagType;
            } else if (/-/img.test(rp.alias)) {
                key = rp.alias.replace('-', tagType);
            } else {
                key = rp.alias;
            }
        }
        //let key = rp.line ? ('line.' + rp.title + '.' + tagType) : (/[.]/img.test(rp.alias) ? rp.alias : (rp.alias + '.' + tagType));
        key = key || '';
        return key.replace(/\.-/img, '');
    };

    window._GET_RP_KEY2 = function (rp, input) {
        let key = '';
        if (rp.line) {
            key = ('line.' + rp.title) + '.' + input
        } else {
            if (/[.]/img.test(input)) {
                key = input;  // 如果input里含有.,则使用input为key
            } else if (/[.]$/img.test(rp.alias)) {
                key = rp.alias + input;  // 如果以.结尾，
            } else if (/-/img.test(rp.alias)) {
                key = rp.alias.replace('-', input);
            } else {
                key = rp.alias + '.' + input;
            }
        }
        key = key || '';
        return key.replace(/\.-/img, '');
    };

    window._IS_PLAN = function (text, type) {
        type = type || '复盘&计划';
        return text === type;
    };

    // 把rp里的options选项里的 type tag ID，换成对应tag元素组
    function getTagsForRp (arr) {
        let map = {};
        if (Array.isArray(arr)) {
            arr.forEach((typeTagId) => {
                //console.log(typeTagId);
                let tag = window.TAGS_MAP_BY_ID[typeTagId];
                let type = tag.text;
                map[type] = window.TAGS_MAP[type] || [];  // 对应的标签数组
            });
            return map;
        } else {
            return arr;
        }
    }

    // 把rp.json这个数组按type进行分组，生成一个map；
    function getRpMapByType (arr) {
        rpMapByType = {};
        arr.forEach((v, i) => {
            let type = v.type || '_null';
            let arr2 = rpMapByType[v.type || '_null'] = rpMapByType[v.type || '_null'] || [];
            arr2.push(v);
        });
        return rpMapByType;
    }

    // 渲染rpList
    function render () {
        let rpList = listManager.get();
        rpList.sort((a, b) => {
            let al = a.level || 0;
            let bl = b.level || 0;
            return bl - al;
        });

        rpMapByType = getRpMapByType(rpList);

        // 根据类型过滤
        if (filterByType) {
            if (filterByType === 'Re') {
                rpList = rpList.filter((v, i) => {
                    return v.re === 'true';
                });
            } else {
                rpList = rpMapByType[filterByType] || [];  // 某些类型因为没有添加项，rpMapByType里不存在
            }
        }

        //console.log(333, rpMapByType, rpList);
        // 对rpList数据进行处理，以方便显示
        rpList = rpList.map((item) => {
            let options = item.options;
            item._options = getTagsForRp(options);
            return item;
        });

        scope.render('types', {model: {rpMapByType: rpMapByType, filterByType: filterByType, date: rpForm.date}});

        scope.render('rpList', {model: {rpList, rpForm, filterByType}}, function () {
            /*$(this).find('li').on('dragstart', scope.dragstart)
                .on('dragover', scope.dragover)
                .on('dragleave', scope.dragleave)
                .on('drop', scope.drop);*/

            if (isFilterLine % 2) {
                isFilterLine = 0;
                scope.filterLine();
            }
        });

        // 修改document.title, 主要用于save2Text chrome插件;
        $title.text(`rp_${ filterByType }_${ formatDate() }`);
    }

    //-----------------------------------------------------------
    let getRpDef = $.Deferred();
    let getReplayDef = $.Deferred();

    function getRpData () {
        $.get('/stock/rp').done((data) => {
            getRpDef.resolve(data);
        });
    }

    function getRpForm (date, callback) {
        date = date || J_FORMAT_DATE2();
        callback = callback || function (data) {
            getReplayDef.resolve(data);
        };
        $.get(`/stock/replay?date=${ date }`).done(callback);
    }

    // 设置和更新rp数据和replay数据会render
    function setList (rpData, replayData) {
        rpData && listManager.init(rpData);

        rpForm = replayData || rpForm;
        render();
        createRpMap(rpData);  //replay2里依然有在用
    }

    // 创建 replay 里使用, 废弃，之前是因为表单字段都是Rp id, 现在直接是文字; replay2里依然有在用
    function createRpMap (rpArr) {
        window.RP_MAP = {};
        rpArr = rpArr || [];
        rpArr.forEach((v) => {
            RP_MAP[v.id + ''] = v;
        })
    }

    // 等待标签数据获取后，否则 TAGS_MAP_BY_ID 不存在
    //scope.on(GET_TAGS_DONE, function (e, data) {
    $.when(window.GET_TAGS_DEF, getRpDef, getReplayDef).done((d1, d2, d3) => {
        console.log('when', d1, d2, d3);
        setList(d2, d3);
    });
    // });

    // 处理tag数据改变事件
    scope.on(TAGS_CHANGE, function (e, data) {
        console.log('on TAGS_CHANGE');
        render();
    });

    // main
    getRpData();
    getRpForm();


    scope.reset = function () {
        $elm.find('#rpPlanItem').text('');
    };


    scope.filter = scope.onFilterKeyChange2 = function (e, type) {
        _onFilter(type);
    };

    scope.onFilterKeyChange = function (msg) {
        _onFilter(msg.value);
    };

    function _onFilter (type) {
        filterByType = type;
        render();
    }

    // group
    scope.onGroupsChange = function (msg) {
        //console.log(msg);
        let val = msg.value;
        if (val) {
            let $target = $(`ul li[tabindex=${ val }]`);
            if ($target.length) {
                let targetPosition = $target.position().top + $elm.scrollTop();
                //console.log($target[0], $target.offset().top, targetPosition);
                $elm.animate({scrollTop: targetPosition-90}, 300);
            }
        }

    };

    // 筛选line
    scope.filterLine = function () {
        ++isFilterLine;
        $elm.find('li.box').not('.line').toggle();
    };

    scope.toggleForm = function (e) {
        $elm.find('#mainFooter').toggle();
    };

    scope.toggleText = function (e) {
        let cla = 'shrink';
        $elm.toggleClass(cla);
        let $th = $(this).text($elm.hasClass(cla) ? '收缩模式' : '展开模式');
    };

    scope.toggleWrap = function (e) {
        let cla = 'shrink';
        $(this).next().toggleClass(cla);
        return false;
    };

    scope.togglePre = function(e){
        let cla = 'shrink';
        $(this).toggleClass(cla);
        return false;
    };

    // 根据rp去创建tag
    scope.createTagByRp = function (e, id) {
        let rp = listManager.get(id);
        scope.emit(ADD_TAG, {type: rp.type, text: rp.title});
        return false;
    };

    // 刷新页面标签数据，主要是处理 electron里修改了标签; 目前好像没有使用
    /*scope.refreshTags = function (e) {
        scope.emit(TAGS_CHANGE);
    };*/

    scope.addRp = function (e) {
        scope.emit('setRp', {type: filterByType});
    };

    // 编辑一个rp
    scope.edit = function (e, id) {
        scope.emit('setRp', listManager.get(id));
    };

    // 拷贝一个rp
    scope.copy = function (e, id, isLine) {
        let item = listManager.get(id);
        delete item.id;
        scope.emit(isLine ? 'SET_LINE' : 'setRp', item);
    };

    // 删除前确认
    scope.delBeforeConfirm = function (e) {
        return confirm('确认删除？');
    };

    // 当删除一个rp以后
    scope.onDelRpDone = function (data) {
        setList(data);
    };

    // 添加主线热点
    /* scope.addLine = function (e, id) {
         scope.emit('addLine', listManager.get(id));
     };*/

    // 添加或修改一个line
    scope.setLine = function (e, id) {
        let line = id ? listManager.get(id) : null;
        scope.emit('SET_LINE', line);
    };

    // re
    scope.re = function (e, id) {
        let item = listManager.get(id);
        item.re = item.re === 'true' ? 'false' : 'true';
        $.post('/stock/rp', item).done((data) => {
            $.icMsg(data && data.length);
            setList(data);
        });
    };

    // 置顶
    scope.focus = function (e, id) {
        // scope.emit('move', {id});
    };

    // 加权
    scope.plus = function (e, id) {
        let item = listManager.get(id);
        let level = (item.level || 1) * 1;
        item.level = level + 1;
        $.post('/stock/rp', item).done((data) => {
            setList(data);
        });
    };


    // 创建复盘&交易计划的表格
    scope.createReplay = function (e) {
        scope.emit('createReplay', rpForm);
    };

    // ---------------------------------------------------------------------------------------

    scope.on('rp.change', function (e, data) {
        setList(data);
    });

    $(document.body).on('dblclick', () => {
        console.log('dblclick');
        scope.toggleForm();
    });


    // 获取复盘表单数据的ajax回调函数
    scope.replay = {
        before: function (fields) {
            console.info('rpForm 提交前check =》', fields);
            if (checkFrom()) {
                return fields;
            }
            return false;
        },
        done: function (data) {
            rpForm = data || rpForm;
        }
    };

    // 提交表单需要查看是否处在 '复盘&计划' 状态中
    function checkFrom () {
        if (filterByType === '复盘&计划') {
            return true;
        } else {
            alert('必须在 切换到 复盘&计划 中，才能提交复盘数据，否则会损坏数据.');
            return false;
        }
    }

    // 提交复盘表单
    function submit () {
        if (checkFrom()) {
            $elm.find('#rpForm[ic-form="rp"]').icFormSubmit();
        }
    }

    // 当表单日期改变，可以查看修改对应日期的复盘表单
        scope.onDateChange = function (e) {
            let date = $(this).val();
            getRpForm(date, (data) => {
                setList(null, data);
                $('#dateTag').text(date);
            });
        };

    // 根据键盘输入，随时提交数据进行保存；
    $elm.on('keyup', 'textarea', _.throttle(submit, 2900));


    // 根据复盘表单选项改变， 随时提交表单数据保存
    $elm.on('ic-select.change', '[ic-select][ic-form-field]', function (e, msg) {
        console.log('on ic-select.change, to submit();', msg);
        submit();
        // let data = $elm.find('[ic-form="rp"]').icForm();
        // let $th = $(this);
        // let name = $th.attr('ic-form-field');
        // console.log('form => ',data);
        //model.replay[name] = $th.attr('ic-val');
    });


    // ---------------------------------------------------------------------------------------
    // 拖动排序是通过修改level实现的
    scope.on('move', function (e, data) {
        console.log('move', data);
        let id = data.id;
        let dest = data.dest;
        let a = listManager.get(id);
        let b = listManager.get(dest);
        a.level = b.level * 1 + 1;
        $.post('/stock/rp', a).done((data) => {
            setList(data);
        });
        /*        $.post('/stock/rp/move', data).done((data) => {
                    setList(data);
                });*/
    });


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
            $(e.target).removeClass(dragOverCla);
            return console.log('not dist');
        }

        //console.log('drop', id, destId + '', e.target);
        scope.emit('move', {id, dest: destId + ''});
        return false;
    };
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


/*brick.reg('tagsCtrl', function (scope) {

    alert(1);
    console.log(222);

    let model = {tags: {}, rp: {}};

    // tags数据保存在setTagCtrl
    scope.on(GET_TAGS_DONE, function (e, data) {
        //console.log(data);
        model.options = data;
        render();
    });

    scope.on('setRp', function (e, data) {
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

});*/


/*brick.reg('replayCtrl', function () {

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

});*/


/*brick.reg('prepareCtrl', function (scope) {
    scope.on('prepare', function (e, _todoItem) {
        brick.view.to('prepare');
    });
});*/


/*brick.reg('mistakeCtrl', function (scope) {
    scope.on('mistake', function (e, _todoItem) {
        brick.view.to('mistake');
    });
});*/





