/**
 * Created by j on 18/6/16.
 */

/**
 * Created by j on 18/6/16.
 * 对象管理器  object manager
 */

const _ = require('underscore');

module.exports = function(namespace){
    return new F(namespace);
};

function F(namespace){
    this.namespace = namespace || +new Date + '';
    this._pool = {};
    this._listeners = [];
}

F.prototype = {

    get: function (key) {
        if (!key) return this._pool;

        var keys = key.split('.');

        return (function x(namespace, keys) {
            var k = keys.shift();
            var o = namespace[k];
            if (o && keys.length) return x(namespace[k], keys);
            return o;
        })(this._pool, keys);

    },

    set: function (key, val) {

        var old = this.get(key);

        if (old && _.isObject(old) && _.isObject(val)) return _.extend(old, val);

        this._set(key, val);

        this._fire('change');
    },

    _set: function (key, val) {

        var keys = key.split('.');

        (function x(namespace, keys) {
            var k = keys.shift();
            var o = namespace[k];
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
        this._fire('remove', key);
    },
    clear: function () {
        this._pool = {};
        this._fire('clear');
    },
    on: function(e, f){
        this._listeners.push(f);
    },
    off: function(e, f){

    },
    _fire: function(e, msg){
        this._listeners.forEach(function(f){
            f(e, msg);
        });
    }

};