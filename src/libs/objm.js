/**
 * Created by j on 18/6/16.
 * 对象管理器  object manager
 */

import _ from 'lodash'

class Objm {
    constructor (namespace){
        this.namespace = namespace || +new Date + '';
        this._pool = {};
        this._listeners = [];
    }

    init (data) {
        this._pool = data;
    }

    get (key) {
        if (!key) return this._pool;

        let keys = key.split('.');

        return (function x(namespace, keys) {
            let k = keys.shift();
            let o = namespace[k];
            if (o && keys.length) return x(namespace[k], keys);
            return o;
        })(this._pool, keys);

    }

    set (key, val) {

        let old = this.get(key);

        if (old && _.isObject(old) && _.isObject(val)) return _.extend(old, val);

        this._set(key, val);

        this._fire('change');
    }

    _set (key, val) {

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

    }
    remove (key) {
        this.set(key);
        this._fire('remove', key);
    }
    clear () {
        this._pool = {};
        this._fire('clear');
    }
    on(e, f){
        this._listeners.push(f);
    }
    off(e, f){

    }
    _fire(e, msg){
        this._listeners.forEach(function(f){
            f(e, msg);
        });
    }
    
}


export default function(namespace){
    return new Objm(namespace);
}