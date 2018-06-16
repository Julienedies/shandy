/**
 * Created by j on 18/6/15.
 */

const _ = require('underscore');

const rts = require('../../libs/real-time-stock.js');
const voice = require('../../js/libs/voice.js');
const _objm = require('../../libs/objm.js');
const tdx = require('../../libs/tdx.js');


let $stock_code = $('#stock_code');

brick.controllers.reg('rts_ctrl', function (scope) {

    let $elm = scope.$elm;
    let $stock_code = $elm.find('#stock_code');

    window.objm = _objm();
    window.voice = voice;

    objm.on('*', function(e, msg){
        console.log('on', e);
        let model = _.filter(objm.get(), function(v, i){
            return /^\d{6}$/.test(i);
        });
        scope.render('list', model);
    });

    function f(stock) {
        console.log(stock);
        if(typeof stock == 'string') {
            return voice(stock);
        }
        // stock => {code: code, name: name, b1: 买一量, v:成交量, p: price}
        //return voice(stock.name + ' ' + stock.b1 + '手');

        let s_first = '_first';
        let code = stock.code;
        let b1 = stock.b1;
        let v = stock.v;

        let p_stock = objm.get(code);

        if(p_stock){
            let threshold = objm.get('threshold');
            let p_b1 = p_stock.b1;
            let p_v = p_stock.v;
            let bx = -1000;
            let vx = 2000;
            /* 如果当前打板封单相对于上次封单减少量超过阈值,
             * 或者当前成交量相对于上次成交量增加量超过阈值
             * 发出声音预警并显示股票撤单界面
             */
            if(p_b1 - b1 > bx || p_v - v > vx){
                let t = stock.name + ' ' + stock.b1 + '手';
                voice(t);
                tdx.show(code);
                objm.set(code, stock);
            }
        }else{
            objm.set('threshold', 15);
            objm.set(code + s_first, stock);
            objm.set(code, stock);
        }

    }

    let q_rtso = rts('qq', f);
    let s_rtso = rts('sina', f);

    scope.reset = function () {
    };
    scope.add = function () {
        let code = $stock_code.val();
        q_rtso.add(code);
        //s_rtso.add(code);
    };
    scope.query = function clear() {
        q_rtso.query();
        //s_rtso.query();
    };
    scope.clear = function clear() {
        voice.clear();
        q_rtso.clear();
        //s_rtso.clear();
    };
    scope.change = function change() {
        let code = $stock_code.val();
        q_rtso.change(code);
        //s_rtso.change(code);
    };
    scope.pause = function pause() {
        voice.clear();
        q_rtso.pause();
        //s_rtso.pause();
    };
    scope.fill = function (e){
        $stock_code.val($(this).attr('code'));
    }

});


module.exports = function(code){
    $stock_code.val(code);
};