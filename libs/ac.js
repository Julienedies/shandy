/**
 * Created by j on 18/6/4.
 * applescript 调用包装
 * ac : apple script
 */

const fs = require('fs');
const path = require('path');
const applescript = require('applescript');

const iconv = require('iconv-lite');

const config = require('../config.json');

const checkStockCode = require('./stock-query.js');

function _exec(fileName, args, callback){

    let filePath = path.join(config.dir.ac_dir, '*.scpt'.replace('*', fileName));

    if(!Array.isArray(args)){
        callback = args;
        args = [];
    }

    applescript.execFile(filePath, args, function (err, result) {
        if (err) {
            return console.error(err);
        }
        callback && callback(result);
    });
}


module.exports = {
    /*
     * @todo 从dock的程序图标里获取通达信当前显示个股名称
     * @param callback Function 通过appleceScript获取股票名称后的回调函数，传入股票代码
     */
    getStockName: function(callback){
        _exec('get-stock-name', function(result){
            console.log(result);
            // result = '通达信金融终端V7.38 - [组合图-天首发展]';
            result = result.replace('通达信金融终端V7.38 - [组合图-', '').replace(']','');
            result =  checkStockCode(result);
            callback && callback(result);
        });
    },
    activeTdx: function(){
        _exec('active-tdx');
    },
    activeFtnn: function(){
        _exec('active-ftnn');
    },
    keystroke: function(code){

        return _exec('keystroke');

        const chardet = require('chardet');
        //let encode = chardet.detectFileSync(file); //windows-1252
        let encode = chardet.detectFileSync(path.join(config.dir.ac_dir, 'xx.scpt')); //windows-1252
        return console.log(encode);

        let file = path.join(config.dir.ac_dir, 'keystroke.scpt');
        let _file = file.replace(/(\w+\.scpt)$/, '_$1');
        //let str = fs.readFileSync(file, 'windows-1252');


        fs.createReadStream(file)
            .pipe(iconv.decodeStream('win1252'))
            .pipe(process.stdout)
            //.pipe(iconv.encodeStream('utf-8'))
            //.pipe(fs.createWriteStream(_file));



        //let str = fs.readFileSync(_file, 'utf-8').replace('*', code);
        //console.log(str);

        //fs.writeFileSync(file, str, 'utf8');

        //_exec('__keystroke');

        /*applescript.execString(script, function(err, result) {
            if (err) {
                return console.error(err);
            }
            console.log(result);
        });*/
    }

};