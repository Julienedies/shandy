/**
 * 列表数据管理,增删改查
 * 这个是后端使用的，跟brick里的 RecordManager是不同的版本
 * 这个是后端使用的，跟brick里的 RecordManager是不同的版本
 * 这个是后端使用的，跟brick里的 RecordManager是不同的版本
 * Created by Julien on 2014/8/13.
 */

const EventEmitter = require('events').EventEmitter;

/**
 * @constructor
 * @param conf
 * @example
 * let conf = { broadcast:true, //是否广播事件
 *              eventPrefix:'holdModel', //广播事件前缀
 *              key:'hold.id',  //记录id
 *              joinType:''， // 添加记录方式，push or unshift
 *              beforeGet: function(record, index){return record;},
 *              beforeSave:function(record,index){}
 *             };
 * let list = new recordManager(conf);
 */
function RecordManager(conf) {
    // 配置
    conf && conf.constructor === Object && Object.assign(this, conf);
    this._pool = [];
}


// 这个版本是后端使用的，跟brick里的 RecordManager是不同的版本
// 这个版本是后端使用的，跟brick里的 RecordManager是不同的版本
// 这个版本是后端使用的，跟brick里的 RecordManager是不同的版本
let proto = {
    /**
     * 默认每条记录的主键为id；
     * 默认后添加的在前面：unshift
     */
    key: 'id',
    joinType: 'unshift',
    beforeGet: null,

    /**
     * 插入或修改一条记录时的回调函数
     * @param record
     * @param index
     */
    beforeSave: function (record, index) {
        let id = record.id;
        // 如果没有主键,生成一个随机主键
        if (typeof id === 'undefined' || id === '') {
            record.id = this._createId();
        }
        // 如果有level属性, 但level为空, 设默认为1;
        let level = record.level;
        if (level === '') {
            // level = 1 + '.' + (+ new Date());
            record.level = 1;
        }

        // 添加时间戳
        let timestamp = record.timestamp;
        if (typeof timestamp === 'undefined' || timestamp === '') {
            record.timestamp = +new Date();
        }

        return record;
    },

    /**
     * @param arr {Array}  要管理的数据对象
     * @return {this}
     * 因为是取数据，数据并没有改变，所以没有触发change事件
     */
    init: function (arr) {
        if (!Array.isArray(arr)) throw 'must be Array on init';
        let that = this;
        arr.forEach(function (record, i) {
            that.beforeSave(record, i);
        });
        this._pool = arr;
        return this;
    },

    /**
     * 遍历数据池, 能直接修改记录管理器里的数据，但并不会将改变直接保存到json文件，需要手动触发
     * @param cb {Function} 遍历回调函数
     */
    each: function (cb) {
        this._pool.forEach((item, index) => {
            cb(item, index);
        });
        return this;
    },

    /**
     * 此方法会触发change事件，保存当前数据池到json文件
     */
    save: function () {
        this.emit('change', 'save');
        return this;
    },

    /**
     * 替换save方法
     *
     * @returns this
     */
    change: function () {
        this.emit('change');
        return this;
    },

    /**
     * 获取查询结果， 总是返回数组
     * @param [value]  {*}            要查询的key值， 或者是一个过滤函数
     * @param [query]  {String}       要查询的key
     * @returns      {Array}        根据查询结果返回数组
     * @example
     * new recordManager().init([{id:1,y:2},{id:2,x:3}]).get();          // return [{id:1,y:2},{id:2,x:3}];
     * new recordManager().init([{id:1,y:2}]).get(1);                    // return [{id:1,y:2}];
     * new recordManager({k:'x'}).init([{x:1,y:2}]).get(1);              // return [{x:1,y:2}];
     * new recordManager({k:'x'}).init([{x:1,y:{z:3}}]).get(3,'y.z');    // return [{x:1,y:{z:3}}];
     * new recordManager().init([{id:1,y:2}]).get(2);                    // return [];
     */
    get: function (value, query) {
        let pool = this._pool;
        let beforeGet = this.beforeGet;
        let result = [];

        // 如果提供的value是一个过滤函数
        if (typeof value === 'function') {
            for (let i = 0; i < pool.length; i++) {
                let record = pool[i];
                if (value(record, i)) {
                    result.push(record);
                }
            }
            return result;
        }

        // 没有提供参数，返回整个数据池
        if (value === void (0)) {
            return pool;
        }

        // 如果传入object，value设为object的id， 这是仿自jquery的方法，其实不是很好
        if (typeof value === 'object') {
            query = this.key;
            value = value[query];
        }


        for (let i = 0; i < pool.length; i++) {
            let record = pool[i];
            if (value === this._queryKeyValue(record, query)) {
                result.push(record);
            }
        }

        return result;
    },

    /**
     * get的包装，返回的是this.get()的copy, 如果是get(id), 返回单个对象而不是数组；
     * 另外在返回结果前调用beforeGet函数进行处理，譬如结合 system或tags 的图片数据
     *
     * @param [value] {*}
     * @param [query] {String}
     * @return {Array|Object}
     */
    get2: function (value, query) {
        let isFilterCb = typeof value === 'function';
        let beforeGet = this.beforeGet;
        let result = this.get(value, query);
        result = JSON.parse(JSON.stringify(result));

        if (result.length < 2 && !isFilterCb && (query === this.key || (value && query === undefined))) {
            result = result[0];
            return beforeGet ? beforeGet(result, 0) : result;
        } else {
            return beforeGet ? result.map(beforeGet) : result;
        }

    },

    /**
     * 对查询结果记录进行修改
     * @param data      {Object}            要更新的数据
     * @param query     {String}            对key进行限定，只有对应的key变化，才修改
     * @returns         {Array | false}    返回修改过的记录数组，如果没有修改任何记录，返回false
     * @example
     * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x').set({y:3});     // result [{x:1,y:3},{x:1,y:3}]
     * new recoredManager().init([{x:1,y:2}]).find(2,'x').set({y:3});               // result false
     */
    set: function (data, query) {
        let that = this;
        let pool = this._pool;
        let id = data[this.key];
        let find = this._find || id && this.get(id);
        let result = [];
        if (!id || !find.length) {
            return this.add(data);
        }

        find.forEach(function (record) {

            if (query && that._queryKeyValue(record, query) === that._queryKeyValue(data, query)) return;

            let id = that._queryKeyValue(record);

            let index = that._getIndex(id);

            record = pool[index];

            result.push(Object.assign(record, data));

            that.beforeSave(record);

        });

        that.emit('change', { change: result });
        this.end();
        return result;
    },
    
        /**
     * 替换一条记录
     * @param {Object} newRecord  准备覆盖旧record的新记录
     */
    replace: function (newRecord) {
        let that = this;
        let pool = this._pool;
        let id = newRecord[this.key];
        let index = that._getIndex(id);
        if (index !== undefined) {
            pool[index] = newRecord;
            that.emit('change', {e: 'replace', change: newRecord});
        } else {
            throw new Error('没有找到要替换的record');
        }
    },

    /**
     * 添加一条记录
     * @param {object} record
     */
    add: function (record) {
        this.beforeSave(record);
        let pool = this._pool;
        let id = this._queryKeyValue(record);
        // push or unshift
        pool[this.joinType](record);
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
        let that = this;
        let pool = this._pool;
        let find = this._find || this.get(value, key);
        console.info('pool => ', pool.length);
        console.log('find => ', find.length);
        if (find.length) {
            find.forEach(function (record) {
                console.info('remove => ', record);
                let index = that._getIndex(record);
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
        this.emit('change', { e: 'clear' });
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
     * @returns {Array | undefined}
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
        this._find = void (0);
    },

    /**
     * 生成唯一ID
     * @returns {String}
     */
    _createId: function () {
        let r = Math.random().toFixed(5).replace('0.', '');
        let timestamp = +new Date();
        return `id_${timestamp}_${r}`;
    },

    /**
     * 查询键值
     * @param record
     * @param k {String}  一条记录的属性名,支持.号分割 可选 默认为this.key
     * @returns {*}  返回k对应的属性值
     * @private
     * @example
     * let record = {x:1, y:{z:2}};
     * new RecordManager().init([record])._queryKeyValue(record, 'y.z');  //return 2;
     * new RecordManager().init()._queryKeyValue(record, 'y.z');  //return 2;
     */
    _queryKeyValue: function (record, k) {
        return this._get(record, k).v;
    },

    _get: function (record, k) {

        let chain = (k || this.key).split('.');

        let value = (function fx(chain, record) {

            let k = chain.shift();
            let v = record[k];

            if (chain.length) {
                return fx(chain, v);
            }

            return v;

        })(chain, record);

        return { r: record, v: value };
    },

    /**
     * 获取记录的索引
     * @param record
     * @param query
     * @returns {number}
     * @private
     */
    _getIndex: function (record, query) {
        let pool = this._pool;

        let v = typeof record === 'object' ? this._queryKeyValue(record, query) : record;

        for (let i = 0; i < pool.length; i++) {
            if (this._queryKeyValue(pool[i], query) === v) return i;
        }

    },

    /**
     *  把一条记录位置移动到目标记录前
     * @param id   {Object | uid},  要移动的记录
     * @param [dest] {Object | uid}, 目标记录, 可选, 如果没有提供, 则默认是首条记录
     */
    insert: function (id, dest) {

        console.log('recordManager.insert', id, dest);

        let pool = this._pool;

        let index = this._getIndex(id);

        let arr = pool.splice(index, 1);  // 从数组中删除
        let record = arr[0];

        let destIndex = dest ? this._getIndex(dest) : 0;

        pool.splice(destIndex, 0, record);  // 重新插入

        this.emit('change');
    },

    /**
     * 改变记录索引位置
     * @param id
     * @param destID
     */
    move: function (id, destID) {
        this.insert(id, destID);
    },

    /**
     * 调整记录位置,在队列里向前移动一位
     * @return
     * @example
     *
     * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x').prev();
     */
    prev: function (record) {
        let pool = this._pool;
        let id = this._queryKeyValue(record);
        let index = this._getIndex(id);

        if (pool.splice) {
            pool.splice(index, 1);
            pool.splice(--index, 0, record);
        }

        this.emit('change', { target: record });

    }

};


// 继承事件管理接口: on  emit
RecordManager.prototype = Object.create(EventEmitter.prototype);


// 扩展原型对象
Object.assign(RecordManager.prototype, proto);


export default function (conf) {
    return new RecordManager(conf);
}
