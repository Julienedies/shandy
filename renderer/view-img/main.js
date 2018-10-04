/*!
 * Created by j on 18/9/14.
 */

const fs = require('fs');
const path = require('path');

const imager = require('./imager.js');

// activate context menu
const debugMenu = require('debug-menu');
debugMenu.install();

const stock_query = require('../../libs/stock-query.js');

brick.reg('mainCtrl', function () {
    var scope = this;

    this.init = function(){
        let dir = brick.utils.get_query('dir');
        let urls = imager.get_images(dir);
        scope.urls = urls;
        console.info(urls);
        $('#box').icRender('list', urls);
        //$('#box').icShowImg({item: 'li', url: 'url', urls: urls, start: true, interval: 7});
        //imager.crop_ocr(urls[0]);
    };

    this.ocr_rename = function(e){

        (function fn(arr){
            var img_path = arr.shift();
            if(!img_path) return scope.init();
            var code_arr = img_path.match(/\d{6}(?=\.png$)/);
            if (code_arr) {
                let stock = stock_query(code_arr[0]);
                fs.renameSync(img_path, img_path.replace('(2)', `-${stock.name}`));
                return fn(arr);
            }

            imager.crop_ocr(img_path, function (words) {
                console.log((new Date).toLocaleString());
                let stock = stock_query(words);
                if(stock.code){
                    fs.renameSync(img_path, img_path.replace('(2)', `-${stock.name}`).replace(/\.png$/, `-${stock.code}.png`));
                }else{
                    console.error('ocr fail: ', img_path, stock);
                }
                setTimeout(function(){
                    fn(arr);
                }, 1000);
            });

        })(scope.urls.slice());

    };


    this.init();

});