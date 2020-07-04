/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import { ADD_LOGIC, EDIT_LOGIC, DEL_LOGIC, ON_DEL_LOGIC_DONE, ON_SET_LOGIC_DONE, ON_GET_LOGIC_DONE, ON_GET_TAGS_DONE, } from '../../../js/constants'

import utils from '../../../js/utils'
import '../../../js/common-stock.js'
import Reader from '../../../../libs/reader'

import setTagCtrl from '../../tags/set-tag-ctrl'

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('logicCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let $title = $('title');
    let recordManager = brick.services.get('recordManager')();
    let sortType = brick.utils.get_query('sort') || 'time';
    let isSortByTime = sortType === 'time';
    let isReverse = false;
    let logicArr = [];  // 当前显示的logic数组

    scope.tagMap = {};
    scope.author = undefined;
    scope.tagsMap = {};


    let reader;  // 语音阅读器

    let updateLogic = () => {
        let tag = scope.author;
        logicArr = tag !== undefined ? recordManager.get((item, index) => {
            return item.author === tag || String(item.author) === tag || (item.type && item.type.includes(tag));
        }) : recordManager.get();
    };

    let render = () => {
        updateLogic();
        console.log('isSortByTime =>', isSortByTime);
        if (isSortByTime) {
            // 原始数据是sort排序，list.get是拷贝数据，所以会始终保留原始排序数据
        } else {
            logicArr.sort((a, b) => {
                a = a.level || 0;
                b = b.level || 0;
                return b * 1 - a * 1;
            });
        }

        let date = (new Date()).toLocaleDateString().replace(/\//img, '-');
        $title.text(`logic_${ scope.author || sortType }_${ date }`);
        isReverse && logicArr.reverse();
        scope.render('logic', logicArr);
    };

    // 文本语音阅读
    this.createReader = () => {
        reader = new Reader('#logicList');
        reader.init();
    };

    // 切换显示logic文本的附属内容，比如标签和级别等
    this.toggleFull = function (e) {
        scope.$elm.find('#logicList .tar').toggle();
    };

    this.onGetLogicDone = function (data) {
        recordManager.init(data);
        let tags = [];
        let types = [];
        data.map((item, index) => {
            let tag = item.author;
            let type = item.type;
            if (tag) {
                tags.push(tag);
            }
            if (type) {
                type.forEach((v) => {
                    types.push(v);
                });
            }
        });
        scope.authorMap = _.countBy(tags);
        scope.typeMap = _.countBy(types);
        let tagArr = [];
        let typeArr = [];
        tagArr = _.keys(scope.authorMap);
        typeArr = _.keys(scope.typeMap);
        tagArr.sort(utils.sortByPy);
        typeArr.sort(utils.sortByPy);
        scope.authorArr = tagArr;
        scope.typeArr = typeArr;
        scope.render('tags', scope);
        render();
    };

    // 时间或级别排序方式改变
    scope.onSortChange = function (arg) {
        sortType = arg.value;
        isSortByTime = sortType === 'time';
        let url = location.href.split('?')[0];
        history.pushState(null, null, `${ url }?sort=${ sortType }`);
        render();
    };

    // 标签改变
    this.onTagFilterChange = function (msg) {
        scope.author = msg.value;
        render();
    };

    // 长logic文本内容显示方式切换
    this.toggleText = function (e) {
        let cla = 'scroll';
        let $th = $(this).toggleClass(cla);
        $th.closest('li').find('.pre').toggleClass(cla);
        /*        if($th.hasClass(cla)){
                    $th.closest('li').find('.pre').css('max-height', 'none');
                }else{
                    $th.closest('li').find('.pre').css('max-height', '32em');
                }*/

    };

    this.logic = {
        edit: function (e, id) {
            let logic = id ? recordManager.get(id) : {};
            let authorArr = scope.authorArr;
            let typeArr = scope.typeArr;
            let tags = scope.tagsMap['交易要素'];
            scope.emit(EDIT_LOGIC, {logic, authorArr, typeArr, tags});
        },
        remove: function (data) {
            scope.onGetLogicDone(data);
        },
        reverse: function () {
            isReverse = !isReverse;
            logicArr.reverse();
            scope.render('logic', logicArr);
        }
    };

    scope.on(ON_SET_LOGIC_DONE, function (e, data) {
        scope.onGetLogicDone(data);
    });

    scope.on(ON_GET_TAGS_DONE, function (e, data) {
        scope.tagsMap = data;
    });

});



brick.reg('setLogicCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    scope.vm = {};

    scope.before = function (data) {
    };

    // 当logic添加或修改完成，广播事件
    scope.done = function (data) {
        scope.emit(ON_SET_LOGIC_DONE, data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    // 订阅修改logic事件
    scope.on(EDIT_LOGIC, function (e, msg) {
        console.log('on logic.edit', msg);
        scope.vm = msg;
        scope.render(msg);
        $elm.icPopup(true);
    });

    scope.onLogicTagSelectChange = function (msg) {
        $elm.find('[ic-form-field="tag"]').val(msg.value);
    };

    scope.addLogicType = function (e) {
        let vm = scope.vm;
        let str = $(this).val();
        if (!str) return;
        if (vm.typeArr.includes(str)) {
            return alert('类型已经存在.');
        } else {
            vm.typeArr.push(str);
            let obj = $elm.find('[ic-form="setLogic"]').icForm();
            obj.type = obj.type || [];
            obj.type.push(str);
            Object.assign(vm, obj);
        }
        console.log(11, vm);
        scope.render(vm);
    };

    scope.addLogicTag = function (e) {
        let vm = scope.vm;
        let str = $(this).val();
        if (!str) return;
        if (vm.authorArr.includes(str)) {
            return alert('标签已经存在.');
        } else {
            vm.authorArr.push(str);
            let obj = $elm.find('[ic-form="setLogic"]').icForm();
            obj.type = str;
            Object.assign(vm, obj);
        }
        console.log(12, vm);
        scope.render(vm);
    };

});
