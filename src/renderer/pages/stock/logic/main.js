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
    let list = brick.services.get('recordManager')();
    let sortType = brick.utils.get_query('sort');
    let logicArr = [];
    let isReverse = false;
    let isSortByTime = sortType === 'time';

    scope.tagMap = {};
    scope.tag = undefined;

    let reader;

    let render = () => {
        scope.render('logic', logicArr);
    };

    this.createReader = () => {
        reader = new Reader('#logicList');
        reader.init();
    };

    this.onGetLogicDone = function (data) {
        list.init(data);
        let tags = data.map((item, index) => {
            return item.tag || item.type;
        });
        scope.tagMap = _.countBy(tags);
        scope.render('tags', scope);
        isSortByTime ? scope.logic.sortByTime() : scope.logic.sortByLevel();
    };

    scope.onSortChange = function (arg) {
        console.log(arg)
        isSortByTime = arg.value === 'time';
        let url = location.href.split('?')[0];
        if (isSortByTime) {
            scope.logic.sortByTime();
            history.pushState(null, null, `${ url }?sort=time`);
        } else {
            scope.logic.sortByLevel();
            history.pushState(null, null, `${ url }?sort=level`);
        }
    };

    this.onTagFilterChange = function (msg) {
        let tag = scope.tag = msg.value;
        logicArr = tag !==undefined ? list.get((record, index) => {
            return record.tag === tag || String(record.tag) === tag;
        }) : list.get();
        render();
    };

    this.logic = {
        edit: function (e, id) {
            let vm = id ? list.get(id) : {};
            vm.tagMap = scope.tagMap;
            scope.emit('logic.edit', vm);
        },
        remove: function (data) {
            scope.onGetLogicDone(data);
        },
        reverse: function () {
            isReverse = !isReverse;
            logicArr.reverse();
            render();
        },
        sortByTime: function () {
            // 原始数据是sort排序，list.get是拷贝数据，所以会始终保留原始排序数据
            logicArr = list.get();
            isReverse && logicArr.reverse();
            render();
        },
        sortByLevel: function () {
            logicArr = list.get();
            logicArr.sort((a, b) => {
                a = a.level || 0;
                b = b.level || 0;
                return b - a;
            });
            isReverse && logicArr.reverse();
            render();
        }
    };

    scope.on('logic.edit.done', function (e, data) {
        scope.onGetLogicDone(data);
    });

});


brick.reg('setLogicCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    scope.done = function (data) {
        scope.emit('logic.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    scope.on('logic.edit', function (e, logic) {
        scope.render(logic);
        $elm.icPopup(true);
    });

    scope.on_select_change = function (msg) {
        $elm.find('[ic-form-field="tag"]').val(msg.value);
    };

});
