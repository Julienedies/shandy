/**
 * Created by Julien on 2014/8/13.
 * 列表数据管理,增删改查
 */

const EventEmitter = require('events').EventEmitter;

/**
 *
 * @param conf
 * @constructor
 * @example
 * var conf = { broadcast:true, //是否广播事件
 *              eventPrefix:'holdModel', //广播事件前缀
 *              key:'hold.id',  //记录id
 *              beforeSave:function(record,index){}
 *             };
 * var list = new recordManager(conf);
 */
function RecordManager(conf) {
    // 配置
    conf && conf.constructor === Object && Object.assign(this, conf);
    this._pool = [];
}

var proto = {
    /**
     * 默认每条记录的主键为id；
     */
    key: 'id',
    /**
     * @param arr {Array}  要管理的数据对象
     * @return {this}
     */
    init: function (arr) {
        if (!Array.isArray(arr)) throw 'must be Array on init';
        var that = this;
        arr.forEach(function (record, i) {
            that.beforeSave(record, i);
        });
        this._pool = arr;
        return this;
    },
    /**
     * 获取查询结果
     * @param value  {*}            要查询的key值
     * @param query  {String}       要查询的key
     * @returns      {Array}        根据查询结果返回数组
     * @example
     * new recordManager().init([{id:1,y:2},{id:2,x:3}]).get();          // return [{id:1,y:2},{id:2,x:3}];
     * new recordManager().init([{id:1,y:2}]).get(1);                    // return [{id:1,y:2}];
     * new recordManager({k:'x'}).init([{x:1,y:2}]).get(1);              // return [{x:1,y:2}];
     * new recordManager({k:'x'}).init([{x:1,y:{z:3}}]).get(3,'y.z');    // return [{x:1,y:{z:3}}];
     * new recordManager().init([{id:1,y:2}]).get(2);                    // return [];
     */
    get: function (value, query) {
        var pool = this._pool;
        var r = [];
        if (value === void(0)) {
            return pool;
        }

        if (typeof value === 'object') {
            query = this.key;
            value = value[query];
        }

        for (let i in pool) {
            let record = pool[i];
            if (value == this._queryKeyValue(record, query)) {
                r.push(record);
            }
        }
        return r;
    },
    /**
     * 对查询结果记录进行修改
     * @param data      {Object}            要更新的数据
     * @param query     {String}            对key进行限定，只有对应的key变化，才修改
     * @returns         {Array or false}    返回修改过的记录数组，如果没有修改任何记录，返回false
     * @example
     * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x').set({y:3});     // result [{x:1,y:3},{x:1,y:3}]
     * new recoredManager().init([{x:1,y:2}]).find(2,'x').set({y:3});               // result false
     */
    set: function (data, query) {
        var that = this;
        var pool = this._pool;
        var id = data[this.key];
        var find = this._find || id && this.get(id);
        var result = [];
        if (!id || !find.length) {
            return this.add(data);
        }

        find.forEach(function (record) {

            if (query && that._queryKeyValue(record, query) === that._queryKeyValue(data, query))  return;

            var id = that._queryKeyValue(record);

            var index = that._getIndex(id);

            record = pool[index];

            result.push(Object.assign(record, data));

            that.beforeSave(record);

        });

        that.emit('change', {change: result});
        this.end();
        return result;
    },

    /**
     * 添加一条记录
     * @param {object} record
     */
    add: function (record) {
        this.beforeSave(record);
        var pool = this._pool;
        var id = this._queryKeyValue(record);
        pool.unshift(record);
        this.emit('change');
        return this;
    },
    /**
     * 删除一条记录
     * @param value  {*}            要查询的key值 可选
     * @param key  {String}         要查询的key  可选
     * @return   {Array}   被删除的记录集合
     * @example
     * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x').remove();  // result this._pool == {}; return [{x:1,y:2},{x:1,y:5}];
     * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).remove(1,'x');  // result this._pool == {}; return [{x:1,y:2},{x:1,y:5}];
     */
    remove: function (value, key) {
        var that = this;
        var pool = this._pool;
        var find = this._find || this.get(value, key);
        console.info('pool => ', pool.length);
        console.log('find => ', find.length);
        if (find.length) {
            find.forEach(function (record) {
                console.info('remove => ', record);
                var index = that._getIndex(record);
                index !== undefined && pool.splice(index, 1);
            });
            this.emit('change');
        }
        this.end();
        return find;
    },
    /**
     * 清空所有记录
     * @returns {proto}
     */
    clear: function () {
        this._pool = [];
        this.end();
        this.emit('change', {e: 'clear'});
        return this;
    },
    /**
     * 根据key value查找记录
     * @param value  {*}            要查询的key值
     * @param key  {String}         要查询的key
     * @returns {this}
     * @example
     * new recoredManager().init([{x:1,y:2},{x:1,y:{z:7}}]).find(1,'x')  // result this._find == [{x:1,y:2},{x:1,y:5}];
     * new recoredManager().init([{x:1,y:2},{x:1,y:{z:7}}]).find(7,'y.z')  // result this._find == [{x:1,y:{z:7}}];
     */
    find: function (value, key) {
        this._find = this.get(value, key);
        return this;
    },
    /**
     * 获取查询结果记录集合
     * @returns {Array or undefined}
     * @example
     * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x')  // return [{x:1,y:2},{x:1,y:5}];
     */
    result: function () {
        return this._find;
    },
    /**
     * @todo 清空上次链式调用的结果
     */
    end: function () {
        this._find = void(0);
    },
    /**
     * 插入或修改一条记录时的回调函数
     * @param record
     * @param index
     */
    beforeSave: function (record, index) {
        let id = record.id;
        // 如果没有主键,生成一个随机主键
        if (typeof id == 'undefined' || id == '') {
            record.id = Math.random().toFixed(7).replace('0.', '');
        }
        return record;
    },
    create_id: function(){

    },
    /**
     * 查询键值
     * @param record
     * @param k {String}  一条记录的属性名,支持.号分割 可选 默认为this.key
     * @returns {*}  返回k对应的属性值
     * @private
     * @example
     * var record = {x:1, y:{z:2}};
     * new RecordManager().init([record])._queryKeyValue(record, 'y.z');  //return 2;
     * new RecordManager().init()._queryKeyValue(record, 'y.z');  //return 2;
     */
    _queryKeyValue: function (record, k) {
        return this._get(record, k).v;
    },
    _get: function (record, k) {

        var chain = (k || this.key).split('.');

        var value = (function (chain, record) {

            var k = chain.shift();
            var v = record[k];

            if (chain.length) {
                return arguments.callee(chain, v);
            }

            return v;

        })(chain, record);

        return {r: record, v: value};

    },

    _getIndex: function (record, query) {
        var pool = this._pool;

        var v = typeof record === 'object' ? this._queryKeyValue(record, query) : record;

        for (var i in pool) {

            if (this._queryKeyValue(pool[i], query) === v) return i;

        }
    },

    /**
     * @todo  把一条记录位置移动到目标记录前
     * @param id   {Object | uid},  要移动的记录
     * @param before_id {Object | uid}, 目标记录, 可选, 如果没有提供, 则默认是首条记录
     */
    insert: function(id, before_id){

        var pool = this._pool;

        var index = this._getIndex(id);

        var arr = pool.splice(index, 1);  // 从数组中删除
        var record = arr[0];

        var before_index = before_id ? this._getIndex(before_id) : 0;

        pool.splice(before_index, 0, record);  // 重新插入

        this.emit('change');

    }

};

// 继承事件管理接口: on  emit
RecordManager.prototype = Object.create(EventEmitter.prototype);

// 扩展原型对象
Object.assign(RecordManager.prototype, proto);

// export
module.exports = function (conf) {
    return new RecordManager(conf);
};