/*!
 * Created by j on 18/9/14.
 */

import 'babel-polyfill'

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
import ju from '../../../libs/jodb-user'
import setting from '../../../libs/setting'
import jd from '../../../libs/jodb-data'
import utils from '../../../libs/utils'

import helper from './helper'

import historyModel from './historyModel'

import markTagCtrl from './markTag-ctrl'
import listCtrl from './list-ctrl'
// activate context menu
debugMenu.install();

// 交易记录json
const tradeArr = userJo('SEL', []).get();

const viewerJodb = ju('viewer');
const tagsJodb = jd('tags');


brick.services.reg('historyModel', historyModel);

brick.set('ic-viewer-interval', setting.get('viewer.interval') || 10);

brick.reg('mainCtrl', function (scope) {

    const historyModel = brick.services.get('historyModel');

    let $list = $('#list');
    let $imgDir = $('input[name=imgDir]');

    let isReverse = false;

    let tagsMap = {};
    tagsJodb.each((item) => {
        tagsMap[item.id] = item;
    });

    scope.setViewerInterval = function (e) {
        let val = $(this).val() * 1;
        brick.icViewer.set('interval', val);
        setting.refresh().set('viewer.interval', val);
        $.icMsg(val);
    };

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
        //scope.urls.reverse();
        //$list.icRender('list', scope.urls);
        scope.init('', isReverse);
        isReverse = !isReverse;
    };

    // 显示目录下图片列表
    scope.init = async function (dir, isReverse = true) {
        dir = dir || scope.imgDir;
        scope.imgDir = dir;
        if (!fs.existsSync(dir)) {
            return $.icMsg(`${ dir }\r不存在!`);
        }

        //
        let isAddTags = /交易记录/img.test(dir);

        let urls = helper.getImages(dir, {isReverse});
        if (!urls.length) {
            return $.icMsg('no images.');
        }
        urls[0].code && urls.forEach(o => {
            o.tradeInfo = tradeArr.filter(arr => {
                // 交易信息 对应 code 和 时间
                return o.code === arr[2] && o.d && o.d.replace(/-/g, '') === arr[0];
            });

            if (1) {
                let obj = viewerJodb.get(o.f, 'img')[0] || {tags: []};
                let arr = obj.tags || [];
                //console.log(obj);
                o.tags = arr.map((v) => {
                    return tagsMap[v];
                });
            }
        });
        console.log('urls =>', urls);
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
        let {x, y, width, height} = fields || scope.crop;
        let crop = scope.crop = {x, y, width, height};
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
        //let $th = $(this).icSetLoading();
        scope.init(dir);
        //$th.icClearLoading();
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
        scope.init(imgDir);
    }

    scope.viewerVm = setting.get('viewer');
    scope.render('crop', {model: scope.viewerVm || {}}, () => {
        scope.$elm.find('#interval').val(scope.viewerVm.interval);
    });

});


brick.reg('viewerListCtrl', listCtrl);


brick.reg('viewerMarkTagCtrl', markTagCtrl);
