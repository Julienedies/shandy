/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'
import Reader from '../../../../libs/reader'

import _ from 'lodash'

function sortByPy(param1, param2) {
    return param1.localeCompare(param2, "zh");
}

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
    scope.tag = undefined;

    let reader;  // 语音阅读器

    let updateLogic = () => {
        let tag = scope.tag;
        logicArr = tag !== undefined ? recordManager.get((item, index) => {
            return item.tag === tag || String(item.tag) === tag || (item.type && item.type.includes(tag));
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
        $title.text(`logic_${ scope.tag || sortType }_${ date }`);
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
            let tag = item.tag;
            let type = item.type;
            if(tag){
                tags.push(tag);
            }
            if(type){
                type.forEach((v) => {
                    types.push(v);
                });
            }
        });
        scope.tagMap = _.countBy(tags);
        scope.typeMap = _.countBy(types);
        let tagArr = [];
        let typeArr = [];
        tagArr = _.keys(scope.tagMap);
        typeArr = _.keys(scope.typeMap);
        tagArr.sort(sortByPy);
        typeArr.sort(sortByPy);
        scope.tagArr = tagArr;
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
        let tag = scope.tag = msg.value;
        tag = tag ? tag : '';
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
            let vm = id ? recordManager.get(id) : {};
            vm.tagArr = scope.tagArr;
            vm.typeArr = scope.typeArr;
            scope.emit('logic.edit', vm);
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

    scope.on('logic.edit.done', function (e, data) {
        scope.onGetLogicDone(data);
    });

});


brick.reg('setLogicCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    scope.vm = {};

    scope.before = function (data) {
    };

    scope.done = function (data) {
        scope.emit('logic.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    scope.on('logic.edit', function (e, logic) {
        console.log('on logic.edit', logic);
        scope.vm = logic;
        scope.render(logic);
        $elm.icPopup(true);
    });

    scope.onLogicTagSelectChange = function (msg) {
        $elm.find('[ic-form-field="tag"]').val(msg.value);
    };

    scope.addLogicType = function (e) {
        let vm = scope.vm;
        let str = $(this).val();
        if(!str) return;
        if(vm.typeArr.includes(str)){
            return alert('类型已经存在.');
        }else{
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
        if(!str) return;
        if(vm.tagArr.includes(str)){
            return alert('标签已经存在.');
        }else{
            vm.tagArr.push(str);
            let obj = $elm.find('[ic-form="setLogic"]').icForm();
            obj.type = str;
            Object.assign(vm, obj);
        }
        console.log(12, vm);
        scope.render(vm);
    };

});
