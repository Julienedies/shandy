/**
 *
 * Created by j on 2024/8/27.
 */

import '../../../css/common/common.scss'
import './style.scss'
import './index.html'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/utils.js'
import '../../../js/common-stock.js'

window.brick = brick;

brick.reg('replaysCtrl', function (scope) {

    let $elm = scope.$elm;

    let date = brick.utils.getQuery('date');

    scope.toggle = function (e) {
        $elm.toggleClass('a');
    };

    scope.filterByDate = function (e, date) {
        _pushState('date', date);
    };

    scope.filterByKey = function (e, key) {
        $elm.find('tr').not(`tr[tabindex=${ key }]`).toggle();
    };

    $.get(`/stock/replay?date=${ date||'' }`).done((data) => {
        console.log(data);
        let arr = Array.isArray(data) ? data : [data];
        arr = arr.map((v) => {
            return fixData(v);
        });

        console.log(arr[0]);
        scope.render('replays', arr);
    });



/*    $.get(url).done((data) => {
        console.log(data);
        let arr = data;
        //return console.log(arr);
        arr = arr.map((v) => {
            return fixData(v);
        });

        console.log(arr[0]);
        scope.render('replays', arr);
    });*/


    $elm.on('click', 'a.key', function (e) {
        let key = $(this).text();
        $elm.find('tr').not(`tr[tabindex=${ key }]`).toggle();
    });


    // 对复盘数据replay进行处理优化
    function fixData (rpForm) {
        let result = {};

        for (let i in rpForm) {

            let value = rpForm[i];

            let chain = i.split('.');

            (function fx (chain, result) {

                let k = chain.shift();

                let o = {};

                if (chain.length) {
                    o = result[k] = result[k] || o;
                    return fx(chain, o);
                }

                result[k] = value;

            })(chain, result);

        }
        result.week = window.getDayOfWeek(rpForm.date);
        console.log('replay fix => ', result);
        return result;
    }

    function _pushState (key, val) {
        let url = location.href;
        let url2 = url.split('?')[0];
        let o = brick.utils.getQuery() || {};
        o[key] = val;
        let s = '';
        for (let i in o) {
            s = s + i + '=' + o[i] + '&';
        }
        s = s.replace(/[&]$/img, '');
        history.pushState(null, null, `${ url2 }?${ s }`);
    }


});
