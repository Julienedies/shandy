/**
 * Created by j on 18/6/15.
 */

import electron, { ipcRenderer } from 'electron'

import rts from '../../../libs/real-time-stock.js'
import _objm from '../../../libs/objm.js'
import tdx from '../../../libs/tdx.js'
import voice from '../../../libs/voice.js'
import bridge from '../../../libs/e-bridge.js'
import userDb from '../../../libs/user-jo.js'

import $ from 'jquery'
import brick from '@julienedies/brick'

const rtsJo = userDb('rts')

let prev_objm = window.prev_objm = _objm();
let first_objm = window.first_objm = _objm();

let rtsc_threshold = window.rtsc_threshold = 15;

let $rts_list = $('#rts_list');

let q_rtso = rts('qq', f);

//let s_rtso = rts('sina', f);

function f (stocks) {
    if (!Array.isArray(stocks)) {
        console.info(stocks);
        return voice(stocks);
    }

    let arr2 = [];
    let stock;
    while (stock = stocks.shift()) {
        arr2.push(_f(stock));
    }

    ipcRenderer.send('rts_push', arr2);
    $rts_list.icRender(arr2);
}

function _f (stock) {
    // stock => {code: code, name: name, b1: 买一量, v:成交量, p: price}
    console.log(stock);
    let code = stock.code;
    let name = stock.name;
    let b1 = stock.b1;
    let v = stock.v;
    let price = stock.price;
    let time = stock.time;
    let p_stock = prev_objm.get(code);
    let f_stock = first_objm.get(code);

    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();
    // 竞价阶段或尾盘阶段
    if ((hour === 9 && minute < 30) || (hour === 14 && minute > 53)) {
        return stock;
    }

    if (stock.price < stock.maxPrice || b1 < 1000) {
        voice.remove(code);
        prev_objm.remove(code);
        stock.rout = 1; // 破板
        return stock;
    }

    if (p_stock) {

        let f_b1 = f_stock.b1;  // 买一
        let f_v = f_stock.v;    // 成交量
        let p_b1 = p_stock.b1;  // 上次买一
        let p_v = p_stock.v;    // 上次成交量

        let b1_reduce = b1 - p_b1;
        let v_plus = v - p_v;
        let total_b1_reduce = b1 - f_b1;
        let total_v_plus = v - f_v;
        let time_reduce = Math.floor((stock.timestamp - p_stock.timestamp) / 1000); // 间隔秒数
        let b1_reduce_base = Math.floor(p_b1 / rtsc_threshold) || 3000;   // 封单减少量预警基准
        let v_plus_base = Math.floor(p_v / rtsc_threshold) || 5000;       // 成交增加量预警基准
        let least = 9000;  // 最低封单量 9000手

        //console.log(name, '预警：封单-',Math.floor(b1_reduce_base/1000) + 'k', '成交量+', Math.floor(v_plus_base/1000) + 'k');
        /*
         * 如果（这里的计算是累计一段时间的，并不是以相邻两次请求计算）
         * 1. 封单减少量超过阈值,     （ 当前封单 - 上次封单 = 减少封单量 ）
         * 2. 成交量增加量超过阈值,   （ 当前成交量 - 上次成交量 = 增加成交量 ）
         * 3. 撤单量超过阈值,        （ 封单减少，成交量没有对应增加, 则说明是撤单）
         * 发出声音预警并显示股票撤单界面
         * 排单计算：计算我前面的排单：累计增加成交量
         * 封单减少，成交单没有对应增加，则说明是撤单
         */
        if (b1 < least || -b1_reduce > b1_reduce_base || v_plus > v_plus_base) {

            // 早盘封单小于阈值
            if (b1 < least && hour < 16 && price < 50) {
                console.info(time, `${ name }有破板风险`);
                voice(code, `${ name }有破板风险`);
            } else
            // 封单减少量超过阈值,（ 当前封单 - 上次记录的封单 = 封单减少量 ）
            if (-b1_reduce > b1_reduce_base) {
                // 短时间大量减少（小于60秒）
                if (time_reduce < 60) {
                    console.info(time, `${ name }: 间隔${ time_reduce }秒封单减少`);
                    voice(code, `${ name }封单急速减少`);
                } else
                // 撤单量超过阈值,（ 封单减少，成交量没有对应增加, 则说明是撤单）
                if (-b1_reduce - v_plus > b1_reduce_base) {
                    console.info(time, `${ name }: 大量撤单${ -b1_reduce - v_plus }手`);
                    voice(code, `${ name }大量撤单`);
                } else {
                    console.info(time, `${ name }: 封单累计减少 ${ -b1_reduce }手，余${ b1 }手`);
                    voice(code, `${ stock.name }封单减少`);
                }
            } else
            // 成交量增加量超过阈值,（ 当前成交量 - 上次记录的成交量 = 增加成交量 ）
            if (v_plus > v_plus_base) {
                voice(code, `${ name }增加成交${ v_plus }手`);
            }

            stock.warning = 1;
            // 更新预警基准信息
            prev_objm.set(code, stock);
        }

        // 如果封单增加, 则以新封单量进行初始计算
        if (b1_reduce > 100) {
            prev_objm.set(code, stock);
        }

        stock.b1_reduce_base = b1_reduce_base;
        stock.v_plus_base = v_plus_base;
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

function _add (code) {
    voice.remove(code);
    prev_objm.remove(code);
    first_objm.remove(code);
    q_rtso.add(code);
}

function _remove (code) {
    q_rtso.remove(code);
    voice.remove(code);
    prev_objm.remove(code);
    first_objm.remove(code);
    $rts_list.icRender([]);
}

brick.reg('rts_ctrl', function (scope) {

    let $elm = scope.$elm;
    let $stock_code = $elm.find('#stock_code');

    scope.add = function (e, msg) {
        _add($stock_code.val());
    };
    scope.query = function () {
        q_rtso.query(true);
    };
    scope.clear = function clear () {
        voice.clear();
        q_rtso.clear();
        prev_objm.clear();
        first_objm.clear();
        $rts_list.icRender([]);
        ipcRenderer.send('rts_push', []);
        $stock_code.val('');
        rtsJo.set('stocks', []);
    };
    scope.change = function change () {
        let code = $stock_code.val();
        q_rtso.change(code);
        prev_objm.clear();
        first_objm.clear();
    };
    scope.pause = function (e) {
        voice.clear();
        q_rtso.pause();
    };
    scope.remove = function (e, code) {
        _remove(code || $stock_code.val());
    };
    scope.fill = function (e) {
        $stock_code.val($(this).attr('code'));
    };
    scope.reset = function () {
    };

    // --------------------------------------------
    let codes = rtsJo.get('stocks') || [];
    codes.length && q_rtso.add(codes);
});


window.addEventListener('beforeunload', function (e) {
    let obj = prev_objm.get();
    let codes = Object.keys(obj);
    rtsJo.set('stocks', codes);
});


// 下午3点后取消行情请求
bridge.timer('14:55', () => {
    q_rtso.pause();
    prev_objm.clear();
    rtsJo.set('stocks', []);
});

//
export default {
    on_rts_db_monitor: function (stock) {
        let code = stock.code;

        if (/^\d{6}$/.test(code)) {
            _add(code);
            voice(`封单监控 ${ stock.name }`);
        } else {
            voice('封单监控失败，无效代码！');
        }

        tdx.active();
    },
    on_rts_cancel: _remove
};


