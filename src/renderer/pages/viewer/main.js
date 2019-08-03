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
import setting from '../../../libs/setting'
import bridge from 'e-bridge'

import imager from './imager.js'

// activate context menu
debugMenu.install();

// 交易记录json
const tradeArr = userDb('trading', []).get();

brick.reg('mainCtrl', function (scope) {

    scope.onSelectImgDirDone = (paths) => {
        if (!paths) return;
        let dir = paths[0];
        scope.imgDir = dir;
        scope.init(dir);
        setting.set('viewer.imgDir', dir);
    };

    // 获取目录下所有图片
    scope.init = function (dir) {
        dir = dir || scope.imgDir;
        let urls = imager.getImages(dir);
        if (!urls.length) return console.log('no images.');
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


    let imgDir = scope.imgDir = setting.get('viewer.imgDir');
    if (imgDir) {
        $('input[name=imgDir]').val(imgDir)
        scope.init(imgDir)
    }

    scope.crop = setting.get('viewer.crop');
    scope.render('crop', {model: scope.crop || {}});

    // ------------------------------------------------------------------------

    // ic-viewer  回调函数
    let $viewerAttach = $('#viewerAttach');

    scope.onViewerOpen = () => {
        $viewerAttach.show();
    };
    scope.onViewerClose = () => {
        $viewerAttach.hide();
    };
    scope.onViewerShow = function (index, src, $info) {
        let imgObj = scope.currentImg = scope.urls[index]
        let arr = imgObj.tradeInfo;
        if (arr) {
            arr = arr.map(a => {
                return [a[1], a[5], a[7], a[6]];
            });
            arr.reverse(); // 当日多个交易记录按照时间先后显示
            let text = arr.join('\r\n').replace(/,/g, '    ');
            $viewerAttach.find('p').text(text);
        }

        $info.text('\r\n' + imgObj.f);
    };

    scope.editImg = () => {
        let imgObj = scope.currentImg;
        bridge.preview(imgObj.f);
    };

    scope.viewItemInFolder = () => {
        bridge.showItemInFolder(scope.currentImg.f);
    };

    scope.viewInTdx = () => {
        console.log(scope.currentImg);
        bridge.viewInTdx(scope.currentImg.code);
    };

    scope.viewInFtnn = () => {
        bridge.viewInFtnn(scope.currentImg.code);
    };

    function copyImageToDist (dirPath) {
        let imgObj = scope.currentImg;
        let fileName = imgObj.f.split('/').pop();
        bridge.copy(imgObj.f, `${dirPath}${ fileName }`)
            .then(() => {
                $.icMessage('ok!')
            })
            .catch(err => {
                bridge.err('error, 查看控制台.')
                console.error(err)
            })
    }

    scope.markMistake = () => {
        copyImageToDist('/Users/j/截图/交易错误/');
    };

    scope.markQuotation = () => {
        copyImageToDist('/Users/j/截图/目标行情/');
    };


    // -----------------------------------------------------------------------------------------------


    // 图片剪切测试  fields => {x: 3140, y: 115, width: 310, height: 50}
    // scope.crop = {x: 3140, y: 115, width: 310, height: 50};
    scope.cropTest = function (fields) {
        console.info(fields);
        let crop = scope.crop = fields || scope.crop;
        let sn = $('#sn').val();
        let dataUrl = imager.crop(scope.urls[sn].f, fields);
        $('#view_crop').attr('src', dataUrl);
        setting.set('viewer.crop', crop);
    };

    // 图片列表重命名
    scope.ocrRename = function (e) {

        let $view_crop = $('#view_crop');
        let $ocr_text = $('#ocr_text');

        let that = this;

        let arr = scope.urls.map(o => {
            return o.f;
        });

        let crop = scope.crop;

        if (!crop) {
            return alert('请先进行剪切测试!');
        }

        $(this).icSetLoading();

        (function fn (arr) {
            let imgPath = arr.shift();

            // 忽略富途大盘指数截图
            if (/\d{2}\.\d{2}\.png$/img.test(imgPath)) {
                return fn(arr);
            }

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

