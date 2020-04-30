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

    let updateLogic = () => {
        let tag = scope.tag;
        logicArr = tag !== undefined ? recordManager.get((item, index) => {
            return item.tag === tag || String(item.tag) === tag || (item.type && item.type.includes(tag));
        }) : recordManager.get();
    };

    this.createReader = () => {
        reader = new Reader('#logicList');
        reader.init();
    };

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
        scope.render('tags', scope);
        render();
    };

    scope.onSortChange = function (arg) {
        console.log(arg)
        sortType = arg.value;
        isSortByTime = sortType === 'time';
        let url = location.href.split('?')[0];
        history.pushState(null, null, `${ url }?sort=${ sortType }`);
        render();
    };

    this.onTagFilterChange = function (msg) {
        let tag = scope.tag = msg.value;
        tag = tag ? tag : '';
        render();
    };

    this.logic = {
        edit: function (e, id) {
            let vm = id ? recordManager.get(id) : {};
            vm.tagMap = scope.tagMap;
            vm.typeMap = scope.typeMap;
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
        if(vm.typeMap[str]){
            return alert('类型已经存在.');
        }else{
            vm.typeMap[str] = 1;
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
        if(vm.tagMap[str]){
            return alert('标签已经存在.');
        }else{
            vm.tagMap[str] = 1;
            let obj = $elm.find('[ic-form="setLogic"]').icForm();
            obj.type = str;
            Object.assign(vm, obj);
        }
        console.log(12, vm);
        scope.render(vm);
    };

});
