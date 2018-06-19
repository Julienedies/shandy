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

window.tdx = tdx;
window.voice = voice;

let prev_objm = window.prev_objm = _objm();
let first_objm = window.first_objm = _objm();

let rtsc_threshold = window.rtsc_threshold = 15;

let $stock_code = $('#stock_code');
let $rts_list = $('#rts_list');

let q_rtso = rts('qq', f);
let s_rtso = rts('sina', f);

function f(arr) {
    if (!Array.isArray(arr)) {
        console.log(arr);
        return voice(arr);
    }

    let arr2 = [];
    let item;
    while (item = arr.shift()) {
        arr2.push(_f(item));
    }

    ipcRenderer.send('rts-push', arr2);
    $rts_list.icRender({model: arr2});
}

function _f(stock) {
    // stock => {code: code, name: name, b1: 买一量, v:成交量, p: price}
    //console.log(stock);
    let code = stock.code;
    let name = stock.name;
    let b1 = stock.b1;
    let v = stock.v;
    let p_stock = prev_objm.get(code);
    let f_stock = first_objm.get(code);
    if (p_stock) {
        let f_b1 = f_stock.b1;
        let f_v = f_stock.v;
        let p_b1 = p_stock.b1;
        let p_v = p_stock.v;

        let b1_reduce = b1 - p_b1;
        let v_plus = v - p_v;
        let total_b1_reduce = b1 - f_b1;
        let total_v_plus = v - f_v;
        let base = 2000;
        let least = 5000;
        let d = new Date();
        d = d.getHours();
        //console.log(Math.floor(b1/rtsc_threshold),  Math.floor(v/rtsc_threshold));
        /*
         * 如果（这里的计算是累计一段时间的，并不是以相邻两次请求计算）
         * 1. 封单减少量超过阈值,     （ 当前封单 - 上次封单 = 减少封单量 ）
         * 2. 成交量增加量超过阈值,   （ 当前成交量 - 上次成交量 = 增加成交量 ）
         * 3. 撤单量超过阈值,        （ 封单减少，成交量没有对应增加, 则说明是撤单）
         * 发出声音预警并显示股票撤单界面
         * 排单计算：计算我前面的排单：累计增加成交量
         * 封单减少，成交单没有对应增加，则说明是撤单
         */
        if (b1 < least || -b1_reduce > base || v_plus > base) {

            // 早盘封单小于5000手
            if(b1 < least){
                if(d < 14 ){
                    voice(`${name}直接撤单`);
                    tdx.cancel_order(code);
                }else{
                    voice(`封单小于${b1}手，破板风险`);
                }
            }

            // 封单减少量超过阈值,（ 当前封单 - 上次记录的封单 = 封单减少量 ）
            if (-b1_reduce > base) {
                voice(`${stock.name} 封单减少 ${-b1_reduce}手，余${b1}手`);
                // 撤单量超过阈值,（ 封单减少，成交量没有对应增加, 则说明是撤单）
                if (-b1_reduce - v_plus > base) {
                    let flag = +new Date();
                    console.log(stock.name, `大量撤单${-b1_reduce - v_plus}手~${flag}`);
                    voice(`大量撤单${-b1_reduce - v_plus}手`);
                }
            }

            // 成交量增加量超过阈值,（ 当前成交量 - 上次记录的成交量 = 增加成交量 ）
            if (v_plus > base) {
                voice(`${stock.name} 增加成交 ${v_plus}手`);
            }

            stock.warning = 1;
            prev_objm.set(code, stock);
        }

        stock.total_b1_reduce = total_b1_reduce;
        stock.total_v_plus = total_v_plus;
        stock.b1_reduce = b1_reduce;
        stock.v_plus = v_plus;
        return stock;

    } else {
        first_objm.set(code, stock);
        prev_objm.set(code, stock);
        return stock;
    }
}

function _add(code) {
    prev_objm.remove(code);
    first_objm.remove(code);
    q_rtso.add(code);
    //s_rtso.add(code);
}

brick.controllers.reg('rts_ctrl', function (scope) {

    let $elm = scope.$elm;
    let $stock_code = $elm.find('#stock_code');

    scope.add = function(e, msg){
        _add($stock_code.val());
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
        ipcRenderer.send('rts-push', []);
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
        if (/^\d{6}$/.test(code)) {
            _add(code);
            $stock_code.val(code);
            voice('开始监控:' + code.replace(/\B/img, ' '));
        } else {
            voice('监控失败，无效股票代码！');
        }
    },
    on_rts_cancel: function(code){
        q_rtso.remove(code);
        prev_objm.remove(code);
        first_objm.remove(code);
    }
};


