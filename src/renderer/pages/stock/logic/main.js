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

brick.reg('logicCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let sortType = brick.utils.get_query('sort');
    let logicArr = [];
    let isReverse = false;
    let isSortByTime = sortType === 'time';

    const reader = new Reader('#logicList');

    let render = () => {
        scope.render('logic', logicArr, () => {
            reader.init();
        });
    };

    this.onGetLogicDone = function (data) {
        list.init(data);
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

    this.logic = {
        add: function () {
            scope.emit('logic.edit');
        },
        edit: function (e, id) {
            scope.emit('logic.edit', list.get(id));
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

    scope.on('logic.edit.done', function () {
        $elm.find('#get_logic').click();
    });

});


brick.reg('setLogicCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    scope.done = function () {
        scope.emit('logic.edit.done');
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    scope.on('logic.edit', function (e, msg) {
        let logic = msg || {};
        scope.render(logic[0] || logic);
        $elm.icPopup(true);
    });

    scope.on_select_change = function (msg) {
        $elm.find('[ic-form-field="type"]').val(msg.value);
    };

});
