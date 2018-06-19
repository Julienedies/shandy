/**
 * Created by j on 18/6/19.
 */

const _console = console;

const _clone = {};
for(let i in console){
    if(typeof console[i] == 'function'){
        _clone[i] = function(){};
    }
}

module.exports = {
    debug: function(bool){
        if(bool != undefined && !bool){
            console = _clone;
        }else{
            console = _console;
        }
    }
};