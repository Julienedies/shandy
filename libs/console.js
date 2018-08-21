/**
 * Created by j on 18/6/19.
 * @todo 控制控制台输出行为
 */

;
(function () {

    const _console = console;

    const _clone = {};

    const _bak = {};

    const _methods = [];

    for (let i in _console) {
        if (typeof _console[i] == 'function') {
            _methods.push(i);
            _bak[i] = console[i];
            /*_clone[i] = function(){
                _console[i].apply(_console, [].slice.call(arguments));
            }*/
        }
    }

    /*
     * @todo 管理console的输出行为,
     * @param bool {Boolean} [可选] 是否输出console方法调用
     * @param methods  {String}  [可选]  console方法名
     * @example
     * const cm = require('console-manager');
     * cm('info','log');  // console.log and console.info 调用后控制台不会有输出
     * cm(true, 'log');  // console.log 调用后控制台有输出
     */
    function _export(bool, methods) {
        let arr = [].slice.call(arguments);
        bool = arr.shift();
        methods = arr;
        if (typeof bool == 'undefined') {
            methods = _methods;
        }
        else if (typeof bool == 'boolean') {
            methods = methods.length ? methods : _methods;
        }
        else if (typeof bool == 'string') {
            methods.unshift(bool);
            bool = false;
        }
        methods.forEach((method) => {
            console[method] = bool ? _bak[method] : function(){};
            /*_clone[method] = bool ? function () {
                _console[method].apply(_console, [].slice.call(arguments));
            } : function () {
            };*/
        });
        //console = _clone;
    }


    // export
    if(typeof module != 'undefined'){
        module.exports = _export;
    } else {
        window.cm = _export;
    }

})();
