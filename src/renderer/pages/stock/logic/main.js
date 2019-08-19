/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import Reader from '../../../../libs/reader'

import '../../../js/common-stock.js'

brick.reg('logicCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let logicArr = [];
    let isReverse = false;
    let isSortByTime = false;

    const reader = new Reader('#logicList');

    let render = () => {
        scope.render('logic', logicArr, () => {
            reader.init();
        });
    };

    this.get_logic_on_done = function (data) {
        list.init(data);
        isSortByTime ? scope.logic.sortByTime() : scope.logic.sortByLevel();
    };

    scope.onSortChange = function (arg) {
        console.log(arg)
        isSortByTime = arg.value === 'time';
        isSortByTime ? scope.logic.sortByTime() : scope.logic.sortByLevel();
    };

    this.logic = {
        add: function () {
            scope.emit('logic.edit');
        },
        edit: function (e, id) {
            scope.emit('logic.edit', list.get(id));
        },
        remove: function (data) {
            // $(this).closest('li').remove();
            scope.get_logic_on_done(data);
        },
        reverse: function () {
            isReverse = !isReverse;
            logicArr.reverse();
            render();
        },
        sortByTime: function () {
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
