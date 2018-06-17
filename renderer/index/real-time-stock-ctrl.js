/**
 * Created by j on 18/6/15.
 */

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const _ = require('underscore');

const rts = require('../../libs/real-time-stock.js');
const voice = require('../../js/libs/voice.js');
const _objm = require('../../libs/objm.js');
const tdx = require('../../libs/tdx.js');

window.voice = voice;

let prev_objm = window.prev_objm = _objm();
let first_objm = window.first_objm = _objm();

let rtsc_threshold = window.rtsc_threshold = 15;

let $stock_code = $('#stock_code');
let $rts_list = $('#rts_list');

function f(arr) {
    if (!Array.isArray(arr)) {
        return voice(arr);
    }

    let arr2 = [];
    let item;
    while (item = arr.shift()) {
        arr2.push( _f(item) );
    }

    ipcRenderer.send('rts-push', arr2);
    $rts_list.icRender({model: arr2});
}

function _f(stock) {
    // stock => {code: code, name: name, b1: 买一量, v:成交量, p: price}
    console.log(stock);
    let code = stock.code;
    let b1 = stock.b1;
    let v = stock.v;
    let p_stock = prev_objm.get(code);

    if (p_stock) {
        let p_b1 = p_stock.b1;
        let p_v = p_stock.v;
        let bx = 1000;
        let vx = 2000;

        console.log(Math.floor(b1/rtsc_threshold),  Math.floor(v/rtsc_threshold));

        let b1_reduce = b1 - p_b1;
        let v_plus = v - p_v;

        /* 如果当前打板封单相对于上次封单减少量超过阈值,
         * 或者当前成交量相对于上次成交量增加量超过阈值
         * 发出声音预警并显示股票撤单界面 total
         */
        if (p_b1 - b1 > bx || v_plus > vx) {
            let t = stock.name + ' ' + stock.b1 + '手';
            voice(t);
            tdx.show(code);
            prev_objm.set(code, stock);
            stock.warning = 1;
        }
        stock.b1_reduce = b1_reduce;
        stock.v_plus = v_plus;
        return stock;
    } else {
        first_objm.set(code, stock);
        prev_objm.set(code, stock);
        return stock;
    }
}

let q_rtso = rts('qq', f);
let s_rtso = rts('sina', f);

brick.controllers.reg('rts_ctrl', function (scope) {

    let $elm = scope.$elm;
    let $stock_code = $elm.find('#stock_code');

    /*prev_objm.on('*', function(e, msg){
     console.log('on', e);
     scope.render('list', prev_objm.get());
     });*/

    scope.add = function () {
        let code = $stock_code.val();
        q_rtso.add(code);
        //s_rtso.add(code);
        prev_objm.remove(code);
        first_objm.remove(code);
    };
    scope.query = function clear() {
        q_rtso.query();
        //s_rtso.query();
    };
    scope.clear = function clear() {
        voice.clear();
        q_rtso.clear();
        //s_rtso.clear();
        prev_objm.clear();
        first_objm.clear();
        $rts_list.icRender({model: []});
        $stock_code.val('');
    };
    scope.change = function change() {
        let code = $stock_code.val();
        q_rtso.change(code);
        //s_rtso.change(code);
        prev_objm.clear();
        first_objm.clear();
    };
    scope.pause = function pause() {
        voice.clear();
        q_rtso.pause();
        //s_rtso.pause();
    };
    scope.remove = function () {
        let code = $stock_code.val();
        q_rtso.remove(code);
        prev_objm.remove(code);
        first_objm.remove(code);
    };
    scope.fill = function (e) {
        $stock_code.val($(this).attr('code'));
    };
    scope.reset = function () {

    };

});


//
module.exports = {
    on_view_stock: function (code) {
        $stock_code.val(code);
    },
    on_real_time_stock: function (code) {
        console.log(code);
        if (/^\d{6}$/.test(code)) {
            q_rtso.add(code);
            $stock_code.val(code);
            prev_objm.remove(code);
            first_objm.remove(code);
            voice('开始实时监控');
        } else {
            voice('无效股票代码');
        }
    }
};


