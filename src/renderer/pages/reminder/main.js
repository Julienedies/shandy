/**
 * Created by j on 18/6/3.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import Reader from '../../../libs/reader'

import '../../js/common.js'
import '../../js/common-stock.js'
import '../../js/utils.js'
import viewerMarkTagCtrl from '../viewer/markTag-ctrl'

brick.reg('reminderCtrl', function (scope) {

    let $memo = $('#memo');

    let def1 = $.Deferred();
    let def2 = $.Deferred();

    function getRpForm () {
        $.get(`/stock/replay?date=${ formatDate2() }`).done((data) => {
            def1.resolve(data);
        });
    }

    function getMemo () {
        $.get('/stock/memo').done(function (data) {
            def2.resolve(data);
        });
    }


    $.when(def1, def2).done((d1, d2) => {
        let mq = `
        做着做着就忘记了教训和悔恨，沉迷于无效的日常交易，重复所有错误；没有任何改变;
        做着做着就忘记了教训和悔恨，沉迷于无效的日常交易，重复所有错误；没有任何改变；
        为何我错过所有的大行情和大龙头？为何我错过所有的大行情和大龙头？
        无系统，无计划；
        没有大局观，着眼于小波动；
        主观与线性思维；
        客服不了本能，控制不住情绪；
        `;
        let plan = d1['交易计划'] || '如果没有明确的交易计划，就不要交易; 无系统、无计划、临盘随意交易是我最大的亏损来源';
        $memo.html(`<pre>${ mq } </pre><pre>${ plan } </pre> <pre>${ plan }</pre> <pre>${ plan }</pre>  ${ d2.text }`);
        let reader = new Reader('#memo');
        reader.init();
        reader.autoSpeak();
    });

    getRpForm();
    getMemo();

    /*    $.get('/stock/memo').done(function (o) {
            $memo.html(o.text);
            let reader = new Reader('#memo');
            reader.init();
            reader.autoSpeak();
        });*/

    /*    $.get('/stock/tags/').done((data) => {
            console.log(data);
            scope.render('prepare', data);
            scope.render('mistake', data);
            //scope.render('logic', data);
            //scope.render('principle', data);
        });*/

    let timer = 240; // 秒
    let $timer = $('#timer');

    setInterval(() => {
        timer--;
        $timer.text(timer);
        if (timer <= 0) {
            window.close();
        }
    }, 1000);

});

brick.reg('mistakeCtrl', function (scope) {

});


brick.reg('viewerMarkTagCtrl', viewerMarkTagCtrl);


