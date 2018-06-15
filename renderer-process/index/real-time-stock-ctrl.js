/**
 * Created by j on 18/6/15.
 */

const rts = require('../../libs/real-time-stock.js');
window.voice = require('../../assets/js/libs/voice.js');

brick.controllers.reg('rts_ctrl', function (scope) {

    let $elm = scope.$elm;
    let $stock_code = $elm.find('#stock_code');


    var prev_data = window.prev_data = {};
    window.rts_b = 15;
    var cc = {};
    var vv = {};

    function f(item) {

        // data => {code: code, name: name, b1: 买一量, v:成交量, p: price}
        /*if (!Array.isArray(data)) {
            return voice('出现错误');
        }*/
            //return voice(item.name + ' ' + item.b1 + '手');
            console.log(item);
            let code = item.code;
            let prev = prev_data[code];
            let vx = vv[code];
            let cx = cc[code];
            if (!prev) {
                prev_data[code] = item;
                cc[code] = Math.floor(item.b1 / rts_b);
                vv[code] = Math.floor(item.v / rts_b);
            } else {
                let pb1 = prev.b1;
                let b1 = item.b1;
                let pv1 = prev.v;
                let v1 = item.v;
                if (pb1 - b1 > cx || v1 - pv1 > vx) {
                    let t = item.name + ' ' + item.b1 + '手';
                    voice(t);
                    prev.b1 = b1;
                }
            }
    }

    let q_rtso = rts('qq', f);
    let s_rtso = rts('sina', f);

    scope.add = function () {
        let code = $stock_code.val();
        q_rtso.add(code);
        s_rtso.add(code);
    };
    scope.reset = function () {
        prev_data = window.prev_data = {};
        cc = {};
        vv = {};
    };
    scope.clear = function clear() {
        q_rtso.clear();
        s_rtso.clear();
    };
    scope.change = function change() {
        let code = $stock_code.val();
        q_rtso.change(code);
        s_rtso.change(code);
    };
    scope.pause = function pause() {
        q_rtso.pause();
        s_rtso.pause();
    };


    /*    $('#reset').on('click', function(){

     });*/

});