/**
 * 对象数据管理 object manager
 * Created by j on 18/6/16.
 */

import events from 'events'
import _ from 'lodash'

const EventEmitter = events.EventEmitter;

function Objm(){
    this._pool = {};
}

const proto = {

    init: function(data){
        this._pool = data;
        this.emit('change');
        return this;
    },

    get: function (key) {
        if (!key) return this._pool;

        let keys = key.split('.');

        return (function x(namespace, keys) {
            let k = keys.shift();
            let o = namespace[k];
            if (o && keys.length) return x(namespace[k], keys);
            return o;
        })(this._pool, keys);

    },

    set: function (key, val) {

        if(typeof key == 'object'){

            Object.assign(this._pool, key);

        }
        else
        if(typeof key == 'string'){

            let old = this.get(key);
            if (old && _.isObject(old) && _.isObject(val)) return Object.assign(old, val);
            this._set(key, val);

        }

        this.emit('change');
    },

    _set: function (key, val) {

        let keys = key.split('.');

        (function x(namespace, keys) {
            let k = keys.shift();
            let o = namespace[k];
            if (keys.length) {
                if (!o) o = namespace[k] = {};
                x(o, keys);
            } else {
                if (val === undefined) return delete namespace[k];
                namespace[k] = val;
            }
        })(this._pool, keys);

    },
    remove: function (key) {
        this.set(key);
        this.emit('change');
    },
    clear: function () {
        this._pool = {};
        this.emit('change');
    }
};

// 继承事件管理接口: on  emit
Objm.prototype = Object.create(EventEmitter.prototype);

// 扩展原型对象
Object.assign(Objm.prototype, proto);

export default function(){
    return new Objm();
}
