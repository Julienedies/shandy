/*!
 * applescript 调用包装
 * ac : apple script
 * Created by j on 18/6/4.
 */

import fs from 'fs';
import path from 'path';

import applescript from 'applescript';
import iconv from 'iconv-lite'
import chardet from 'chardet';

import stockQuery from './stock-query.js'
import config from './config'

function _exec (fileName, args, callback) {

    let filePath = path.resolve(config.AC_DIR, `${ fileName }.scpt`);

    if (!Array.isArray(args)) {
        callback = args;
        args = [];
    }

    applescript.execFile(filePath, args, function (err, result) {
        if (err) {
            throw new Error(err)
        }
        callback && callback(result);
    });
}

export default {
    /*
     * 从dock的程序图标里获取通达信当前显示个股名称
     * @param callback {Function} 通过apple Script获取股票名称后的回调函数，传入股票代码
     */
    getStockName: function (callback) {
        _exec('get-stock-name', function (result) {
            console.log(result);
            // result = '通达信金融终端V7.38 - [组合图-天首发展]'; 从dock通达信图标右键菜单获取的字符串
            // result = result.replace('通达信金融终端V7.38 - [组合图-', '').replace(']','');
            let arr = result.match(/\[分析图表-(.+)[\]]$/) || [];
            let name = arr[1];
            result = stockQuery(name);
            callback && callback(result);
        });
    },
    activeTdx: function () {
        _exec('active-tdx');
    },
    activeFtnn: function () {
        _exec('active-ftnn');
    },
    keystroke: function (code) {
        return _exec('keystroke');

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
