/**
 * Created by j on 18/6/4.
 * applescript 调用包装
 * ac : apple script
 */

const path = require('path');
const applescript = require('applescript');

const config = require('../config.json');

function _exec(fileName, callback){
    let filePath = path.join(config.dir.ac_dir, '*.scpt'.replace('*', fileName));
    applescript.execFile(filePath, function (err, result) {
        if (err) {
            return console.error(err);
        }
        callback && callback(result);
    });
}


module.exports = {
    /*
     * @todo 从dock的程序图标里获取通达信当前显示个股名称
     * @param callback Function 通过appleceScript获取名称后的回调函数，传入参数名称字符串
     */
    getStockName: function(callback){
        _exec('get-stock-name', function(result){
            console.log(result);
            // result = '通达信金融终端V7.38 - [组合图-天首发展]';
            result = result.replace('通达信金融终端V7.38 - [组合图-', '').replace(']','');
            callback && callback(result);
        });
    },
    activeTdx: function(){
        _exec('active-tdx');
    }

};