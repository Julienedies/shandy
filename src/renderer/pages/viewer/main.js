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

import userJo from '../../../libs/user-jo'
import userJodb from '../../../libs/user-jodb'
import setting from '../../../libs/setting'
import utils from '../../../libs/utils'

import helper from './helper'

// activate context menu
debugMenu.install();

// 交易记录json
const tradeArr = userJo('trading', []).get();

const viewerJodb = userJodb('viewer');

brick.services.reg('historyModel', function () {
    return {
        _pool: [],
        cb: () => {
        },
        init: function (arr) {
            this._pool = arr;
            this._pool.sort((a, b) => {
                let f = (s) => {
                    let d = s.split('/').pop();
                    d = d.split('-').shift();
                    return d * 1 || 3000;
                };
                return f(b) - f(a);
            });
            this.cb();
        },
        get: function () {
            return this._pool;
        },
        add: function (item) {
            if (!this._pool.includes(item)) {
                this._pool.unshift(item);
                this.cb();
            }
        },
        remove: function (item) {
            let index = this._pool.indexOf(item);
            this._pool.splice(index, 1);
            this.cb();
        },
        on: function (event, cb) {
            this.cb = cb;
        }
    }
});

brick.reg('mainCtrl', function (scope) {

    const historyModel = brick.services.get('historyModel');

    let $list = $('#list');
    let $imgDir = $('input[name=imgDir]');

    scope.reload = function () {
        location.reload();
    };
    // 反转图片列表
    scope.reverse = function () {
        scope.urls.reverse();
        $list.icRender('list', scope.urls);
    };

    // 显示目录下图片列表
    scope.init = function (dir) {
        dir = dir || scope.imgDir;
        scope.imgDir = dir;
        if (!fs.existsSync(dir)) {
            return $.icMsg(`${ dir }\r不存在!`);
        }
        let urls = helper.getImages(dir);
        if (!urls.length) {
            return $.icMsg('no images.');
        }
        urls[0].code && urls.forEach(o => {
            o.tradeInfo = tradeArr.filter(arr => {
                // 交易信息 对应 code 和 时间
                return o.code === arr[3] && o.d.replace(/-/g, '') === arr[0];
            });
        });
        console.info(urls);
        scope.urls = urls;
        $imgDir.val(dir);
        $list.icRender('list', urls);
        setting.set('viewer.imgDir', dir);
    };

    // 图片目录路径选中后回调
    scope.onSelectImgDirDone = (paths) => {
        if (!paths) return;
        let dir = paths[0];
        historyModel.add(dir);
        scope.imgDir = dir;
        scope.init(dir);
    };

    // 图片剪切测试  fields => {x: 3140, y: 115, width: 310, height: 50}
    // scope.crop = {x: 3140, y: 115, width: 310, height: 50};
    scope.cropTest = function (fields) {
        console.info(fields);
        let crop = scope.crop = fields || scope.crop;
        let sn = $('#sn').val();
        let dataUrl = helper.crop(scope.urls[sn].f, fields);
        $('#view_crop').attr('src', dataUrl);
        setting.set('viewer.crop', crop);
    };

    // 图片列表重命名
    scope.ocrRename = function (e) {

        let $th = $(this);
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

        helper.renameByOcr(arr, crop, (info) => {
            if (info) {
                $view_crop.attr('src', info.dataUrl);
                $ocr_text.text(info.words);
            } else {
                $th.icClearLoading();
                scope.init();
            }
        });

    };

    // 显示某个历史目录
    scope.show = function (e, dir) {
        scope.init(dir);
    };

    // 删除历史目录
    scope.remove = function (e, dir) {
        historyModel.remove(dir);
    };

    // ------------------------------------------------------------------------------------------------

    historyModel.on('change', () => {
        let arr = historyModel.get();
        scope.render('history', {model: arr});
        setting.set('viewer.history', arr);
    });


    historyModel.init(setting.get('viewer.history') || []);

    let imgDir = setting.get('viewer.imgDir');
    scope.imgDir = imgDir;
    if (imgDir) {
        scope.init(imgDir)
    }

    scope.crop = setting.get('viewer.crop');
    scope.render('crop', {model: scope.crop || {}});

});


brick.reg('listCtrl', function (scope) {

    // ic-viewer  回调函数
    let $viewerAttach = $('#viewerAttach');

    scope.onViewerOpen = () => {
        $viewerAttach.show();
    };
    scope.onViewerClose = () => {
        $viewerAttach.hide();
    };

    scope.onViewerShow = function (index, src, $info) {
        let imgObj = scope.currentImg = scope.urls[index]; // scope.urls 继承自mainCtrl
        scope.markTag();
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
        utils.preview(imgObj.f);
    };

    scope.viewItemInFolder = () => {
        utils.showItemInFolder(scope.currentImg.f);
    };

    scope.viewInTdx = () => {
        console.log(scope.currentImg);
        utils.viewInTdx(scope.currentImg.code);
    };

    scope.viewInFtnn = () => {
        utils.viewInFtnn(scope.currentImg.code);
    };

    scope.markTag = () => {
        brick.emit('markTag', scope.currentImg);
    };

    scope.markMistake = () => {
        copyImageToDist('/Users/j/截图/交易错误/');
    };

    scope.markQuotation = () => {
        copyImageToDist('/Users/j/截图/目标行情/');
    };

    scope.moveToTrash = () => {
        let imgObj = scope.currentImg;
        let fileName = imgObj.f.split('/').pop();
        utils.move(imgObj.f, `/Users/j/截图/目标行情/C/${ fileName }`)
            .then(() => {
                $.icMessage('ok!');
            })
            .catch(err => {
                utils.err('error, 查看控制台.');
                console.error(err);
            });
    };

    function copyImageToDist (dirPath) {
        let imgObj = scope.currentImg;
        let fileName = imgObj.f.split('/').pop();
        utils.copy(imgObj.f, `${ dirPath }${ fileName }`)
            .then(() => {
                $.icMessage('ok!')
            })
            .catch(err => {
                utils.err('error, 查看控制台.')
                console.error(err)
            });
    }

});


brick.reg('markTagCtrl', function (scope) {

    let currentImg = {};
    let model = null;
    let imgObj = {};

    let render = () => {
        imgObj = viewerJodb.get(currentImg.f, 'img')[0] || {img: currentImg.f};
        console.log(imgObj);
        let f = (imgObj) => {
            return imgObj;
        };
        model.img = f(imgObj);
        scope.render('tags', {model});
    };

    scope.onGetSystemDone = function (data) {
        console.info(data);
        model = data;
        render();
    };

    scope.hide = function(e) {
        // $.icMsg(e.target.tagName);
        scope.$elm.icPopup(false);
    };

    scope.onChange = function (val) {
        console.log(val);
        imgObj[val.name] = val.value;
        viewerJodb.set(imgObj);
    };

    scope.on('markTag', function (e, msg) {
        currentImg = msg;
        render();
    });

    scope.$elm.hover(function() {
        scope.$elm.css('opacity', 1);
    }, function() {
        scope.$elm.css('opacity', 0);
    });

});
