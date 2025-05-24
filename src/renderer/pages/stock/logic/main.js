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

import {
    ADD_LOGIC,
    EDIT_LOGIC,
    DEL_LOGIC,
    ON_DEL_LOGIC_DONE,
    SET_LOGIC_DONE,
    ON_GET_LOGIC_DONE,
    GET_TAGS_DONE,
    SET_TAG_DONE, DEL_TAG_DONE, DEL_TAG,
} from '../../../js/constants'

import utils from '../../../js/utils'
import '../../../js/common-stock.js'
import Reader from '../../../../libs/reader'

import setTagCtrl from '../../tags2/set-tag-ctrl'

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('logicCtrl', function () {

    let scope = this;
    let $title = $('title');
    let logicManager = brick.services.get('recordManager')();
    let sortType = brick.utils.getQuery('sort') || 'time';
    let isSortByTime = sortType === 'time';
    let isReverse = false;

    let reader;  // 语音阅读器

    scope.filterKey = brick.utils.getQuery('filter') || undefined;

    scope.$elm.find(`[ic-select="sortType"] [ic-val=${ sortType }]`).addClass('is-primary');

    //scope.tagsMap = {};  // 所有的标签数据集合
    let logicArr = [];  // 当前显示的logic数组

    scope.logicListModel = logicArr;

    function updateLogicArrByFilterKey () {
        let filterKey = scope.filterKey;
        logicArr = filterKey !== undefined ? logicManager.get((item, index) => {
            let isAuthorMatch = item.author === filterKey || String(item.author) === filterKey;
            let isTypeMatch = item.type && item.type.includes(filterKey);
            let isTagMatch = item.tag && item.tag.includes(filterKey);
            return isAuthorMatch || isTypeMatch || isTagMatch;
        }) : logicManager.get();
    }

    function render () {
        updateLogicArrByFilterKey();
        // 原始数据是time排序，list.get是拷贝数据，所以会始终保留原始排序数据
        !isSortByTime && logicArr.sort((a, b) => {
            a = a.level || 0;
            b = b.level || 0;
            return b * 1 - a * 1;
        });

        isReverse && logicArr.reverse();
        $.icMsg(`render item => ${ logicArr.length }`);
        scope.render('logic', logicArr.slice(0, 700));
        // 更新html title, 下载text用
        let date = (new Date()).toLocaleDateString().replace(/\//img, '-');
        let text = scope.filterKey && TAGS_MAP_BY_ID[scope.filterKey] && TAGS_MAP_BY_ID[scope.filterKey].text;
        $title.text(`logic_${ text || scope.filterKey || sortType }_${ date }`);
    }

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
        logicManager.init(data);
        let authors = [];
        let types = [];
        data.map((item, index) => {
            let author = item.author;
            let type = item.type;
            if (author) {
                authors.push(author);
            }
            if (type) {
                type.forEach((v) => {
                    types.push(v);
                });
            }
        });
        scope.authorMap = _.countBy(authors);
        scope.typeMap = _.countBy(types);
        let tagArr = _.keys(scope.authorMap);
        let typeArr = _.keys(scope.typeMap);
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
        render();
        updateUrl();
    };

    // 过滤标签改变
    this.onFilterKeyChange = function (msg) {
        scope._onFilterKeyChange(msg.value);
    };

    this.onFilterKeyChange2 = function (e, val) {
        scope._onFilterKeyChange(val);
        scope.render('tags', scope);
    };

    this._onFilterKeyChange = function (val) {
        scope.filterKey = val === '' ? undefined : val === '_null' ? '' : val;
        render();
        updateUrl();
    };

    // 长logic文本内容显示方式切换
    this.toggleText = function (e) {
        let cla = 'scroll';
        let $th = $(this).toggleClass(cla);
        $th.closest('li').find('.pre').toggleClass(cla);
    };

    this.logic = {
        edit: function (e, id) {
            let logic = id ? logicManager.get(id) : {};
            let authorArr = scope.authorArr;
            let typeArr = scope.typeArr;
            let tags = scope.tradingKeyTags;
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

    scope.on(GET_TAGS_DONE, function (e, data) {
        //scope.tagsMap = data;
        scope.tradingKeyTags = data['交易要素'];
        scope.render('tags', scope);
    });

    function updateUrl () {
        let url = location.href.split('?')[0];
        history.pushState(null, null, `${ url }?sort=${ sortType }&filter=${ scope.filterKey || '' }`);
    }

});


brick.reg('setLogicCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    // 暂存当前要修改或添加的logic Model
    scope.vm = {};

    scope.before = function (fields) {
        //  type属性如果是空数组，由于合并的关系，似乎并不会在服务器端删除，临时处理，先把type设为''
        if (fields.type && fields.type.length === 0) {
            fields.type = '';
        }
    };

    // 当logic添加或修改完成，广播事件
    scope.done = function (data) {
        scope.emit(ON_SET_LOGIC_DONE, data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    scope.delTag = function (e, id) {
        scope.emit(DEL_TAG, id);
    };

    // 订阅修改logic事件
    scope.on(EDIT_LOGIC, function (e, msg) {
        console.log('on logic.edit', msg);
        scope.vm = msg;
        scope.render(msg);
        $elm.icPopup(true);
    });

    scope.addLogicType = function (e) {
        let vm = scope.vm;
        let str = $(this).val();
        if (!str) return;
        if (!vm.typeArr.includes(str)) {
            vm.typeArr.push(str);
        }
        let obj = getFormVm();
        obj.type = obj.type || [];
        obj.type.push(str);
        Object.assign(vm.logic, obj);

        scope.render(vm);
    };

    scope.addLogicAuthor = function (e) {
        let vm = scope.vm;
        let str = $(this).val();
        if (!str) return;
        if (!vm.authorArr.includes(str)) {
            vm.authorArr.push(str);
        }
        let obj = getFormVm();
        obj.author = str;
        Object.assign(vm.logic, obj);

        scope.render(vm);
    };

    scope.on(`${ SET_TAG_DONE }, ${ ODEL_TAG_DONE }`, function (e, data) {
        let vm = scope.vm;
        vm.logic = getFormVm();
        vm.tags = data['交易要素'];
        scope.render(vm);
    });

    function getFormVm () {
        return $elm.find('[ic-form="setLogic"]').icForm();
    }

});
