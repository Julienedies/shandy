/**
 * Created by j on 18/5/27.
 * @todo 通达信软件快捷键脚本化接口
 */

const robot = require("robotjs");
const ac = require('./ac.js');


function _keyTap(keys) {
    var delay = 100;
    var key = keys.shift();
    if (key) {
        // if (key == 'enter') delay = 300;
        setTimeout(function () {
            robot.keyTap(key);
            _keyTap(keys);
        }, delay);
    }
}

function keyTap(keys) {
    // 需要稍微延迟，确保通达信窗口获得焦点
    setTimeout(function () {
        _keyTap(keys);
    }, 300);
}

module.exports = {
    _datum_limit: 30, // 方法默认调用间隔限制为30秒
    _obj_limit: {},
    _call_limit: function (f_id, limit) {
        limit = limit || this._datum_limit;
        let o = this._obj_limit;
        let f_o = o[f_id];
        let now = +new Date();
        // 首次调用
        if (!f_o) {
            o[f_id] = {limit: limit, last: now};
            return true;
        } else {
            let reduce = Math.floor((now - f_o.last) / 1000);
            let not_limit = reduce > limit;
            this._limit_reduce = limit - reduce;
            if (not_limit) {
                f_o.last = now;
            }
            return not_limit;
        }
    },
    /**
     * @todo 在mac系统中使通达信程序获得当前焦点
     */
    active: function () {
        ac.activeTdx();
    },
    /**
     * @todo 激活通达信,键盘键入股票代码,显示个股K线界面
     * @param code {String}  股票code
     * @param datum {Number}  调用限制间隔秒数
     */
    view: function (code, datum) {
        this.show(code, datum);
    },
    show: function (code, datum) {
        //需要做调用限制
        if (this._call_limit('show', datum || 15)) {
            this.keystroke(code, true);
        } else {
            console.info(`tdx.show 调用限制,余${this._limit_reduce}秒`);
        }
    },
    view_in_ftnn: function (code) {
        ac.activeFtnn();
        code += '';
        let keys = code.split('');
        keys.push('enter');
        keyTap(keys);
    },
    cancel_order: function () {
        //需要做调用限制
        if (this._call_limit('cancel_order', 10)) {
            //this.active();
            //keyTap(['2', '2', 'enter']);
        } else {
            console.info(`tdx.cancel_order 调用限制,余${this._limit_reduce}秒`);
        }
    },
    keystroke: function (str, enter) {
        this.active();
        str += '';
        let keys = str.split('');
        enter && keys.push('enter');
        keyTap(keys);
    }

};



