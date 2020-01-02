/*!
 * Created by j on 18/9/14.
 */

import './index.html'
import '../../css/common/common.scss'
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

import historyModel from './historyModel'

import markTagCtrl from './markTag-ctrl'
import listCtrl from './list-ctrl'
// activate context menu
debugMenu.install();

// 交易记录json
const tradeArr = userJo('trading', []).get();

const viewerJodb = userJodb('viewer');

brick.services.reg('historyModel', historyModel);


brick.reg('mainCtrl', function (scope) {

    const historyModel = brick.services.get('historyModel');

    let $list = $('#list');
    let $imgDir = $('input[name=imgDir]');

    scope.reload = function (e) {
        location.reload();
    };

    scope.clean = function (e) {
        let imgArr = viewerJodb.get();
        let resultArr = [];
        for (let i = 0; i < imgArr.length; i++) {
            let imgObj = imgArr[i];
            let imgPath = imgObj.img;
            if (!fs.existsSync(imgPath)) {
                resultArr.push(imgObj);
                if (confirm(`找不到：\r\n ${ imgPath }`)) {
                    viewerJodb.remove(imgObj.id);
                } else {
                    break;
                }
            }
        }
        !resultArr.length && $.icMsg('没有错误图片记录.');
        console.info('scope.clean', resultArr);
    };

    // 反转图片列表
    scope.reverse = function (e) {
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
        console.log('urls =>', urls);
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
        setting.refresh().set('viewer.imgDir', dir);
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
        setting.refresh().set('viewer.crop', crop);
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
        scope.render('history', {model: historyModel.get2()});
        setting.refresh().set('viewer.history', historyModel.get());
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


brick.reg('viewerListCtrl', listCtrl);


brick.reg('viewerMarkTagCtrl', markTagCtrl);
