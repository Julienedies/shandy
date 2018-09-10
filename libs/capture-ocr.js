/*!
 * Created by j on 18/6/16.
 * 截屏, 通过图片ocr识别通达信界面当前股票
 */

const capture = require('./screen-capture.js');
const ocr = require('./baidu-ocr.js');
const query = require('./stock-query.js');

module.exports = function ( f ){
    var start = + new Date();
    capture({
        returnType: 'dataUrl',
        crop: {x: 2530,y: 120, width: 280,height: 42},
        callback: function(dataUrl){
            console.info("%c\n ", `padding:50px 240px;background:url(${dataUrl}) no-repeat 0 0`);
            ocr({
                image: dataUrl,
                callback: function(words){
                    let stock = query(words);
                    console.info(`capture-ocr 耗时 : ${(+new Date - start) / 1000}秒 `);
                    f(stock);
                }
            });
        }
    });
};

