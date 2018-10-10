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

const wt = require('../../wt.json');

brick.reg('mainCtrl', function () {

    var scope = this;

    scope.crop = {x: 3140,y: 140, width: 310, height: 40};

    scope.init = function(){
        let dir = brick.utils.get_query('dir');
        let urls = imager.get_images(dir);
        urls.map(o => {
            o.info = wt.filter(arr => {
                return o.code == arr[3] && o.d.replace(/-/g, '') == arr[0];
            });
        });
        console.info(urls);
        scope.urls = urls;
        $('#box').icRender('list', urls);
    };

    scope.on_show = function(index, src, $info){
        var arr = scope.urls[index].info;
        arr = arr.map(a => {
            return [a[1], a[5], a[7], a[6]];
        });
        var text = arr.join('\r\n').replace(/,/g, '    ');
        console.info(text);
        $info.text(text);
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
            if (img_path.match(/\d{6}(?=\.png$)/)) return fn(arr);

            ocr({
                image: imager.crop(img_path, crop),
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

