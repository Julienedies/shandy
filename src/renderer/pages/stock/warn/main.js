/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/utils'
import '../../../js/common-stock.js'
import { FroalaEditorConfig } from '../../../js/constants'

brick.reg('todoCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let $title = $('title');
    let list = brick.services.get('recordManager')();

    scope.mapByType = null;
    scope.filterByType = '错误';

    function getMapByType (arr) {
        let mapByType = {};
        arr.forEach((v, i) => {
            let arr2 = mapByType[v.type || '_null'] = mapByType[v.type || '_null'] || [];
            arr2.push(v);
        });

        console.log(mapByType);
        return mapByType;
    }

    function render () {
        let todoArr = list.get();
        let mapByType = scope.mapByType;
        let filterByType = scope.filterByType;

        if (filterByType) {
            todoArr = mapByType[filterByType];
            /*todoArr  = list.get((item, index) => {

            });*/
        }

        todoArr.sort((a, b) => {
            let al = a.level || 0;
            let bl = b.level || 0;
            return bl - al;
        });

        $.icMsg(`render ${ filterByType } => ${ todoArr.length }`);
        scope.render('types', scope);
        scope.render('list', todoArr);

        $title.text(`todo_${ scope.filterByType }_${ formatDate() }`);
    }

    this.onGetTodoDone = function (data) {
        list.init(data);
        scope.mapByType = getMapByType(data);
        render();
    };
    this.onGetWarnDone = function (data) {
        scope.render('list', data);
    };

    scope.onFilterKeyChange = function (msg) {
        _onFilter(msg.value);
    };

    function _onFilter (type) {
        scope.filterByType = type;
        render();
    }

});



