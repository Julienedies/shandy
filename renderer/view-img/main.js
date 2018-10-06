/*!
 * Created by j on 18/9/14.
 */

const fs = require('fs');
const path = require('path');

// activate context menu
const debugMenu = require('debug-menu');
debugMenu.install();

const ocr = require('../../libs/baidu-ocr.js');
const stock_query = require('../../libs/stock-query.js');

const imager = require('./imager.js');

brick.reg('mainCtrl', function () {

    var scope = this;

    scope.crop = {x: 3140,y: 140, width: 310, height: 40};

    scope.init = function(){
        let dir = brick.utils.get_query('dir');
        let urls = imager.get_images(dir);
        scope.urls = urls;
        $('#box').icRender('list', urls);
        //$('#box').icShowImg({item: 'li', url: 'url', urls: urls, start: true, interval: 7});
        //imager.crop(urls[0].f);
    };

    scope.crop_test = function(fields){
        console.info(fields);
        scope.crop = fields || scope.crop;
        let dataUrl = imager.crop(scope.urls[0].f, fields);
        $(this).next('img').attr('src', dataUrl);
    };

    scope.ocr_rename = function(e){

        let crop = scope.crop;
        let arr = scope.urls.map(o => {
            return o.f;
        });

        (function fn(arr){
            var img_path = arr.shift();
            if(!img_path) return scope.init();
            /*var code_arr = img_path.match(/\d{6}(?=\.png$)/);
            if (code_arr) {
                let stock = stock_query(code_arr[0]);
                fs.renameSync(img_path, img_path.replace('(2)', `-${stock.name}`));
                return fn(arr);
            }*/

            let dataUrl = imager.crop(img_path, crop);

            ocr({
                image: dataUrl,
                callback: function (words) {
                    let stock = stock_query(words);
                    if(stock.code){
                        fs.renameSync(img_path, img_path.replace('(2)', `-${stock.name}`).replace(/\.png$/, `-${stock.code}.png`));
                    }else{
                        console.error('ocr fail: ', img_path, stock);
                    }
                    setTimeout(function(){
                        fn(arr);
                    }, 1000);
                }
            });

        })(arr);

    };

    scope.init();

});

