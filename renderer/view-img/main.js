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

// 交易记录json
const wt = require('../../wt.json');

brick.reg('mainCtrl', function () {

    var scope = this;

    scope.crop = {x: 3140, y: 115, width: 310, height: 50};

    // 获取目录下所有图片
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

    // ic-show-img  回调函数
    scope.on_show = function(index, src, $info){
        var arr = scope.urls[index].info;
        arr = arr.map(a => {
            return [a[1], a[5], a[7], a[6]];
        });
        var text = arr.join('\r\n').replace(/,/g, '    ');
        $info.text(text);
    };

    // 图片剪切测试  fields => {x: 3140, y: 115, width: 310, height: 50}
    scope.crop_test = function(fields){
        console.info(fields);
        scope.crop = fields || scope.crop;
        let sn = $('#sn').val();
        let dataUrl = imager.crop(scope.urls[sn].f, fields);
        $('#view_crop').attr('src', dataUrl);
    };

    // 图片列表重命名
    scope.ocr_rename = function(e){

        var $view_crop = $('#view_crop');
        var $ocr_text = $('#ocr_text');

        var that = this;
        $(this).icSetLoading();

        let crop = scope.crop;
        let arr = scope.urls.map(o => {
            return o.f;
        });

        (function fn(arr){
            var img_path = arr.shift();
            if(!img_path) { // 图片数组重命名结束
                $(that).icClearLoading();
                return scope.init();
            }
            if (img_path.match(/\d{6}(?=\.png$)/)) return fn(arr);  // 已经ocr 重命名过的跳过

            let dataUrl = imager.crop(img_path, crop);
            $view_crop.attr('src', dataUrl);

            ocr({
                image: dataUrl,
                callback: function (words) {
                    $ocr_text.text(words);
                    let stock = stock_query(words);
                    if(stock.code){
                        fs.renameSync(img_path, img_path.replace('(2)', `-${stock.name}`).replace(/\.png$/, `-${stock.code}.png`));
                    }else{
                        console.error('ocr fail: ', img_path, stock);
                        $(that).icClearLoading();
                        return;
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

