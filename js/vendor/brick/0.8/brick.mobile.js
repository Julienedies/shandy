/*!
 * https://github.com/julienedies/brick.git
 * https://github.com/Julienedies/brick/wiki
 * "9/19/2018, 6:21:31 PM"
 * "V 0.8"
 */
;
(function (window, undefined) {

// __inline是fis语法，用于嵌入代码片段，经过编译后会替换成对应的js文件内容；

// core架构 必选
/**
 * Created by j on 18/6/19.
 * @todo 在brick闭包内重写console,对原生console进行包装, 控制debug输出.
 */

var native_console = window.console;
var _console = native_console;

var console = {};

var _console_bak = {};
var _console_methods = [];

;
(function () {
    for (var i in _console) {
        var f = _console[i];
        if (typeof f == 'function') {
            _console_methods.push(i);
            (function (f) {
                _console_bak[i] = console[i] = function () {
                    var arr = [].slice.call(arguments, 0);
                    f.apply(_console, arr);
                };
            })(f);
        }
    }
})();


/*
 * @todo 管理console的行为,
 * @param bool {Boolean} [可选] console方法调用后是否输出
 * @param methods  {String}  [可选]  console方法名
 * @example
 * cc('info','log') or cc(false, 'info', 'log');  // console.log and console.info 调用后不会有输出
 * cc(true, 'info', 'log');  console.log and console.info 调用继续输出
 */
function cc(bool, methods) {
    var arr = [].slice.call(arguments);
    bool = arr.shift();
    methods = arr;
    if (typeof bool == 'undefined') {
        bool = false;
        methods = _console_methods;
    }
    else if (typeof bool == 'boolean') {
        methods = methods.length ? methods : _console_methods;
    }
    else if (typeof bool == 'string') {
        methods.unshift(bool);
        bool = false;
    }
    methods.forEach(function (method) {
        console[method] = bool ? _console_bak[method] : function () {
        };
    });
}


/**
 * Created by Juien on 2015/8/10.
 * 工具函数集合
 */
var utils = (function () {

    return {
        /**
         * @todo 恢复被转义的html
         * @param text {string} <必须> html类型字符串
         * @returns {*}
         */
        toHtml: function (text) {
            var c = $('<div></div>');
            c.html(text);
            return c.text();
        },
        /**
         * @todo 封装location.search为一个对象，如果不存在，返回undefined
         * @param str {string}  [可选]  location.search 格式字符串,
         * @returns {*}
         * @example brick.utils.get_query('a=1&b=2');  // {a:1, b:2}
         */
        get_query: function (str) {
            var result;
            var k;
            if (str && /^[-_\w]+$/i.test(str)) {
                k = str;
                str = '';
            }
            str = str && str.split('?').length > 1 ? str.split('?')[1] : str;
            //var query = location.search.replace(/^\?/i, '').replace(/\&/img, ',').replace(/^\,+/img,'').replace(/([^=,\s]+)\=([^=,\s]*)/img, '"$1":"$2"');
            var query = (str || location.search).replace(/^\?/i, '').replace(/\&/img, ',').replace(/^\,+/img, '');
            query.replace(/([^=,\s]+)\=([^=,\s]*)/img, function ($, $1, $2) {
                result = result || {};
                var k;
                var arr;
                $2 = decodeURIComponent($2);
                if (/\[\]$/i.test($1)) {
                    k = $1.replace(/\[\]$/i, '');
                    arr = result[k] = result[k] || [];
                    arr.push($2);
                } else {
                    result[$1] = $2;
                }
            });
            //    if(!query) return result;
            //    try {
            //        result = JSON.parse('{' + query + '}');
            //    } catch (e) {
            //        console.error(e);
            //        return;
            //    }

            //    for(var i in result){
            //        result[i] = decodeURIComponent(result[i]);
            //    }

            return k ? (result && result[k]) : result;
        }
    };

})();
/**
 * Created by julien.zhang on 2014/9/16.
 * 用于管理配置
 */

var config = (function () {

    var conf = {
        namespace: {
            prefix: 'ic'
        },
        event: {
            action: 'click'
        },
        ajax: {
            domain: ''
        },
        isMobile: /iPhone|iPad|iPod|iOS|Android/i.test(navigator.userAgent)
    };

    return {
        get: function (key) {
            if (!key) return _.extend({}, conf);

            var keys = key.split('.');

            return (function x(namespace, keys) {
                var k = keys.shift();
                var o = namespace[k];
                if (o && keys.length) return x(namespace[k], keys);
                return o;
            })(conf, keys);

        },

        set: function (key, val) {

            var old = this.get(key);

            if (old && _.isObject(old) && _.isObject(val)) return _.extend(old, val);

            this._set(key, val);
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
            })(conf, keys);

        }

    };


})();
/**
 * Created by julien.zhang on 2014/9/15.
 * 事件管理器
 */


var eventManager = (function () {

    var _events = {};

    return {

        /**
         * 订阅一个事件监听
         * @param e {String} 事件名
         * @param f {Function} 回调函数
         * @param context {Object} 调用watch方法的scope
         */
        on: function (e, f, context) {
            e = e.split(/[,\s]+/g);
            for (var i in e) {
                this._bind(e[i], f, context);
            }
        },
        _bind: function (e, f, context) {

            var handle = {f: f};

            var event = this._getNamespace(e);

            if (context) {
                handle.context = context;
            }

            var callback = event._callback = event._callback || [];

            callback.push(handle);
        },

        /**
         * 取消一个事件监听
         * @param e {String} 事件名
         * @param f {Function} 回调函数，可选，如果没有传递，则取消该事件下的所有监听
         */
        off: function (e, f) {
            e = e.split(/[,\s]+/g);
            for (var i in e) {
                this._unbind(e[i], f);
            }
        },
        _unbind: function (e, f) {
            var event = this._getNamespace(e);
            var callback = event && event._callback;
            var handle;

            if (callback) {

                if (!f) {
                    delete event._callback;
                    return;
                }

                for (var i = 0, len = callback.length; i < len; i++) {

                    handle = callback[i];

                    if (f === handle.f || f.toString() === handle.f.toString()) {
                        callback.splice(i, 1);
                        return;
                    }

                }
            }
        },

        /**
         *
         * @param e {String} 事件名
         * @param msg  {*}   任意想要传递的数据对象
         * @example
         * e = 'a.b.c';   会触发 ["a.b.c", "a.*.c", "a.*", "a.b.*"]
         */
        emit: function (e, msg, that) {

            var namespace = e.split(/\.|\:/);

            var prefix = namespace.shift();

            var events = [e];

            (function (arr, pre) {

                if (!arr.length) return;

                pre = pre ? pre + '.' : '';

                for (var i = 0, len = arr.length; i < len; i++) {

                    var arr1 = arr.slice();
                    arr1.splice(0, i + 1);
                    var event = pre + '*' + (arr1.length ? '.' + arr1.join('.') : '');
                    events.push(event);

                }

                pre += arr.shift();

                arguments.callee(arr, pre);

            })(namespace.slice(), prefix);


            for (var _e; _e = events.shift();) {

                this._fire(_e, msg, that);

            }

        },

        _fire: function (e, msg, that) {

            var event = this._getNamespace(e);
            var callback = event && event._callback;
            var handle;
            var context;
            var f;

            if (callback) {

                for (var i = 0, len = callback.length; i < len; i++) {

                    handle = callback[i];
                    context = handle.context || {};
                    f = handle.f;

                    if (f.constructor === Function) {
                        f.apply(context, [
                            {eventName: e, source: that},
                            msg
                        ]);
                    }

                }

            }

        },

        _getNamespace: function (e) {

            return _events[e] = _events[e] || {};

            var namespace = e.split('.');

            return (function (k, _events) {

                var i = k.shift();
                var o = _events[i] = _events[i] || {};

                if (k.length) {
                    return arguments.callee(k, o);
                }

                return o;

            })(namespace, _events);

        },

        _look: function () {
            console.log(_events);
        }


    };

})();
/**
 * Created by julien.zhang on 2014/9/15.
 * 控制器管理器
 */


var controllers = (function () {

    // 存储控制器
    var _ctrls = {};

    function extend(dist, o) {
        if(typeof o == 'object') {
            for (var i in o) {
                dist[i] = o[i];
            }
        }
        return dist;
    }

    // scope原型对象
    function _F() {
    }

    extend(_F.prototype, {

        set: function (key, val) {
            this[key] = val;
            this.render();
        },

        get: function (key) {
            return this[key];
        },
        // 用于存储数据模型
        _model : {},
        /**
         * 用于触发事件
         * @param e {String} 事件名
         * @param msg {*}    任意要传递的数据
         */
        emit: function (e, msg) {
            var that = this;
            eventManager.emit(e, msg, that);
        },
        /**
         * 用于订阅事件
         * @param e  {String}   事件名
         * @param f  {Function} 回调函数，接受两个参数e(事件对象，由框架封装提供），msg(用户自定义数据)
         */
        on: function (e, f) {
            var that = this;
            eventManager.on(e, f, that);
        },
        /**
         * 取消事件监听
         * @param e {String}   事件名
         * @param f {Function} 回调函数
         */
        off: function (e, f) {
            eventManager.off(e, f);
        },
        render: function (tplName, model, call) {
            var that = this;
            if(tplName == undefined){
                tplName = this._name;
                model = this._model;
            }
            else
            if (typeof tplName == 'function') {
                call = tplName;
                tplName = that._name;
                model = that;
            }
            else
            if (typeof tplName == 'object') {
                call = model;
                model = tplName;
                tplName = that._name;
            }
            setTimeout(function () {
                var $tpl_dom = that._render(tplName, model);
                if($tpl_dom){
                    brick.compile($tpl_dom, true);
                    call && call.apply($tpl_dom, []);
                }
            }, 30);
        },
        _render: function (tplName, model) {
            console.log('render => ', tplName, model);
            var $elm = this.$elm;
            var tpl_fn = brick.getTpl(tplName);  //模板函数
            var selector = '[ic-tpl=?],[ic-tpl-name=?]'.replace(/[?]/img, tplName);
            var $tpl_dom; // 有ic-tpl属性的dom元素
            var html;
            // 如果数据模型不是对象类型,则对其包装
            /*if(typeof model != 'object' || Array.isArray(model)){
                model = {model : model};
            }*/
            $tpl_dom = $elm.filter(selector);  // <div ic-ctrl="a" ic-tpl="a"></div>
            $tpl_dom = $tpl_dom.length ? $tpl_dom : $elm.find(selector);
            html = tpl_fn({model : model});
            $tpl_dom.show(); // 渲染模板后进行编译
            $tpl_dom.removeAttr('ic-tpl');
            return $tpl_dom.html(html);
        }

    });

    // scope对象
    function F(name) {
        this._name = name;
    }
    function f(name, o) {
        F.prototype = new _F();  // 继承scope原型对象
        extend(F.prototype, o);  // 继承parent scope
        return new F(name);
    }


    return {
        /**
         * 获取一个控制器的scope对象
         * @param name {String} 控制器ID
         */
        get: function (name) {
            return name && _ctrls[name] && _ctrls[name].scope;
        },
        /**
         * 注册控制器
         * @param name {String}   控制器ID
         * @param ctrl {Function} 控制器的工厂函数
         * @param conf {Object}   可选，控制器config (可以定义依赖，是否注册为global变量，是否做为service)
         */
        reg: function (name, ctrl, conf) {
            conf = conf || {};
            var depend = conf.depend || [];
            _ctrls[name] = {fn: ctrl, depend: depend, service: conf.service, conf: conf};
        },

        /**
         * 运行控制器
         * @param name
         * @param parent {scope} 父scope对象
         * @param $elm  {jQuery} 绑定scope对象的dom
         */
        exec: function (name, parent, $elm) {

            var ctrl = _ctrls[name];
            if (!ctrl) return console.info('not find controller ' + name);

            var conf = ctrl.conf;
            var scope;
            var depend = ctrl.depend;

            scope = parent ? f(name, parent) : f(name);
            scope._parent = parent && parent._name;
            scope.$elm = $elm;
            ctrl.scope = scope; // 如果有多个控制器实例，则该名下控制器的作用域对象引用的会是最后一个实例化控制器的作用域对象
            $elm.data('ic-ctrl-scope', scope);  // 用于区别多个同名控制器下的正确继承

            depend = services.get(depend) || [];
            depend = depend.constructor !== Array ? [depend] : depend;
            depend.unshift(scope);

            console.log('exec controller factory: ', name );
            ctrl.fn.apply(scope, depend);  // 注入scope和依赖,执行factory

            //ctrl.exec = (ctrl.exec || 0) + 1;

            //if(conf.global) window[name] = scope;
            return scope;
        },

        _look: function () {
            return _ctrls;
        }
    };

})();
/**
 * Created by julien.zhang on 2014/9/15.
 *
 * 服务管理器 （任意类型的数据，模型对象，UI组件都可以做为服务存在；通常是单例对象）
 */

var services = (function() {

    var services = {};
    var registry = {};

    return {
        _look: function () {
            console.log(registry);
        },
        /**
         * 注册服务
         * @param name {String}    服务ID
         * @param serve {Function} 服务的工厂函数
         * @param depend {Array}   可选，依赖的其它服务
         */
        add: function (name, serve, depend) {
            registry[name] = {depend: depend, serve: serve};
        },
        reg: function (name, factory, conf){
            var depend = conf && (conf.constructor === Array ? conf : conf.depend);
            registry[name] = {depend: depend, serve: factory, conf: conf};
        },
        /*
         * 实例化一个服务
         */
        create: function (name) {
            var that = this;
            var info = registry[name];

            if (!info) return;

            var depend = info.depend;
            if (depend) {
                depend = that.get(depend);
            }

            window[name] = info.serve.apply(null, depend || []);
            return window[name];
        },

        /**
         * 直接注册一个已经实例化的服务
         * @param name {String} 服务ID
         * @param service {*}   任意数据对象
         */
        fill: function (name, service) {
            services[name] = service;
        },

        /**
         * 获取一个服务实例
         * @param name {String} 服务器ID
         * @return 服务 {*}  任意类型，取决于当初注册时的服务对象
         */
        get: function (name) {
            var that = this;
            if (!name) return;

            //外部get
            if (typeof name === 'string') {
                return services[name] = services[name] || that.create(name);
            }

            //内部get
            if (name.constructor === Array) {

                name = name.slice();

                for (var i = 0, v, len = name.length; i < len; i++) {
                    v = name[i];
                    name[i] = services[v] = services[v] || that.create(v);
                }

                return name;
            }
        }
    };

})();
/**
 * Created by julien.zhang on 2014/9/17.
 */

var directives = {

    _pool: {},

    add: function (name, definition, conf) {
        this.reg(name, definition, conf);
    },

    reg: function (name, definition, conf) {
        if(typeof name == 'object'){
            conf = name;
            name = conf.name;
        }else if(typeof definition == 'object') {
            conf = definition;
        }else{
            conf = conf || {};
            conf.fn = definition;
        }
        this._pool[name] = conf;
    },

    get: function (name) {
        return name ? this._pool[name] : this._pool;
    },

    exec: function (name, $elm, attrs) {
        var _pool = this._pool;
        var definition = _pool[name];

        if (typeof definition === 'function') {
            definition.apply(null, [$elm, attrs]);
        } else if (definition.fn) {
            definition.fn.apply(null, [$elm, attrs]);
            if (definition.once) {
                delete _pool[i];
            }
        }
    },

    init: function () {
        var _pool = this._pool;
        for (var i in _pool) {
            var definition = _pool[i];
            if (definition.selfExec) {
                definition.fn && definition.fn();
                if (definition.once) {
                    delete _pool[i];
                }
            }
        }
    }

};


/**
 * Created by julien.zhang on 2014/9/12.
 * 主要用于解析一个dom节点上绑定的tpl指令
 */

function parser(node) {

    if (node.nodeType == 1) {

        var elm = $(node);
        var attrs = node.attributes;

        var directives = [];

        var priority = {
            'skip': -100,
            'init': -10,
            'for': 0,
            'for-start': 1,
            'for-init': 10,
            'if': 100,
            'else-if': 99,
            'if-start': 100,
            'if-init': 110,
            'else': 100,
            'bind': 1000,
            'if-end': 10000,
            'for-end': 10000
        };


        for (var i = 0, attr, name, value, l = attrs.length; i < l; i++) {

            attr = attrs[i];

            name = attr.name;
            value = attr.value;

            if (/^ic-(skip|init|for|if|else|bind)/.test(name) || /\{\{.+?\}\}/.test(value)) {
                directives.push([name, value]);
                //continue;
            }

        }

        //对指令按优先级排序
        directives.sort(function (a, b) {
            return priority[a[0].replace(/^ic-/, '')] - priority[b[0].replace(/^ic-/, '')];
        });


        //处理每一个指令
        while (attr = directives.shift()) {

            name = attr[0];
            value = attr[1];

            if (/-skip$/.test(name)) {
                elm.remove();
                return;
            }

            if (/-init$/.test(name)) {
                elm.before('\r\n<% var ' + value.replace(/;(?=\s*[_\w]+\s*=)/g, ';var ') + ' %>\r\n');
                elm.removeAttr(name);
                continue;
            }

            if (/-for$/.test(name)) {
                //elm.before('<% for( var ' + value + '){ %>\r\n');
                // old reg /^\s*(?:(\w+?)\s*\,\s*)?(\w+?)\s*in\s*((?:[\w.]+)|(?:\[[^\[\]]+\]))\s*$/
                elm.before(value.replace(/^\s*(?:(\w+?)\s*\,\s*)?(\w+?)\s*in\s*(.+)\s*$/, function (m, $1, $2, $3, t) {
                    if ($1 && $2) return '<% for( var ' + $1 + ' in ' + $3 + '){ var ' + $2 + ' = ' + $3 + '[' + $1 + ']; %>\r\n';
                    return '<% for( var ' + m + '){ %>\r\n';
                }));
                elm.after('\r\n<% } %>');
                elm.removeAttr(name);
                continue;
            }

            if (/-for-start$/.test(name)) {
                elm.before(value.replace(/^\s*(?:(\w+?)\s*\,\s*)?(\w+?)\s*in\s*([\w.]+)/, function (m, $1, $2, $3, t) {
                    if ($1 && $2) return '<% for( var ' + $1 + ' in ' + $3 + '){ var ' + $2 + ' = ' + $3 + '[' + $1 + ']; %>\r\n';
                    return '<% for( var ' + m + '){ %>\r\n';
                }));
                elm.removeAttr(name);
                continue;
            }

            if (/-for-end$/.test(name) || /-if-end$/.test(name)) {
                elm.after('\r\n<% } %>');
                elm.removeAttr(name);
                continue;
            }


            if (/-else-if$/.test(name)) {
                elm.before('<% } else if(' + (value === '' ? void(0) : value) + '){ %>\r\n');
                elm.removeAttr(name);
                continue;
            }

            if (/-if$/.test(name)) {
                elm.before('<% if(' + (value === '' ? void(0) : value) + '){ %>\r\n');
                elm.after('\r\n<% } %>');
                elm.removeAttr(name);
                continue;
            }


            if (/-if-start$/.test(name)) {
                elm.before('<% if(' + (value === '' ? void(0) : value) + '){ %>\r\n');
                elm.removeAttr(name);
                continue;
            }

            if (/-else$/.test(name)) {
                elm.before('<% } else{ %>\r\n');
                elm.after('\r\n<% } %>');
                elm.removeAttr(name);
                continue;
            }

            if (/-bind$/.test(name)) {
                elm.html('\r\n<%= ' + (value === '' ? '\"\"' : value) + ' %>\r\n');
                elm.removeAttr(name);
                continue;
            }

            if (/^ic-(?:href|src|style|class|data|value)$/.test(name)) {
                elm.removeAttr(name);
                elm.attr(name, value.replace(/{{(.+?)}}/g, '<%= $1 %>'));
                continue;
            }

            elm.attr(name, value.replace(/{{(.+?)}}/g, '<%= $1 %>'));

        }

        return;

    }

    if (node.nodeType == 3) {

        var text = node.nodeValue;

        node.nodeValue = text.replace(/{{(.+?)}}/g, '<%= $1 %>');

    }


}
/**
 * Created by julien.zhang on 2014/9/15.
 * 遍历dom节点，根据指令生成一个编译过的模板渲染函数
 */

function createRender(root) {

    root = root.cloneNode(true);

    //遍历dom节点，解析指令
    (function (node) {

        parser(node);

        var children = $(node).contents();
        var child;
        var i = 0;
        while (child = children.eq(i)[0]) {
            i++;
            arguments.callee(child);
        }

    })(root);

    var _tpl = $(root).html()
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\b(ic-)(?=href|src|style|class|data|value)/g, '')
        //早期判断是否输出属性的实现，建议使用ic-has-[prop]指令取代
        .replace(/\bic-(\w+-)?(checked|disabled|selected|enabled)\s*=\s*"\s*((?:[^"]|\\")+)["]/g, function (m, $1, $2, $3) {
            if ($1 == 'has-') return m;
            $1 = $1 ? 'ic-' + $1 : '';  //处理自定义指令  ic-tab-checked
            //$3 = $3.replace(/^(?:"|')|(?:"|')$/g,'');
            return ' <% if(?3){ %> ?2 <% } %> '.replace('?3', $3).replace('?2', $1 + $2);
        })
        //实现ic-has-[prop]指令   处理两种情况=>  1: ic-has-checked  2: ic-has-tab-checked
        .replace(/\bic-has-([-_\w]+)\s*=\s*(["])((?:[^"]|\\["])+)\2/img, function (m, $1, $2, $3) {
            //$1 => 属性名   $3 => 表达式值
            console.log($1);
            console.log($3);
            $1 = /^checked|disabled|selected|enabled$/.test($1) ? $1 : 'ic-'+$1; //处理两种情况=>  1: ic-has-checked  2: ic-has-tab-checked
            return ' <% if(?3){ %> ?1 <% } %> '
                .replace('?3', $3)
                .replace('?1', $1);
            //.replace('?1',$1 + '=' + ('"<%= ? %>"'.replace('?', $3)));
        })
        .replace(/&amp;&amp;/g, '&&');

    console.log(_tpl);

    try{
        var tpl_fn = _.template(_tpl);
    }catch(e){
       return console.error(e, _tpl);
    }

    tpl_fn._tpl_ = _tpl;
    return tpl_fn;

}
/*!
 * Created by julien.zhang on 2014/12/9.
 */

/**
 *
 * @param node  dom or jquery object
 * @param is_start_form_children  bool 可选,  true 表示直接从子元素开始编译
 */
function compile(node, is_start_form_children){

    var $elm = $(node);

    !is_start_form_children && __compile(node);

    var children = $elm.children();
    var child;
    var i = 0;
    while (child = children.eq(i)[0]) {
        i++;
        compile(child);
    }
}


function __compile(node){

    node = node[0] || node;  // jquery对象转为dom对象
    if(node.nodeType != 1) return console.info('compile exit', node);

    var $elm = $(node);
    var attrs = node.attributes;

    var _directives = [];

    var priority = {
        'ic-ctrl': -1000
    };

    var j = 0;
    _.each(directives.get(), function(v, i, list){

        if(typeof v === 'object' && v.priority){
            priority[i] = v.priority;
            return;
        }
        priority[i] = j++;

    });


    var name;

    for (var i = 0, l = attrs.length; i < l; i++) {

        name = attrs[i].name;

        if (directives.get(name)) {
            _directives.push(name);
            continue;
        }

    }

    //对指令按优先级排序
    _directives.sort(function(a, b){
        return priority[a] - priority[b];
    });

    //处理每一个指令
    while (name = _directives.shift()) {
        //console.log(name, $elm, attrs);
        directives.exec(name, $elm, attrs);
    }

}


/**
 * Created by julien.zhang on 2014/9/15.
 */

//对外接口
var brick = window.brick = {
    utils: utils,
    config: config,
    controllers: controllers,
    services: services,
    directives: directives,
    compile: compile,
    createRender: createRender,
    eventManager: eventManager,
    __tpl: {},
    debug: cc,
    set: function (k, v) {
        return this.config.set(k, v);
    },
    get: function (k) {
        return this.config.get(k);
    },
    on: function (e, fn) {
        this.eventManager.on(e, fn);
        return this;
    },
    off: function (e, fn) {
        this.eventManager.off(e, fn);
        return this;
    },
    emit: function (e, msg) {
        this.eventManager.emit(e, msg);
        return this;
    },
    getTpl: function (name) {
        return this.__tpl[name];
    },
    reg: function (name, factory, conf) {
        if (/ctrl$/i.test(name)) {
            controllers.reg(name, factory, conf);
        } else {
            services.reg(name, factory, conf);
        }
    },
    bootstrap: function (node) {
        console.info('brick start');
        this.directives.init();
        this.compile(node || document.body);
        this.bootstrap = function () {
            console.info('only bootstrap once.')
        };
    }
};










// core指令 必选
/**
 * Created by julien.zhang on 2014/12/9.
 */

directives.reg('ic-ctrl', function ($elm, attrs) {

    if($elm.data('ic-ctrl-scope')) return; // 每个dom对象只执行一次 controller factory

    var ctrlName = $elm.attr('ic-ctrl');

    if(ctrlName){
        var $parent = $elm.parent().closest('[ic-ctrl]');
        var parentName = $parent.size() ? $parent.attr('ic-ctrl') : '';
        //controllers.exec(ctrlName, controllers.get(parentName), $elm);  // 在多个同名控制器的情况下,不能正确的按照dom结构进行继承
        controllers.exec(ctrlName, $parent.data('ic-ctrl-scope'), $elm);
    }

});
/**
 * Created by julien.zhang on 2014/10/11.
 */

directives.reg('ic-event', {
    selfExec: true,
    once: true,
    fn: function () {

        var eventAction = brick.get('event.action');

        var events = brick.get('ic-event.extend') || 'click,change';

        var targets = events.replace(/(?:^|,)(\w+?)(?=(?:,|$))/g, function (m, $1) {
            var s = '[ic-?]'.replace('?', $1);
            return m.replace($1, s);
        });

        var $doc = $(document);

        events = events.split(',');
        targets = targets.split(',');

        _.forEach(events, function (event, i, list) {
            var target = targets[i];
            if (event == 'click') event = eventAction;
            $doc.on(event, target, _call);
        });


        function _call(e) {
            var th = $(this);
            var type = e.type;
            var fn = th.attr('ic-' + type);
            fn = th.icParseProperty(fn);
            return fn.apply(this, [e]);
        }

    }
});

/**
 * Created by julien.zhang on 2014/10/11.
 */

directives.reg('ic-tpl', {
    selfExec: true,
    //once: true,  // 要考虑异步加载进来的模板, 所以不能只允许调用一次
    fn: function ($elm) {

        var __tpl = brick.__tpl = brick.__tpl || {};

        ($elm || $('[ic-tpl]')).each(function () {

            var $th = $(this);
            var name = $th.attr('ic-tpl');
            var $parent;

            // 只处理一次
            if($th.attr('ic-tpl-name')) return;

            if(!name){
                $parent = $th.closest('[ic-ctrl]');
                name = $parent.attr('ic-ctrl');
            }

            //自动初始化渲染数据对象
            setTimeout(function(){
                var dob = $th.icParseProperty2('ic-tpl-init');
                //console.info(dob, name);
                dob && $th.icRender(name, dob);
            }, 300);

            $th.attr('ic-tpl', name);
            $th.attr('ic-tpl-name', name);

            __tpl[name] = createRender(this);

        });

    }

});


// jQuery扩展 必选
/**
 * Created by julien.zhang on 2014/10/30.
 * 扩展 jquery
 */

;
(function ($) {

    $.fn.icRender = function (tpl, model, callback) {
        if (typeof tpl == 'object') {
            callback = model;
            model = tpl;
            tpl = this.attr('ic-tpl-name');
        }
        var tplFn = brick.getTpl(tpl);
        if (!tplFn) return console.info('not find tpl: ' + tpl);
        // 如果数据模型不是对象类型,则对其包装
        /*if(typeof model != 'object' || Array.isArray(model)){
         model = {model : model};
         }*/
        var html = tplFn({model: model});
        return this.each(function () {
            var $th = $(this);
            $th.html(html);
            $th.removeAttr('ic-tpl');
            $th.icCompile();
            callback && callback.apply(this, [$th.children()]);
        });
    };

    $.fn.icCompile = function () {
        return this.each(function (i) {
            brick.compile(this);
        });
    };

    $.fn.icParseProperty = $.fn.icPp = function (name, isLiteral) {
        //console.info('icParseProperty => ', name);
        var match;
        // js直接量  <div ic-tpl-init="{}">  object {}
        if (match = name.match(/^\s*(([{\[])(.+)[}\]])\s*$/)) {
            //console.info(match);
            try {
                return (match[3] && match[2]) == '{' ? eval('('+match[1]+')') : match[2] == '{' ? {} : [];
            } catch (e) {
                console.error(e);
            }
        }
        else  // 字符串
        if (match = name.match(/^\s*((['"])[^'"]*\2)\s*$/)) {
            return match[1];
        }
        else  // 数字
        if (match = name.match(/^\s(\d+)\s*$/)) {
            return match[1];
        }

        if(isLiteral) return name;  //按直接量解析, 不通过scope链进行查找

        var params = name.split(':');
        name = params.shift();

        // 从控制器scope里获取或者全局window
        var $ctrl = this.closest('[ic-ctrl]');
        var ctrl = $ctrl.attr('ic-ctrl');
        //var namespace = ctrl ? $ctrl.data('ic-ctrl-scope') : {};
        var namespace = ctrl ? brick.controllers.get(ctrl) : {};

        function f(root, chain) {
            var k = chain.shift();
            var v = root && root[k];
            if (v === undefined) return;
            if (chain.length) {
                return arguments.callee(v, chain);
            }
            return v;
        }

        var v = f(namespace, name.split('.'));

        v = v || f(window, name.split('.'));

        //console.info('icParseProperty => ' + name + ' => ', v);

        if(typeof v == 'function' && params.length){
            return function(){
                var that = this;
                var args = [].slice.call(arguments);
                var p;
                while(p = params.shift()){
                    args.push(p);
                }
                return v.apply(that, args);   //window.confirm通过apply方式调用会出错,暂时不处理
            };
        }

        return v;

    };

    $.fn.icParseProperty2 = $.fn.icPp2 = function (name, isLiteral) {
        name = this.attr(name);
        if (name === undefined || name == '') return name;
        return this.icParseProperty(name, isLiteral);
    };

    $.fn.icTabs = function (options) {
        var active = options.active;
        active && this.attr('ic-tab-active', active);
        return this;
    };

    $.fn.icAjax = function (options) {
        if (options === undefined) return this.trigger('ic-ajax');
        options.data && this.data('ic-submit-data', options.data);

        options.disabled !== void(0) && this.attr('ic-ajax-disabled', !!options.disabled);

        return this;
    };

    /*$.fn.icForm = function (call, options) {
        return this.trigger('ic-form.' + call, options);
    };*/


    $.fn.icDialog = function (options, callback) {

        options = _.isObject(options) ? _.extend({desc: '', title: ''}, options) : {desc: options, title: ''};

        if (!(this[0] && this[0].hasAttribute('ic-dialog'))) {
            console.error('not is ic-dialog');
            return this;
        }

        var that = this;
        var tpl = that.attr('ic-tpl-name');

        callback && this.one('ic-dialog.close', callback);

        setTimeout(function () {

            if (options === void(0)) {
                options = true;
            }

            if (!options) {
                that.icAniOut(21);
            }

            if (tpl && _.isObject(options)) {
                that.icRender(tpl, options.vm || options);
            }

            that.icAniIn(21, function () {
                that.trigger('ic-dialog.show');
            });

        }, 30);

        return this;
    };

    $.icDialog = function (msg, callback) {
        var options = _.isObject(msg) ? _.extend({desc: '', title: ''}, msg) : {desc: msg, title: ''};
        $('[ic-dialog]:first').icDialog(options, callback);
    };

    $.fn.icPrompt = function (options) {

        if (!(this[0] && this[0].hasAttribute('ic-prompt'))) {
            console.error('not is ic-prompt');
            return this;
        }

        var that = this;
        var tpl = that.attr('ic-tpl-name');

        clearTimeout(that.data('ic-prompt-timer'));

        setTimeout(function () {

            if (options === void(0)) {
                options = true;
            }

            if (!options) {
                that.icAniOut();
            }

            if (tpl && _.isObject(options)) {
                that.icRender(tpl, options.vm || options);
            }

            that.icAniIn(21, function () {
                that.trigger('ic-prompt.show');

                var timer = setTimeout(function () {
                    that.icAniOut();
                }, 2400);

                that.data('ic-prompt-timer', timer);

            });

        }, 30);

        return this;
    };

    $.icPrompt = function (msg) {
        var options = _.isObject(msg) ? msg : {desc: msg};
        $('[ic-prompt]:first').icPrompt(options);
    };

    $.fn.icDatePicker = function (call, options) {
        return this.trigger('ic-date-picker.' + call, options);
    };

    //监听enter键
    $.fn.icEnterPress = function (call) {

        return this.each(function (i) {

            if (/^textarea$/img.test(this.tagName)) return this;

            call = $.proxy(call, this);

            var fn = function (e) {

                if (e.which == 13) {
                    //console.info('ic-enter-press emit.');
                    call(e);
                }
            };

            $(this)
                .on('focus', function () {
                    $(this).on('input keypress', fn);
                })
                .on('blur', function () {
                    $(this).off('input keypress', fn);
                });
        });

    };

    //定时器
    $.fn.icTimer = function () {
        var th = this;
        var count = th.attr('ic-timer-count') * 1;

        var timer = setInterval(function () {
            if (count--) {
                th.text(count);
            } else {
                clearInterval(timer);
                th.trigger('ic-timer.' + 'end');
            }
        }, 1000);

        return this;
    };

// 操作提示
    var tipSize = 0;
    $.fn.tips = function (parent) {
        ++tipSize;
        var $parent = $(parent || 'body');
        var w = $parent.innerWidth() * 0.4 + 'px';
        var h;
        var top;
        var left;
        var wraper = $('<div class="tipsBox"></div>');

        this.addClass('tips1').css({
            'width': w
        });
        this.appendTo(wraper);
        wraper.appendTo($parent);

        w = this.width();
        h = this.height();
        top = '-' + h / 2 + 'px';
        left = '-' + w / 2 + 'px';
        this.css({
            'top': 40 * tipSize,
            'left': left
        });

        wraper.animate({
            top: 0,
            'opacity': '1'
        }, 500, function () {
            $(this).addClass('animated wobble');
        });

        setTimeout(function () {
            wraper.animate({
                'top': -300,
                'opacity': '0'
            }, 500, function () {
                --tipSize;
                wraper.remove();
            });
        }, 2000 * tipSize);

        return this;
    };

    $.tips = function (massge) {
        $('<div>' + massge + '</div>').tips();
    };

    //设置loading
    (function ($) {

        var loading = '<span ic-loader role="_loading_"><svg width="16" height="16" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#3d7fe6"><animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 150 150" to="360 150 150" begin="0s" dur="1s" fill="freeze" repeatCount="indefinite" /></path></svg></span>';

        if (window.ActiveXObject) {

            loading = 'data:image/gif;base64,R0lGODlhEAAQAMQAAP///+7u7t3d3bu7u6qqqpmZmYiIiHd3d2ZmZlVVVURERDMzMyIiIhEREQARAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBwAQACwAAAAAEAAQAAAFdyAkQgGJJOWoQgIjBM8jkKsoPEzgyMGsCjPDw7ADpkQBxRDmSCRetpRA6Rj4kFBkgLC4IlUGhbNQIwXOYYWCXDufzYPDMaoKGBoKb886OjAKdgZAAgQkfCwzAgsDBAUCgl8jAQkHEAVkAoA1AgczlyIDczUDA2UhACH5BAUHABAALAAAAAAPABAAAAVjICSO0IGIATkqIiMKDaGKC8Q49jPMYsE0hQdrlABCGgvT45FKiRKQhWA0mPKGPAgBcTjsspBCAoH4gl+FmXNEUEBVAYHToJAVZK/XWoQQDAgBZioHaX8igigFKYYQVlkCjiMhACH5BAUHABAALAAAAAAQAA8AAAVgICSOUGGQqIiIChMESyo6CdQGdRqUENESI8FAdFgAFwqDISYwPB4CVSMnEhSej+FogNhtHyfRQFmIol5owmEta/fcKITB6y4choMBmk7yGgSAEAJ8JAVDgQFmKUCCZnwhACH5BAUHABAALAAAAAAQABAAAAViICSOYkGe4hFAiSImAwotB+si6Co2QxvjAYHIgBAqDoWCK2Bq6A40iA4yYMggNZKwGFgVCAQZotFwwJIF4QnxaC9IsZNgLtAJDKbraJCGzPVSIgEDXVNXA0JdgH6ChoCKKCEAIfkEBQcAEAAsAAAAABAADgAABUkgJI7QcZComIjPw6bs2kINLB5uW9Bo0gyQx8LkKgVHiccKVdyRlqjFSAApOKOtR810StVeU9RAmLqOxi0qRG3LptikAVQEh4UAACH5BAUHABAALAAAAAAQABAAAAVxICSO0DCQKBQQonGIh5AGB2sYkMHIqYAIN0EDRxoQZIaC6bAoMRSiwMAwCIwCggRkwRMJWKSAomBVCc5lUiGRUBjO6FSBwWggwijBooDCdiFfIlBRAlYBZQ0PWRANaSkED1oQYHgjDA8nM3kPfCmejiEAIfkEBQcAEAAsAAAAABAAEAAABWAgJI6QIJCoOIhFwabsSbiFAotGMEMKgZoB3cBUQIgURpFgmEI0EqjACYXwiYJBGAGBgGIDWsVicbiNEgSsGbKCIMCwA4IBCRgXt8bDACkvYQF6U1OADg8mDlaACQtwJCEAIfkEBQcAEAAsAAABABAADwAABV4gJEKCOAwiMa4Q2qIDwq4wiriBmItCCREHUsIwCgh2q8MiyEKODK7ZbHCoqqSjWGKI1d2kRp+RAWGyHg+DQUEmKliGx4HBKECIMwG61AgssAQPKA19EAxRKz4QCVIhACH5BAUHABAALAAAAAAQABAAAAVjICSOUBCQqHhCgiAOKyqcLVvEZOC2geGiK5NpQBAZCilgAYFMogo/J0lgqEpHgoO2+GIMUL6p4vFojhQNg8rxWLgYBQJCASkwEKLC17hYFJtRIwwBfRAJDk4ObwsidEkrWkkhACH5BAUHABAALAAAAQAQAA8AAAVcICSOUGAGAqmKpjis6vmuqSrUxQyPhDEEtpUOgmgYETCCcrB4OBWwQsGHEhQatVFhB/mNAojFVsQgBhgKpSHRTRxEhGwhoRg0CCXYAkKHHPZCZRAKUERZMAYGMCEAIfkEBQcAEAAsAAABABAADwAABV0gJI4kFJToGAilwKLCST6PUcrB8A70844CXenwILRkIoYyBRk4BQlHo3FIOQmvAEGBMpYSop/IgPBCFpCqIuEsIESHgkgoJxwQAjSzwb1DClwwgQhgAVVMIgVyKCEAIfkECQcAEAAsAAAAABAAEAAABWQgJI5kSQ6NYK7Dw6xr8hCw+ELC85hCIAq3Am0U6JUKjkHJNzIsFAqDqShQHRhY6bKqgvgGCZOSFDhAUiWCYQwJSxGHKqGAE/5EqIHBjOgyRQELCBB7EAQHfySDhGYQdDWGQyUhADtBnuIRQIkiJgMKLQfrIugqNkMb4wGByIAQKg6FgitgaugONIgOMmDIIDWSsBhYFQgEGaLRcMCSBeEJ8WgvSLGTYC7QCQym62iQhsz1UiIBA11TVwNCXYB+goaAiighACH5BAUHABAALAAAAAAQAA4AAAVJICSO0HGQqJiIz8Om7NpCDSweblvQaNIMkMfC5CoFR4nHClXckZaoxUgAKTijrUfNdErVXlPUQJi6jsYtKkRty6bYpAFUBIeFAAAh+QQFBwAQACwAAAAAEAAQAAAFcSAkjtAwkCgUEKJxiIeQBgdrGJDByKmACDdBA0caEGSGgumwKDEUosDAMAiMAoIEZMETCVikgKJgVQnOZVIhkVAYzuhUgcFoIMIowaKAwnYhXyJQUQJWAWUND1kQDWkpBA9aEGB4IwwPJzN5D3wpno4hACH5BAUHABAALAAAAAAQABAAAAVgICSOkCCQqDiIRcGm7Em4hQKLRjBDCoGaAd3AVECIFEaRYJhCNBKowAmF8ImCQRgBgYBiA1rFYnG4jRIErBmygiDAsAOCAQkYF7fGwwApL2EBelNTgA4PJg5WgAkLcCQhACH5BAUHABAALAAAAQAQAA8AAAVeICRCgjgMIjGuENqiA8KuMIq4gZiLQgkRB1LCMAoIdqvDIsg=';
            loading = '<span style="margin:0.2em; auto;display:inline-block;text-align:center;" role="_loading_"><img src="?"></span>'.replace('?', loading);

        }

        $.fn.icSetLoading = $.fn.setLoading = function (option) {

            var _loading = option && option.loading;

            this.icClearLoading();

            return this.each(function () {
                //this.parent().css({position:'relative'});
                var $th = $(this);
                var w = $th.outerWidth();
                var h = $th.outerHeight();
                var offset = $th.offset();
                var top = offset.top;
                var left = offset.left;
                var $loading = $(_loading || loading).css({
                    width: w,
                    height: h,
                    position: 'absolute',
                    top: top,
                    left: left,
                    'z-index': 1999
                }).appendTo('body');

                //$loading.find('svg').css({'margin-top':($th.height()-16)/2});

                $th.css({opacity: '0.5'});

                $th.data('_ic-role-loading', $loading);
            });

        };

    })($);

    //清除loading
    $.fn.icClearLoading = $.fn.clearLoading = function () {

        return this.each(function () {
            var $th = $(this);
            var $loading = $th.data('_ic-role-loading');
            $loading && $loading.remove();
            $th.removeData('_ic-role-loading');
            $th.css({opacity: '1'});
        });

    };


})(jQuery);




// 内置services 可选
/**
 * Created by Julien on 2014/8/13.
 * 记录管理器
 * var recordManager = brick.services.get('recordManager');
 * var serv = recordManager(
 *                              {
 *                                  scope:scope,
 *                                  broadcast:true, //是否广播事件
 *                                  eventPrefix:'holdModel', //广播事件前缀
 *                                  key:'hold.id',  //记录id
 *                                  beforeSave:function(record,index){}
 *                              }
 *                              );
 */

function recordManager() {

    function RecordManager(conf) {

        if (conf && conf.constructor === Object) {

            for (var i in conf) {
                this[i] = conf[i];
            }

        }

        this._pool = {};

    }

    var proto = {

        /**
         * 默认每条记录的主键为id；
         */
        key: 'id',

        /**
         *
         * @param data {Array or Object}
         * @return {this}
         */
        init: function (data) {

            if (typeof data !== 'object') throw 'must be Array or Object on init';

            var pool = this._pool;

            for (var i in data) {

                var record = data[i];

                this.beforeSave(record, i);

            }

            this._pool = data;

            this.fire('init');

            return this;

        },

        /**
         * 获取查询结果
         * @param value  {*}            要查询的key值
         * @param query  {String}       要查询的key
         * @returns      {Array}        根据查询结果返回数组
         * @example
         *
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

                for (var i in pool) {

                    r.push( $.extend(true, {}, pool[i]) );

                }

                return r;
            }

            if(typeof value === 'object'){
                query = this.key;
                value = value[query];
            }

            for (var j in pool) {

                var record = pool[j];

                if (value === this._queryKeyValue(record, query)) {

                    r.push( $.extend(true, {}, record) );

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
         *
         * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x').set({y:3});     // result [{x:1,y:3},{x:1,y:3}]
         * new recoredManager().init([{x:1,y:2}]).find(2,'x').set({y:3});               // result false
         */
        set: function (data, query) {

            var pool = this._pool;

            var find = this._find || [];

            var result = [];

            for (var i in find) {

                var record = find[i];

                if (query && this._queryKeyValue(record, query) === this._queryKeyValue(data, query))  continue;

                var id = this._queryKeyValue(record);

                var index = this._getIndex(id);

                record = pool[index];

                result.push( $.extend(true, record, data) );

                this.beforeSave(record);

                this.fire('change', {change: record});
            }

            this.end();

            return result.length ? result : false;
        },

        /**
         * 添加一条记录
         * @param record
         */
        add: function (record) {

            var pool = this._pool;

            var id = this._queryKeyValue(record);

            this.beforeSave(record);

            pool.push ? pool.push(record) : (pool[id] = record);

            this.fire('add', {add: record});

            return this;

        },
        /**
         * 调整记录位置,在队列里向前移动
         * @return
         * @example
         *
         * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x').prev();
         */
        prev: function(){
            var pool = this._pool;
            var find = this._find || [];
            for(var i in find){
                var record = find[i];
                var id = this._queryKeyValue(record);
                var index = this._getIndex(id);

                if(pool.splice){
                    pool.splice(index, 1);
                    pool.splice(--index, 0, record);
                }

                this.fire('order', {target: record});
            }

            this.end();
        },
        /**
         * 删除一条记录
         * @return   {Array}   被删除的记录集合
         * @example
         *
         * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x').remove();  // result this._pool == {}; return [{x:1,y:2},{x:1,y:5}];
         */
        remove: function () {

            var pool = this._pool;

            var find = this._find || [];

            for (var i in find) {

                var record = find[i];
                var id = this._queryKeyValue(record);
                var index = this._getIndex(id);

                (pool.splice && index !== undefined) ? pool.splice(index, 1) : delete pool[id];

                this.fire('remove', {remove: record});

            }

            this.end();

            return find;

        },

        /**
         * 清空所有记录
         * @returns {proto}
         */
        clear: function () {

            this._pool = {};

            this.end();

            this.fire('clear');

            return this;

        },

        /**
         * 根据key value查找记录
         * @param value  {*}            要查询的key值
         * @param key  {String}         要查询的key
         * @returns {this}
         * @example
         *
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
         *
         * new recoredManager().init([{x:1,y:2},{x:1,y:5}]).find(1,'x')  // return [{x:1,y:2},{x:1,y:5}];
         */
        result: function(){
            return this._find;
        },

        end: function () {
            this._find = void(0);
        },

        fire: function (e, msg) {

            var scope = this.scope;
            var broadcast = this.broadcast;
            var pool = this.get();
            var prefix = this.eventPrefix ? this.eventPrefix + '.' : '';

            msg = $.extend({pool: pool}, msg || {});

            broadcast && brick.broadcast(prefix + e, msg);
            scope && scope.fire && scope.fire(prefix + e, msg);

        },

        /**
         * 插入或修改一条记录时的回调函数
         * @param record
         * @param index
         */
        beforeSave: function(record, index){


        },

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

        _getIndex: function(record, query){

            var pool = this._pool;

            var v = typeof record === 'object' ? this._queryKeyValue(record, query) : record;

            for(var i in pool){

                if(this._queryKeyValue(pool[i], query) === v) return i;

            }
        },

        _look: function () {
            console.log(this._pool);
        }



    };

    for (var i in proto) {

        RecordManager.prototype[i] = proto[i];

    }


    function f(conf){
        return new RecordManager(conf);
    }

    return f;

}


//内置服务
services.reg('recordManager', recordManager);
/**
 * Created by Julien on 2015/9/1.
 */

/**
 * 获取一个动画类
 * @param animation {Number} 1-67
 * @returns {{inClass: string, outClass: string}}
 */
brick.getAniMap = function (animation) {

    animation = animation*1 > 67 ? 0 : animation*1;
    animation = animation || Math.round(Math.random() * 66 + 1);

    console.info('animation id is ' + animation);

    var outClass = '', inClass = '';

    switch (animation) {

        case 1:
            outClass = 'pt-page-moveToLeft';
            inClass = 'pt-page-moveFromRight';
            break;
        case 2:
            outClass = 'pt-page-moveToRight';
            inClass = 'pt-page-moveFromLeft';
            break;
        case 3:
            outClass = 'pt-page-moveToTop';
            inClass = 'pt-page-moveFromBottom';
            break;
        case 4:
            outClass = 'pt-page-moveToBottom';
            inClass = 'pt-page-moveFromTop';
            break;
        case 5:
            outClass = 'pt-page-fade';
            inClass = 'pt-page-moveFromRight pt-page-ontop';
            break;
        case 6:
            outClass = 'pt-page-fade';
            inClass = 'pt-page-moveFromLeft pt-page-ontop';
            break;
        case 7:
            outClass = 'pt-page-fade';
            inClass = 'pt-page-moveFromBottom pt-page-ontop';
            break;
        case 8:
            outClass = 'pt-page-fade';
            inClass = 'pt-page-moveFromTop pt-page-ontop';
            break;
        case 9:
            outClass = 'pt-page-moveToLeftFade';
            inClass = 'pt-page-moveFromRightFade';
            break;
        case 10:
            outClass = 'pt-page-moveToRightFade';
            inClass = 'pt-page-moveFromLeftFade';
            break;
        case 11:
            outClass = 'pt-page-moveToTopFade';
            inClass = 'pt-page-moveFromBottomFade';
            break;
        case 12:
            outClass = 'pt-page-moveToBottomFade';
            inClass = 'pt-page-moveFromTopFade';
            break;
        case 13:
            outClass = 'pt-page-moveToLeftEasing pt-page-ontop';
            inClass = 'pt-page-moveFromRight';
            break;
        case 14:
            outClass = 'pt-page-moveToRightEasing pt-page-ontop';
            inClass = 'pt-page-moveFromLeft';
            break;
        case 15:
            outClass = 'pt-page-moveToTopEasing pt-page-ontop';
            inClass = 'pt-page-moveFromBottom';
            break;
        case 16:
            outClass = 'pt-page-moveToBottomEasing pt-page-ontop';
            inClass = 'pt-page-moveFromTop';
            break;
        case 17:
            outClass = 'pt-page-scaleDown';
            inClass = 'pt-page-moveFromRight pt-page-ontop';
            break;
        case 18:
            outClass = 'pt-page-scaleDown';
            inClass = 'pt-page-moveFromLeft pt-page-ontop';
            break;
        case 19:
            outClass = 'pt-page-scaleDown';
            inClass = 'pt-page-moveFromBottom pt-page-ontop';
            break;
        case 20:
            outClass = 'pt-page-scaleDown';
            inClass = 'pt-page-moveFromTop pt-page-ontop';
            break;
        case 21:
            outClass = 'pt-page-scaleDown';
            inClass = 'pt-page-scaleUpDown pt-page-delay300';
            break;
        case 22:
            outClass = 'pt-page-scaleDownUp';
            inClass = 'pt-page-scaleUp pt-page-delay300';
            break;
        case 23:
            outClass = 'pt-page-moveToLeft pt-page-ontop';
            inClass = 'pt-page-scaleUp';
            break;
        case 24:
            outClass = 'pt-page-moveToRight pt-page-ontop';
            inClass = 'pt-page-scaleUp';
            break;
        case 25:
            outClass = 'pt-page-moveToTop pt-page-ontop';
            inClass = 'pt-page-scaleUp';
            break;
        case 26:
            outClass = 'pt-page-moveToBottom pt-page-ontop';
            inClass = 'pt-page-scaleUp';
            break;
        case 27:
            outClass = 'pt-page-scaleDownCenter';
            inClass = 'pt-page-scaleUpCenter pt-page-delay400';
            break;
        case 28:
            outClass = 'pt-page-rotateRightSideFirst';
            inClass = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
            break;
        case 29:
            outClass = 'pt-page-rotateLeftSideFirst';
            inClass = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
            break;
        case 30:
            outClass = 'pt-page-rotateTopSideFirst';
            inClass = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
            break;
        case 31:
            outClass = 'pt-page-rotateBottomSideFirst';
            inClass = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
            break;
        case 32:
            outClass = 'pt-page-flipOutRight';
            inClass = 'pt-page-flipInLeft pt-page-delay500';
            break;
        case 33:
            outClass = 'pt-page-flipOutLeft';
            inClass = 'pt-page-flipInRight pt-page-delay500';
            break;
        case 34:
            outClass = 'pt-page-flipOutTop';
            inClass = 'pt-page-flipInBottom pt-page-delay500';
            break;
        case 35:
            outClass = 'pt-page-flipOutBottom';
            inClass = 'pt-page-flipInTop pt-page-delay500';
            break;
        case 36:
            outClass = 'pt-page-rotateFall pt-page-ontop';
            inClass = 'pt-page-scaleUp';
            break;
        case 37:
            outClass = 'pt-page-rotateOutNewspaper';
            inClass = 'pt-page-rotateInNewspaper pt-page-delay500';
            break;
        case 38:
            outClass = 'pt-page-rotatePushLeft';
            inClass = 'pt-page-moveFromRight';
            break;
        case 39:
            outClass = 'pt-page-rotatePushRight';
            inClass = 'pt-page-moveFromLeft';
            break;
        case 40:
            outClass = 'pt-page-rotatePushTop';
            inClass = 'pt-page-moveFromBottom';
            break;
        case 41:
            outClass = 'pt-page-rotatePushBottom';
            inClass = 'pt-page-moveFromTop';
            break;
        case 42:
            outClass = 'pt-page-rotatePushLeft';
            inClass = 'pt-page-rotatePullRight pt-page-delay180';
            break;
        case 43:
            outClass = 'pt-page-rotatePushRight';
            inClass = 'pt-page-rotatePullLeft pt-page-delay180';
            break;
        case 44:
            outClass = 'pt-page-rotatePushTop';
            inClass = 'pt-page-rotatePullBottom pt-page-delay180';
            break;
        case 45:
            outClass = 'pt-page-rotatePushBottom';
            inClass = 'pt-page-rotatePullTop pt-page-delay180';
            break;
        case 46:
            outClass = 'pt-page-rotateFoldLeft';
            inClass = 'pt-page-moveFromRightFade';
            break;
        case 47:
            outClass = 'pt-page-rotateFoldRight';
            inClass = 'pt-page-moveFromLeftFade';
            break;
        case 48:
            outClass = 'pt-page-rotateFoldTop';
            inClass = 'pt-page-moveFromBottomFade';
            break;
        case 49:
            outClass = 'pt-page-rotateFoldBottom';
            inClass = 'pt-page-moveFromTopFade';
            break;
        case 50:
            outClass = 'pt-page-moveToRightFade';
            inClass = 'pt-page-rotateUnfoldLeft';
            break;
        case 51:
            outClass = 'pt-page-moveToLeftFade';
            inClass = 'pt-page-rotateUnfoldRight';
            break;
        case 52:
            outClass = 'pt-page-moveToBottomFade';
            inClass = 'pt-page-rotateUnfoldTop';
            break;
        case 53:
            outClass = 'pt-page-moveToTopFade';
            inClass = 'pt-page-rotateUnfoldBottom';
            break;
        case 54:
            outClass = 'pt-page-rotateRoomLeftOut pt-page-ontop';
            inClass = 'pt-page-rotateRoomLeftIn';
            break;
        case 55:
            outClass = 'pt-page-rotateRoomRightOut pt-page-ontop';
            inClass = 'pt-page-rotateRoomRightIn';
            break;
        case 56:
            outClass = 'pt-page-rotateRoomTopOut pt-page-ontop';
            inClass = 'pt-page-rotateRoomTopIn';
            break;
        case 57:
            outClass = 'pt-page-rotateRoomBottomOut pt-page-ontop';
            inClass = 'pt-page-rotateRoomBottomIn';
            break;
        case 58:
            outClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
            inClass = 'pt-page-rotateCubeLeftIn';
            break;
        case 59:
            outClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
            inClass = 'pt-page-rotateCubeRightIn';
            break;
        case 60:
            outClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
            inClass = 'pt-page-rotateCubeTopIn';
            break;
        case 61:
            outClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
            inClass = 'pt-page-rotateCubeBottomIn';
            break;
        case 62:
            outClass = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
            inClass = 'pt-page-rotateCarouselLeftIn';
            break;
        case 63:
            outClass = 'pt-page-rotateCarouselRightOut pt-page-ontop';
            inClass = 'pt-page-rotateCarouselRightIn';
            break;
        case 64:
            outClass = 'pt-page-rotateCarouselTopOut pt-page-ontop';
            inClass = 'pt-page-rotateCarouselTopIn';
            break;
        case 65:
            outClass = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
            inClass = 'pt-page-rotateCarouselBottomIn';
            break;
        case 66:
            outClass = 'pt-page-rotateSidesOut';
            inClass = 'pt-page-rotateSidesIn pt-page-delay200';
            break;
        case 67:
            outClass = 'pt-page-rotateSlideOut';
            inClass = 'pt-page-rotateSlideIn';
            break;

    }

    return {inClass: inClass, outClass: outClass};
};

/**
 * 扩展jquery，添加转场动画支持
 * example: $('#view1').icAniOut($('#view2')); //#view1 in，#view2 out.
 * 一个元素css display:none  不能做css3动画
 */
;
(function () {

    var $doc = $('body');
    var animEndEventName = 'webkitAnimationEnd';

    function initStatus($elm) {
        $elm.attr('ic-isAnimating', false);
        $elm.addClass('ic-animating');
        $elm.attr('ic-aniEnd', false);
        $elm.removeAttr('ic-aniIn');
    }

    function onEndAnimation($elm, call) {
        $elm.removeClass('ic-animating');
        $elm.off(animEndEventName).attr('ic-aniEnd', true).trigger('ic-aniEnd');
        call && call.call($elm[0]);
    }

    //out
    $.fn.icAniOut = function (aniId, $next, call) {

        var args = [].slice.call(arguments);

        aniId = $next = call = void(0);

        args.forEach(function (v) {
            if (_.isFunction(v)) {
                call = v;
            } else if (_.isObject(v)) {
                $next = v;
            } else if (_.isNumber(v)) {
                aniId = v;
            }
        });

        $next = $($next);

        var $current = this;

        $current = $current[0] && $current[0].hasAttribute ? $current : false;
        $next = $next[0] && $next[0].hasAttribute ? $next : false;

        if(!$next){

            if(!aniId){
                aniId = aniId || this.attr('ic-aniId');
                aniId = aniId && aniId * 1;
                aniId = aniId && aniId % 2 ? aniId + 1 : aniId - 1;
            }

        }

        var cla = brick.getAniMap(aniId);
        var inClass = cla.inClass;
        var outClass = cla.outClass;

        // $doc.animate({scrollTop: 0}, 150);
        //$doc.scrollTop(0);

        if ($current && !$current.hasClass('ic-animating')) {

            initStatus($current);

            $current.addClass(outClass).on(animEndEventName, function () {

                $current.removeClass(outClass);
                $current.removeAttr('ic-active');
                $current.removeAttr('ic-aniIn');
                $current.attr('ic-aniOut', true);
                onEndAnimation($current, call);

                if (!$next || $next && $next.attr('ic-aniEnd')) {
                    //_onEndAnimation($current);
                }

            });

        }


        if ($next && !$next.hasClass('ic-animating')) {

            initStatus($next);

            $next.attr('ic-aniId', aniId);
            $next.attr('ic-active', true);
            $next.attr('ic-aniIn', true);
            $next.removeAttr('ic-aniOut').addClass(inClass).on(animEndEventName, function () {

                $next.removeClass(inClass);
                onEndAnimation($next, call);

                if (!$current || $current && $current.attr('ic-aniEnd')) {
                    //_onEndAnimation($next);
                }

            });

        }

        return this;

    };

    //in
    $.fn.icAniIn = function (aniId, $next, call) {

        var args = [].slice.call(arguments);

        aniId = $next = call = void(0);

        args.forEach(function (v) {
            if (_.isFunction(v)) {
                call = v;
            } else if (_.isObject(v)) {
                $next = v;
            } else if (_.isNumber(v)) {
                aniId = v;
            }
        });

        $next = $next || $({});

        return $next.icAniOut(aniId, this, call);
    }

})();


;
(function () {

    function Transition(conf) {
        _.extend(this, conf || {});
        this.history = [];
        this.pool = {};
        this.conf = {};
        this.currentView = '';
        this.$current = $({});
        //this.current();
    }

    var proto = {
        cache: function (name, $view) {
            var viewProp = this.pool[name] = this.pool[name] || {};
            if ($view) {
                viewProp.$view = $view;
                viewProp.aniId = $view.attr('ic-view-ani-id')*1 || brick.get('view.aniId') || 13 || Math.round(Math.random() * 66 + 1);
            }
            $view = viewProp.$view;
            if (!$view) {
                $view = $('[ic-view=?]'.replace('?', name));
                return this.cache(name, $view);
            }
            return viewProp;
        },
        current: function () {
            var currentView = this.currentView;
            if (!currentView) {
                var $view = $('[ic-view][ic-active]');
                currentView = $view.attr('ic-view');
                this.currentView = currentView;
                this.$current = $view;
                this.cache(currentView, $view);
            }
            return currentView;
        },
        to: function (name, reverse) {
            if(!name) throw 'must to provide name of view.';
            var that = this;
            var currentView = this.current();
            if(currentView == name) return;
            var nextViewProp = this.cache(name);
            var currentViewProp = this.cache(currentView);
            var aniId = currentViewProp.aniId;
            aniId = reverse ? aniId % 2 ? aniId + 1 : aniId - 1 : aniId;
            nextViewProp.$view.trigger('ic-view.active', nextViewProp);
            currentViewProp.$view.icAniOut(aniId, nextViewProp.$view, function(){
                !reverse && that.history.push(currentView);
                that.currentView = name;
                that.$current = nextViewProp.$view;
            });
        },
        back: function () {
            var prev = this.history.pop();
            prev && this.to(prev, true);
        }
    };

    for (var i in proto) {
        Transition.prototype[i] = proto[i];
    }


    var transition = brick.view = new Transition;
    var eventAction = brick.get('event.action');

    $(document.body).on(eventAction, '[ic-view-to]', function (e) {
        var name = $(this).attr('ic-view-to');
        transition.to(name);
    }).on('click', '[ic-view-back]', function (e) {
        transition.back();
    });

})();

/**
 * Created by Julien on 2015/8/10.
 */

;
!function(){

    brick.cache = function(_conf){

        _conf = _.extend({
            expire : brick.config.get('cache.expire') ||  1 * 24 * 60 * 60 * 1000,
            namespace : brick.config.get('cache.namespace') || '__ic__'
        }, _conf || {});

        return function _cache(k, v, conf){

            if(_.isUndefined(k)) return console.log('return for undefined k.');

            var base = JSON.parse(JSON.stringify(_conf));

            if(_.isNumber(conf)){
                base.expire = conf;
            }

            conf = _.isObject(conf) ? _.extend(base, conf) : base;

            var namespace = conf.namespace ? conf.namespace + '.' : '';
            var key = namespace + k;

            var expire = conf.expire;

            var data;

            //清空localStorage
            if(k === false){
                localStorage.clear();
                return;
            }

            //返回所有的key
            if(k === true){

                for(var i = 0, keys = []; i < localStorage.length; i++){
                    keys.push(localStorage.key(i));
                }

                return keys;
            }

            //清空localStorage对应的key
            if(v === false){
                localStorage.removeItem(key);
                return;
            }

            //从localStorage获取对应的key或者设置对应的键值对
            if(_.isUndefined(v)) {

                data = JSON.parse(localStorage.getItem(key));

                if(!data) return void(0);

                if(+new Date - data.__ic_start > data.__ic_expire){

                    localStorage.removeItem(key);
                    return void(0);

                }else{
                    return data.__ic_data;
                }

            }else{

                data = {};
                data.__ic_start = + new Date;
                data.__ic_data = v;
                data.__ic_expire = expire;

                try{

                    localStorage.setItem(key, JSON.stringify(data));

                }catch(e){

                    if(e.name == 'QuotaExceededError'){

                        console.error('存储溢出.');
                        localStorage.clear();
                        localStorage.setItem(key, JSON.stringify(data));

                    }

                }

            }

        };
    };

}();




// 内置directives 可选
/**
 * Created by julien.zhang on 2014/10/31.
 */


directives.reg('ic-ajax',
    {
        selfExec: true,
        once: true,
        fn: function () {

            var eventAction = brick.get('event.action');

            function call(e) {

                var that = this;

                if (this.hasAttribute('ic-ajax-disabled')) return;

                var $elm = $(this);
                var name = $elm.attr('ic-ajax');

                var defaultCall = function () {
                    //console.log(arguments)
                };

                var before = $elm.icParseProperty2('ic-submit-before') || defaultCall;

                var data = $elm.data('ic-submit-data') || $elm.attr('ic-submit-data');
                var _data = before.call(that, data);
                if (_data === false) return;
                data = _data || data;

                var domain = brick.get('ajax.domain') || '';
                var url = domain + $elm.attr('ic-submit-action');
                var dataType = $elm.attr('ic-submit-data-type') || 'json';
                var method = $elm.attr('ic-submit-method') || 'post';

                var failed = $elm.icParseProperty2('ic-submit-on-fail') || defaultCall;
                var done = $elm.icParseProperty2('ic-submit-on-done') || defaultCall;
                var always = $elm.icParseProperty2('ic-submit-on-always') || defaultCall;

                var $loading = $('[ic-role-loading=?]'.replace('?', name || +(new Date)));
                $loading.size() ? $loading.show() && $elm.hide() : $elm.setLoading();

                $elm.attr('ic-ajax-disabled', true);

                $.ajax({
                    url: url,
                    type: method,
                    dataType: dataType,
                    data: data
                }).done(function (data) {
                        console.log('ic-ajax => ', done);
                        $elm.clearLoading() && $loading.hide() && $elm.show();
                        done.apply(that, [data]);
                    }
                ).fail(function (msg) {
                        $elm.clearLoading() && $loading.hide() && $elm.show();
                        failed.apply(that, [msg]);
                    }
                ).always(function () {
                        $elm.clearLoading() && $loading.hide() && $elm.show();
                        always.apply(that);
                        $elm.removeData('ic-submit-data');
                        $elm.removeAttr('ic-ajax-disabled');
                    });
            }

            var $doc = $(document.body);
            $doc.on(eventAction, '[ic-ajax]:not([ic-ajax-enter])', call);
            $doc.on('ic-ajax', '[ic-ajax]', call);

        }
    }
);

directives.reg('ic-ajax-auto',
    {
        fn: function ($elm){
            $elm.icAjax();
        }
    }
);

directives.reg('ic-ajax-enter',
    {
        fn: function ($elm){
            $elm.icEnterPress(function(){
                $elm.icAjax();
            });
        }
    }
);
/**
 * Created by julien.zhang on 2014/10/11.
 */

directives.reg('ic-tabs', function ($elm, attrs) {

    var eventAction = brick.get('event.action');

        var th = $elm;
        var name = th.attr('ic-tabs');
        var disabled = th.attr('ic-tab-disabled');
        var tabSelect = th.attr('ic-tab-select');
        var conSelect = th.attr('ic-tabc-select');
        var activeTab = th.attr('ic-tab-active');
        var cla = th.attr('ic-tab-cla') || 'active';
        var activeCon;
        var $tabSelect;

        if (tabSelect) {
            $tabSelect = th.find(tabSelect).each(function (i) {
                var th = $(this);
                th.attr('ic-tab', i);
            });
        }else{
            $tabSelect = $elm.find('[ic-tab]');
        }

        var tabc = $('[ic-tabc=' + name + ']');

        if (tabc) {
            tabc.find(conSelect || '[ic-tab-con]').each(function (i) {
                i = $tabSelect.eq(i).attr('ic-tab');
                $(this).attr('ic-tab-con', i);
            });
        }

        th.on('click', '[ic-tab]:not([ic-tab-disabled=1])', tabc.length ? call_1 : call_2);


        function call_1(e) {
            call_2(e, this);

            var con = activeTab.attr('ic-tab');
            activeCon && activeCon.hide();
            activeCon = tabc.find('[ic-tab-con=' + con + ']').show();
        }

        function call_2(e, that) {
            activeTab && activeTab.removeClass(cla);
            activeTab = $(that || this).addClass(cla);
            th.trigger('ic-tabs.change', {activeTab: activeTab, target:activeTab[0], val: activeTab.attr('ic-tab-val'), index:activeTab.index()});
        }

        //fire
        if (activeTab) {
            activeTab = th.find('[ic-tab=?]'.replace('?', activeTab));
        } else {
            activeTab = th.find('[ic-tab]:not([ic-tab-disabled=1])').first();
        }

        activeTab.trigger('click');

        //var activeCon = activeTab.addClass('active').attr('ic-tab');

        //activeCon = tabc.length && tabc.find('[ic-tab-con]').hide().filter('[ic-tab-con=' + activeCon + ']').show();


});


/**
 * Created by julien.zhang on 2014/10/29.
 */


directives.reg('ic-form', function ($elm, attrs) {

    /**
     * 要验证的字段 ic-form-field
     * 验证规则  ic-field-rule
     * 验证失败提示 ic-field-err-tip
     * 验证成功提示 ic-field-ok-tip
     * ic-submit-disabled
     */

    var debug = brick.get('debug');
    var eventAction = brick.get('event.action');
    var customRule = brick.get('ic-form.rule');

    var presetRule = {
        id: /[\w_]{4,18}/,
        required: /.+/img,
        phone: /^\d[\d-]{5,16}$/,
        email: /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/,
        password: /(?:[\w]|[!@#$%^&*]){6,16}/,
        desc: /.{4,32}/,
        plate: /^[\u4e00-\u9fa5]{1}[A-Z]{1}[\s-]?[A-Z_0-9]{5}$/i
    };

    if (_.isObject(customRule)) {
        _.extend(presetRule, customRule);
    }

    var keys = _.keys(presetRule);

    keys.sort(function (a, b) {
        return b.length - a.length;
    });

    debug && console.info('当前关键字验证规则列表：', keys);

    /**
     * 对ic-field-rule属性定义的字段校验规则编译处理
     * 校验规则分为3类：
     * 1：预设的规则表示符，映射到相应的正则表达式或函数，如: 'phone';
     * 2：用户自定义的正则表达式, 如: /\d3/;
     * 3：用户自定义函数 如: equal(val); 传入校验字段校验时的字段值
     *
     * @param rule
     * @param $elm
     * @returns {}
     */
    function compileRule(rule, $elm) {

        var v;
        //替换预设的规则标识符
        for (var i in keys) {
            i = keys[i];
            v = presetRule[i];
            rule = rule.replace(new RegExp(i + '(?![^|&])', 'g'), function (m) {
                return _.isFunction(v) ? m + '()' : _.isRegExp(v) ? v : m;
            });
        }

        rule = rule.replace(/\/[igm]{0,3}(?=(?:\|\||\&\&|$))/g, function (m) {
            return m + '.test("?")';
        });

        debug && console.info('解析规则：', rule);
        return rule;
    }

    //校验函数
    function _verify(val, rules, tips, $field) {

        if (rules == undefined) return false;

        tips = tips || 'error';

        var fns = {};

        rules = rules.replace(/(?:^|\|\||\&\&)(\w+?)\(\)(?=(?:\|\||\&\&|$))/g, function (m, $1) {
            var fn = presetRule[$1] || $field.icParseProperty($1);
            fns[$1] = fn;
            return m.replace($1, 'fns.' + $1).replace('()', '("?")');
        });

        var _script = rules.replace(/\.\w+\("\?"\)/g, function (m) {
            return m.replace('?', val);
        });

        debug && console.info(_script);

        var result;

        try {
            result = eval(_script);
            //如果result是一个字符串，表示一个错误提示
            if (typeof result === 'string') {
                return result;
            }
            //如果为result===true,表示验证通过
            if (result === true) {
                return false;
            } else if (result) {
                return result;
            } else {
                return tips;
            }
        } catch (e) {
            console.error(e, _script);
        }

    }

     $.fn.icForm = $.fn.icForm || function (call, msg) {
         this.find('[ic-form-submit]').not(this.find('[ic-form] [ic-form-submit]')).icFormVerify();
         return this .data('ic-form-fields');
     };

    $.fn.icFormVerify = $.fn.icFormVerify || function () {
        // 提交按钮调用
        if (this[0].hasAttribute('ic-form-submit')) {
            this.trigger('ic-form.verify');
            return this.attr('ic-verification') ? fields : false;
        }
        // 表单字段调用
        if (this[0].hasAttribute('ic-form-field')) {
            this.trigger('change');
            return this.attr('ic-verification');
        }
        return false;
    };

    function defaultCall() {
    }

    var fields = {};

    // 执行指令
    var namespace = $elm.attr('ic-form');
    var $fields = $elm.find('[ic-form-field]').not($elm.find('[ic-form] [ic-form-field]'));
    var $submit = $elm.find('[ic-form-submit]').not($elm.find('[ic-form] [ic-form-submit]'));
    var $loading = $elm.find('[ic-role-loading]');

    var err_cla = brick.get('cla.error') || 'error';

    // 对每个字段dom绑定事件监听
    $fields.each(function (i) {

        var $th = $(this);
        var name = $th.attr('ic-form-field');
        var submitName = $th.attr('name') || name;
        var rules = $th.attr('ic-field-rule');

        if (!rules) return;
        //if ($th.attr('type') === 'hidden') return;

        var errTips = $th.attr('ic-field-err-tip');
        var $fieldBox = $elm.find('[ic-form-field-container="?"]'.replace('?', name));
        var $errTip = $elm.find('[ic-form-field-err-tip="?"]'.replace('?', name));
        var foucsTip = $errTip.text();

        rules = compileRule(rules, $elm);

        $th.on('change', function (e) {

            var val = $th.val();
            var tip;

            console.log(this, val, errTips);

            if (tip = _verify(val, rules, errTips, $th)) {
                //验证失败
                $th.addClass(err_cla);
                $fieldBox.addClass(err_cla);
                $errTip.addClass(err_cla).text(tip);
                $th.removeAttr('ic-verification');
                fields[name] = false;
                $th.trigger('ic-form-field.error', tip);
            } else {
                //验证通过
                $th.removeClass(err_cla);
                $fieldBox.removeClass(err_cla);
                $errTip.removeClass(err_cla);
                $th.attr('ic-verification', 1);
                if ($th[0].hasAttribute('ic-field-placeholder')) {

                } else {
                    fields[submitName] = val;
                }
                $th.trigger('ic-form-field.ok', val);
            }

        });

        $th.on('focus', function () {
            $fieldBox.removeClass(err_cla);
            $errTip.removeClass(err_cla).text(foucsTip);
        });

    });

    // 提交触发后先进行字段校验
    $submit.on('ic-form.verify', function (e, field) {

        fields = {};
        // 没有验证规则的字段
        $fields.filter(':not("[ic-field-rule]")').each(function (i) {

            var $th = $(this);
            var tag = this.tagName;
            var type = $th.attr('type');
            var name = $th.attr('ic-form-field');
            var submitName = $th.attr('name') || name;
            var val;

            if (/^input|select|textarea$/img.test(tag)) {

                if (/^checkbox|radio$/i.test(type)) {

                    $th = $('[name=*]:checked'.replace('*', submitName));
                    val = $th.val() || '';

                } else {
                    val = $th.val();
                }

            } else {
                //val = $th.icParseProperty2('ic-val', true);
                val = $th.data('ic-val') || $th.attr('ic-val');
            }

            fields[submitName] = val;

            /*var prev = fields[submitName];true
            if (prev) {
                prev =  ? prev : [prev];
                prev.push(val);
                fields[submitName] = prev;
            } else {
                fields[submitName] = val;
            }*/

        });

        // 占位字段
        $fields.filter('[ic-field-placeholder][ic-field-rule]').each(function (i) {
            $(this).change();
        });

        //显示并且有验证规则
        $fields.filter(':visible').filter('[ic-field-rule]').each(function (i) {
            $(this).change();
        });

        $elm.data('ic-form-fields', fields);
        console.info(fields);
        for (var i in fields) {
            if (fields[i] === false) {
                $submit.removeAttr('ic-verification');
                return false;
            }
        }

        return $submit.attr('ic-verification', true);

    });

    //
    $submit.on('ic-form.submit', function (e) {
        toSubmit(e);
    });

    // 提交触发
    $submit.on(eventAction, toSubmit);
    // 回车提交触发
    $fields.not('textarea').icEnterPress(function () {
        $submit.trigger(eventAction);
    });

    function toSubmit(e) {

        if ($submit[0].hasAttribute('ic-submit-disabled')) return;

        if (!$submit.icFormVerify()) return $elm.trigger('ic-form.error', fields);

        //函数调用
        if (submitType === 1) {
            return action.apply($submit[0], [fields]);
        }

        var data = before.apply($submit[0], [fields]);
        if (data === false) return;

        if ($loading.size()) {
            $submit.hide();
            $loading.show();
        } else {
            $submit.icSetLoading();
        }

        $submit.attr('ic-submit-disabled', true);

        //同域提交
        if (submitType === 3) {
            return $.ajax({
                url: domain + action,
                type: method,
                dataType: dataType,
                data: data || fields
            }).done(
                function (data) {
                    done(data);
                }
            ).fail(failed)
                .always(function () {
                    $submit.show();
                    $loading.hide();
                    $submit.clearLoading();
                    always();
                    $submit.removeAttr('ic-submit-disabled');
                });
        }
    }

    //提交
    var domain = brick.get('ajax.domain') || '';
    var method = $submit.attr('ic-submit-method') || 'post';
    var action = $submit.attr('ic-submit-action');
    var before = $submit.icParseProperty2('ic-submit-before') || defaultCall;
    var failed = $submit.icParseProperty2('ic-submit-on-fail') || defaultCall;
    var done = $submit.icParseProperty2('ic-submit-on-done') || defaultCall;
    var always = $submit.icParseProperty2('ic-submit-on-always') || defaultCall;

    var dataType = $submit.attr('ic-submit-data-type') || 'json';

    var submitType = (function () {
        //函数调用
        if (/[\w_.]+\(\)\;?$/i.test(action)) {
            action = $submit.icParseProperty(action.replace(/[();]/g, ''));
            return 1;
        }
        //普通提交
        return 3;
    })();

});


/**
 * Created by j on 18/7/18.
 * ic-select  实现checkbox or radio 类似的功能
 * ic-select-cla  选中项的添加的样式类,默认 selected
 * [ic-select][ic-select-item]  定义子项选择符 jQuery选择符
 * [ic-select-item] 定义子项
 * [ic-select-type] 定义select类型,多选or单选 checkbox : radio 默认 radio
 */

brick.directives.reg('ic-select', function($elm){

var on_change = $elm.icPp2('ic-select-on-change');
var cla = $elm.attr('ic-select-cla') || brick.get('ic-select-cla') || 'selected';
var name = $elm.attr('ic-select');
var s_item = $elm.attr('ic-select-item') || '[ic-select-item]';
var type = $elm.attr('ic-select-type') || 'radio';
var $items =  $elm.find(s_item);

if(!$items.size()){
    $items = $elm.find('>*').each(function(){
        $(this).attr('ic-select-item', +new Date);
    });
}

var $selected = $items.filter('[selected]');

var callback = type == 'checkbox' ?
    function(){
        $(this).toggleClass(cla);
        var values = [];
        $items.filter('.'+cla).each(function(){
            values.push($(this).attr('ic-val'));
        });
        $elm.attr('ic-val', JSON.stringify(values));
        $elm.data('ic-val', values);
        var msg = {name:name, value: values};
        $elm.trigger('ic-select.change', msg);
        on_change && on_change.apply($elm, [msg]);
    }
    :
    function(){
        $items.removeClass(cla);
        var $th = $(this).addClass(cla);
        var val = $th.attr('ic-val');
        $elm.attr('ic-val', val);
        var msg = {name:name, value: val};
        $elm.trigger('ic-select.change', msg);
        on_change && on_change.apply($elm, [msg]);
    };

    $elm.on('click', s_item, callback);

    $selected.click();

});
/**
 * Created by julien.zhang on 2015/3/23.
 * 回车键按下监听指令
 */

directives.reg({
    name: 'ic-enter-press',
    selfExec: true,
    once: true,
    fn: function ($elm, attrs) {

        $(document.body).on('focus', '[ic-enter-press]', function (e) {

            var $elm = $(this);
            var call = $elm.attr('ic-enter-press');
            call = $elm.icParseProperty(call);
            call = $.proxy(call, this);
            var fn = function (e) {
                e.which == 13 && call(e);
            };

            $elm.on('keypress', fn);

            $elm.on('blur', function (e) {
                $elm.off('keypress', fn);
            });

        });

    }
});
/**
 * Created by julien on 2015/11/30.
 */

brick.directives.reg('ic-scroll', function ($elm) {

    var $th = $elm || $(this);

    var onScroll = $elm.icParseProperty2('ic-scroll');

    var prevScrollTop = 0;
    var scrollDirection = 'down';

    onScroll && $th.on('ic-scroll', onScroll);

    $th.on('scroll', _.throttle(function (e) {
        var scrollTop = $th.scrollTop();
        var end;
        scrollDirection = (scrollTop - prevScrollTop > 1) ? 'down' : 'up';
        prevScrollTop = scrollTop;
        if (scrollDirection == 'down' && $th[0].scrollHeight <= $th[0].clientHeight + scrollTop) {
            console.log('trigger ic-scroll.end');
            $th.trigger('ic-scroll-end');
            end = true;
        }
        $th.trigger('ic-scroll', {direction: scrollDirection, end: end});
    }, 300));

});
/**
 * Created by julien.zhang on 2014/10/29.
 */

//ic-dialog
directives.reg('ic-dialog', function ($elm, attrs) {

    var eventAction = brick.get('event.action');

    $(document.body).on(eventAction, '[ic-dialog-cancel], [ic-dialog-close], [ic-dialog-confirm]', function(e){

        var $th = $(this);
        var type = this.hasAttribute('ic-dialog-confirm');

        var $dialog = $th.closest('[ic-dialog]');

        $dialog.icAniOut(21, function(){
            $dialog.trigger('ic-dialog.close', type);
            $dialog.trigger('ic-dialog.hide', type);
        });

    }).on(eventAction, '[ic-dialog-href]', function (e) {
        var target = $(this).attr('ic-dialog-href');
        $('[ic-dialog=?]'.replace('?', target)).icDialog();
        return false;
    });

}, {selfExec: true, once: true });


//ic-prompt
directives.reg('ic-prompt', function ($elm, attrs) {

    var eventAction = brick.get('event.action');

    $(document.body).on(eventAction, '[ic-prompt-cancel], [ic-prompt-close], [ic-prompt-confirm]', function(e){

        var $th = $(this);
        var type = this.hasAttribute('ic-prompt-confirm');

        var $dialog = $th.closest('[ic-prompt]');

        $dialog.icAniOut(21, function(){
            $dialog.trigger('ic-prompt.hide', type);
        });

    });

}, {selfExec: true, once: true });
/**
 * Created by julien.zhang on 2014/10/15.
 */

directives.add('ic-dropdown', function ($elm, attrs) {


    var th = $elm;

    th.css({position: 'relative'});

    var h = th.height();

    var menu = th.find('[ic-dropdown-menu]').css({position: 'absolute', top: h + 'px', display:'none!important'});

    var timer;
    if (menu.size()) {
        th.hover(function (e) {
            timer = setTimeout(function () {
                menu.show(300);
            }, 200);
        }, function () {
            clearTimeout(timer);
            menu.slideUp(200);
        });
    }

    var con = th.find('[ic-dropdown-con]').css({position: 'absolute', overflow: 'hidden'});

    if (con.size()) {

        var ch = con.height();

        //th.css({overflow:'hidden',height:h+'px'});

        var flag = 1;

        th.find('[ic-dropdown-toggle]').click(function (e) {
            if (flag) {
                //con.slideDown();
                con.css({height: 'auto'});
                flag = 0;
            } else {
                con.css({height: ch + 'px'});
                flag = 1;
            }
        });


    }


});

/**
 * Created by julien.zhang on 2014/11/13.
 * 定义输入提示指令
 */

directives.reg('ic-type-ahead', function ($elm, attrs) {

    var $doc = $('body');

    var namespace = $elm.attr('ic-type-ahead');
    var onTypeComplete = $elm.attr('ic-on-type-complete');
    onTypeComplete = $elm.icParseProperty(onTypeComplete);
    var source = $elm.attr('ic-source-ajax');

    var offset = $elm.offset();
    var left = offset.left;
    var top = offset.top;
    var w = $elm.outerWidth();
    var h = $elm.outerHeight();

    var $selectList = $('[ic-role-list=?]'.replace('?', namespace));
    var tplf = brick.getTpl($selectList.attr('ic-tpl'));

    $selectList.appendTo($doc).css({top: top + h, left: left, 'min-width': w});

    var _pool;
    var pool;
    var ajax;
    var queryStr;
    var query;
    var keydownActive = 0;
    var keydownList;

    var done = function (data) {
        if (!data) return;
        if (!data.length) return $selectList.hide();
        pool = data;
        var html = tplf({model: data}); //ie7模板函数会报错，有时间fix;
        $selectList.show().html(html);
    };

    if (source) {
        query = function (queryStr) {
            ajax = $.ajax({
                dataType: 'json',
                type: 'post',
                url: source,
                data: {query: queryStr}
            }).done(done);
        }
    } else {
        source = $elm.attr('ic-source');
        _pool = $elm.icParseProperty(source);
        query = function (queryStr) {
            var reg = new RegExp(queryStr, 'img');
            var result = _.filter(_pool, function (item, i, list) {
                if (_.isObject(item)) {
                    var result = _.filter(item, function (item) {
                        return reg.test(item);
                    });
                    return result.length;
                } else {
                    return reg.test(item);
                }
            });

            done(result);
        };

    }

//////////////////////////////////
    //event
    ////////////////////////////////////

    $elm.on('focus', function (e) {
        var offset = $elm.offset();
        var left = offset.left;
        var top = offset.top;
        $selectList.css({top: top + h + 1, left: left});

    }).on('keyup', function (e) {

        var val = $elm.val();
        if (!val) return $selectList.hide();
        if (val == queryStr) return;

        queryStr = val;

        //取消上个请求
        ajax && ajax.abort();

        //新请求
        query(queryStr);

    }).on('keydown', function (e) {

        var keyCode = e.keyCode;
        if (!(keyCode == 38 || keyCode == 40 || keyCode == 13)) {
            keydownActive = 0;
            return
        }

        var list = $selectList.find('[ic-role-type-item]');
        if (!list.length) return;
        var max = list.length - 1;

        if (e.keyCode == 38) {
            keydownActive = --keydownActive < 0 ? max : keydownActive;
            list.eq(keydownActive).addClass('active').siblings().removeClass('active');
            return;
        }

        if (e.keyCode == 40) {
            keydownActive = ++keydownActive > max ? 0 : keydownActive;
            list.eq(keydownActive).addClass('active').siblings().removeClass('active');
            return;
        }

        if (e.keyCode == 13) {
            list.eq(keydownActive).trigger('mousedown');
            $elm.blur();
        }

    }).on('blur', function (e) {
        $selectList.fadeOut(function () {
            $selectList.hide();
        });
    });


    $selectList.on('mousedown', '[ic-role-type-item]', function (e) {
        var index = $(this).index();
        var item = pool[index];
        var val = $(this).attr('ic-role-type-item');
        $elm.val(val);
        $elm.trigger('type.complete', item);
        onTypeComplete && onTypeComplete.apply($elm[0], [e,item])
    });


});
// mobile
/**
 * Created by j on 18/2/16.
 */

$.fn.icShowImg = function (option) {

    return this.each(function(){

        var html = '<div id="ic-show-img-box-wrap" style="position: fixed;width:100%;height:100%;left:0;top:0;z-index: 999;background-color: rgba(0,0,0,0.4);display:none;"><div id="ic-show-img-box"><img style="display:block;width:100%;"></div><div id="ic-show-img-close" style="position:absolute;top:0;right:0;padding:15px 20px;background-color: rgba(0,0,0,0.6);color:#fff;line-height:1;font-size:1.6em;cursor:pointer;">X</div></div>';

        var $that = $(this);
        var $imgBox = $('#ic-show-img-box-wrap');
        $imgBox = option.$imgBox || $imgBox.length ? $imgBox : $(html).appendTo($(document.body));
        var $show = $imgBox.find('img');
        var $close = $('#ic-show-img-close');

        var item = option.item || 'img';
        var $imgs = option.$imgs || $that.find(item);
        var url = option.url || 'src';
        var urls = option.urls || $imgs.map(function (i) {
                return $(this).attr('ic-show-img-item', i).attr(url);
            }).get();
        var interval = option.interval;
        var order = option.order || 1;

        var cla = 'on-ic-popup-show';

        var timer;
        var index = 0;
        var max = urls.length - 1;

        var callback = _.debounce(function (e) {
            //正负值表示滚动方向
            e = e || {originalEvent: {deltaY: order}};
            var isUp = e.originalEvent.deltaY < 0 ? --index : ++index;
            if (index < 0) {
                index = max;
            }
            if (index > max) {
                index = 0;
            }
            $close.text(index);
            $show.attr('src', urls[index]);
            return false;
        }, 100);

        var show = function (src) {
            $show.attr('src', src);
            index = urls.indexOf(src);
            $close.text(index);
            $imgBox.fadeToggle();
            $that.trigger('ic-show-img.show');
            $(document.body).addClass(cla).on('mousewheel', callback);
        };

        $that.on('click', item, function (e) {
            show( $(this).attr(url) );
            return false;
        });

        $imgBox.on('click', '#ic-show-img-close', function (e) {
            clearInterval(timer);
            $imgBox.fadeToggle();
            $that.trigger('ic-show-img.hide');
            $(document.body).removeClass(cla).off('mousewheel', callback);
        });

        if (option.start && interval) {
            show(urls[0]);
            timer = setInterval(callback, interval * 1000);
        }

    });
};

brick.directives.reg('ic-show-img', function ($elm) {

    var s_box = 'ic-show-img-box';  // img box 选择符
    var s_item = 'ic-show-img-item'; // img item 选择符
    var s_urls = 'ic-show-img-source';  // scope 数据源 图像url数据

    var $imgBox = $( $elm.attr(s_box) );
    var item = $elm.attr(s_item) || brick.get(s_item) || 'img';

    $elm.icShowImg({
        $imgBox: $imgBox.length ? $imgBox : undefined,
        item: item,
        $imgs: $elm.find(item),
        urls: $elm.icPp2(s_urls),
        url: $elm.attr('ic-show-img-url') || brick.get('ic-show-img-url') || 'src'
    });

});
/**
 * Created by j on 18/8/5.
 * 简单指令合集
 */

/**
 * Created by j on 18/8/11.
 */

brick.directives.reg({
    name: 'ic-popup',
    selfExec: true,
    once: true,
    fn: function () {

        var on_show_cla = 'on-ic-popup-show';
        var $body = $(document.body);

        function on_show($popup){
            $popup.on('scroll', on_scroll);
            $popup.show();
            $popup.scrollTop(0);
            $body.addClass(on_show_cla);
        }

        function on_hide($popup){
            $popup.off('scroll', on_scroll);
            $popup.hide();
            $popup[0].scrollTop = 0;
            $body.removeClass(on_show_cla);
        }

        function on_scroll (e){
            e.stopPropagation();
        }

        // jquery接口
        $.fn.icPopup = $.fn.icPopup || function(opt){
            opt ? on_show(this) : on_hide(this);
        };

        $body.on('click', '[ic-popup-target]', function (e) {
                var name = $(this).attr('ic-popup-target');
                var $popup = $('[ic-popup=?]'.replace('?', name));
                on_show($popup);
                //$body.scrollTop() + $body.height()
            })
            .on('click', '[ic-popup-close]', function(e){
                var name = $(this).attr('ic-popup-close');
                var $popup = name ? $('[ic-popup=?]'.replace('?', name)) : $(this).closest('[ic-popup]');
                on_hide($popup);
            });
    }
});;


brick.directives.reg('ic-input-select', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-input-select]', function (e) {

        });
    }
});

/**
 * 定义ic-toggle指令;
 */
brick.directives.reg('ic-toggle', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-toggle]', function (e) {
            var name = $(this).attr('ic-toggle');
            $('[ic-toggle-target=?]'.replace('?', name)).toggle();
        });
    }
});

/**
 * 定义ic-close指令;
 */
brick.directives.reg('ic-close', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-close]', function (e) {
            var $th = $(this);
            $th.closest('[ic-close-target]').toggle();
        });
    }
});

/**
 * 定义ic-checkbox指令;
 */
brick.directives.reg('ic-checkbox', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-checkbox]', function (e) {
            if(this !== e.target) return;
            var $th = $(this);
            if (this.hasAttribute('selected')) {
                $th.removeAttr('selected').removeClass('selected');
            } else {
                $th.attr('selected', true).addClass('selected');
            }
            $th.trigger('ic-checkbox.change', {name: $th.attr('ic-checkbox')});
        });
    }
});

/**
 * 定义ic-dom-clone指令;
 */
brick.directives.reg('ic-dom-clone', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-dom-clone]', function (e) {
            var $th = $(this);
            $th.prev('[ic-dom]').clone(true).insertBefore($th);
        });
    }
});

/**
 * 定义ic-dom-remove指令;
 */
brick.directives.reg('ic-dom-remove', {
    selfExec: true,
    once: true,
    fn: function () {
        $(document.body).on('click', '[ic-dom-remove]', function (e) {
            var nextAll = $(this).nextAll('[ic-dom]');
            nextAll.length > 1 && nextAll.eq(nextAll.length - 1).remove();
        });
    }
});



//bootstrap
$(function () {
    setTimeout(function () {
        if(!brick.get('debug')) cc(false, 'log');
        if(brick.get('bootstrap.auto') === false) return;
        brick.bootstrap(document.body);
    }, 30);
});

})(window);
