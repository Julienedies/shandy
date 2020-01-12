/**
 *
 * Created by j on 2019-12-07.
 */

import _ from 'lodash'

export default function () {
    return {
        _pool: [],
        _data: {},
        _cb: () => {},
        cb: function() {
            this._group();
            this._cb();
        },
        // 按照['X交割单学习', '目标行情','竞价系统','交易记录']进行分组
        _group: function () {
            let arr = this._pool;
            let nameMap = _.groupBy(arr, (str) => {
                let arr = str.split('/');
                arr.pop();
                return arr.pop(); //arr.join('_');
            });

            for(let i in nameMap) {
                let arr = nameMap[i];
                arr.sort((a, b) => {
                    let f = (s) => {
                        let d = s.split('/').pop();
                        d = d.replace('-','.');
                        return d * 1 || 0;
                    };
                    return f(b) - f(a);
                });
            }
            this._data = nameMap;
        },
        init: function (arr) {
            this._pool = arr;
            this.cb();
        },
        get: function () {
            return this._pool;
        },
        get2: function () {
           return this._data;
        },
        add: function (item) {
            if (!this._pool.includes(item)) {
                this._pool.unshift(item);
                this.cb();
            }
        },
        remove: function (item) {
            let index = this._pool.indexOf(item);
            this._pool.splice(index, 1);
            this.cb();
        },
        on: function (event, cb) {
            this._cb = cb;
        }
    }
}
