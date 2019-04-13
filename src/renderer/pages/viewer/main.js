/*!
 * Created by j on 18/9/14.
 */

import './index.html'
import './style.scss'

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

import fs from 'fs'
import $ from 'jquery'
import debugMenu from 'debug-menu'

import ocr from '../../../libs/baidu-ocr.js'
import stockQuery from '../../../libs/stock-query.js'
import userDb from '../../../libs/user-db'

import imager from './imager.js'

// activate context menu
debugMenu.install();

// 交易记录json
const tradeArr = userDb('trading', []).get()

brick.reg('mainCtrl', function (scope) {

    scope.crop = {x: 3140, y: 115, width: 310, height: 50};

    scope.onSelectViewerDirDone = (paths) => {
        if (!paths) return;
        let dir = paths[0]
        scope.init(dir)
    }

    // 获取目录下所有图片
    scope.init = function (dir) {
        //let dir = brick.utils.get_query('dir');
        let urls = imager.get_images(dir);
        if(!urls.length) return;
        urls[0].code && urls.forEach(o => {
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
    let $viewerAttach = $('#viewerAttach');
    scope.onViewerOpen = () => {
        $viewerAttach.show()
    };
    scope.onViewerClose = () => {
        $viewerAttach.hide()
    };
    scope.onViewerShow = function (index, src, $info) {
        let imgObj = scope.urls[index]
        let arr = imgObj.tradeInfo;
        if(!arr) return;
        arr = arr.map(a => {
            return [a[1], a[5], a[7], a[6]];
        });
        arr.reverse(); // 当日多个交易记录按照时间先后显示
        let text = arr.join('\r\n').replace(/,/g, '    ');
        $viewerAttach.text(text)
        $info.text('\r\n' + imgObj.f);
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
            let imgPath = arr.shift();
            // 图片数组重命名结束
            if (!imgPath) {
                $(that).icClearLoading();
                return scope.init();
            }
            // 已经ocr 重命名过的跳过
            if (imgPath.match(/\d{6}(?=\.png$)/)) {
                // '屏幕快照 2019-03-22 下午9.08.59 -九阳股份-002242.png' 重命名到: '九阳股份 2019-03-22 下午9.08.59 -九阳股份-002242.png'
                let rename = imgPath.replace(/^(.+)\/(屏幕快照)(\s+.+\s+)-(.+)-(\d{6}\.png)$/img, '$1/$4$3-$4-$5')
                if (imgPath !== rename) {
                    fs.renameSync(imgPath, rename)
                }
                return fn(arr);
            }

            // 裁剪预览
            let dataUrl = imager.crop(imgPath, crop);
            $view_crop.attr('src', dataUrl);

            // ocr 命名
            ocr({
                image: dataUrl,
                callback: function (words) {
                    $ocr_text.text(words);
                    let stock = stockQuery(words);
                    if (stock.code) {
                        let rename = imgPath
                            .replace('屏幕快照', stock.name)
                            .replace('(2)', `-${ stock.name }`)
                            .replace(/\.png$/, `-${ stock.code }.png`);
                        fs.renameSync(imgPath, rename);
                    } else {
                        console.error('ocr fail: ', imgPath, stock);
                        return fn(arr);
                    }
                    setTimeout(function () {
                        fn(arr);
                    }, 1000);
                }
            });

        })(arr);

    };

    // ---------------------------------------------------------------------------------------

});

brick.bootstrap()
