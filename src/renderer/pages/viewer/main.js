/*!
 * Created by j on 18/9/14.
 */

import fs from 'fs'
import $ from 'jquery'
import debugMenu from 'debug-menu'

import ocr from '../../../libs/baidu-ocr.js'
import stockQuery from '../../../libs/stock-query.js'
import userDb from '../../../libs/user-db'

import imager from './imager.js'

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import './style.scss'

// 交易记录json
const tradeArr = userDb('trading', []).get()

// activate context menu
debugMenu.install();

brick.reg('mainCtrl', function (scope) {

    scope.crop = {x: 3140, y: 115, width: 310, height: 50};

    // 获取目录下所有图片
    scope.init = function () {
        let dir = brick.utils.get_query('dir');
        let urls = imager.get_images(dir);
        urls.map(o => {
            o.tradeInfo = tradeArr.filter(arr => {
                // 交易信息 对应 code 和 时间
                return o.code === arr[3] && o.d.replace(/-/g, '') === arr[0];
            });
        });
        console.info(urls);
        scope.urls = urls;
        $('#box').icRender('list', urls);
    };

    // ic-viewer  回调函数
    scope.onShow = function (index, src, $info) {
        let imgObj = scope.urls[index]
        let arr = imgObj.tradeInfo;
        arr = arr.map(a => {
            return [a[1], a[5], a[7], a[6]];
        });
        arr.reverse(); // 当日多个交易记录按照时间先后显示
        let text = arr.join('\r\n').replace(/,/g, '    ');
        $info.text(text + '\r\n' + imgObj.f);
    };

    // 图片剪切测试  fields => {x: 3140, y: 115, width: 310, height: 50}
    scope.crop_test = function (fields) {
        console.info(fields);
        scope.crop = fields || scope.crop;
        let sn = $('#sn').val();
        let dataUrl = imager.crop(scope.urls[sn].f, fields);
        $('#view_crop').attr('src', dataUrl);
    };

    // 图片列表重命名
    scope.ocr_rename = function (e) {

        let $view_crop = $('#view_crop');
        let $ocr_text = $('#ocr_text');

        let that = this;
        $(this).icSetLoading();

        let crop = scope.crop;
        let arr = scope.urls.map(o => {
            return o.f;
        });

        (function fn (arr) {
            let img_path = arr.shift();
            if (!img_path) { // 图片数组重命名结束
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
                    let stock = stockQuery(words);
                    if (stock.code) {
                        fs.renameSync(img_path, img_path.replace('(2)', `-${ stock.name }`).replace(/\.png$/, `-${ stock.code }.png`));
                    } else {
                        console.error('ocr fail: ', img_path, stock);
                        return fn(arr);
                    }
                    setTimeout(function () {
                        fn(arr);
                    }, 1000);
                }
            });

        })(arr);

    };

    scope.init();

});

brick.bootstrap()
