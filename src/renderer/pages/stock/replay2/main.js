/**
 *
 * Created by j on 2024/8/27.
 */

import '../../../css/common/common.scss'
import '../../rp/style.scss'
import './style.scss'
import './index.html'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/utils.js'
import '../../../js/common-stock.js'

window.brick = brick;

brick.reg('plansCtrl', function (scope) {

    $.get(`/stock/replay`).done((data) => {
        console.log(data);
        let arr = data;
        //return console.log(arr);
        arr = arr.map((v) => {
            return fixData(v);
        });

        console.log(arr[0]);
        scope.render('replay', arr);
    });

    // 对复盘数据replay进行处理优化
    function fixData (rpForm) {
        let result = {};

        for( let i in rpForm){

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

});
