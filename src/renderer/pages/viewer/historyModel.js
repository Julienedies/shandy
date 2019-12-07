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
            this.group();
            this._cb();
        },
        group: function () {
            let arr = this._pool;
            let nameMap = _.groupBy(arr, (str) => {
                let arr = str.split('/');
                arr.pop();
                return arr.join('_');
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
/*            let arrByName = _.values(nameMap);
            arrByName.forEach((arr) => {
                arr.sort((a, b) => {
                    let f = (s) => {
                        let d = s.split('/').pop();
                        d = d.replace('-','.');
                        return d * 1 || 0;
                    };
                    return f(b) - f(a);
                });
            });

            this._pool = _.flatten(arrByName, true);*/
        },
        init: function (arr) {
            console.log(3333, arr);
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
