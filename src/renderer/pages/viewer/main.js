/*!
 * Created by j on 18/9/14.
 */

import 'babel-polyfill'

import './index.html'
import '../../css/common/common.scss'
import './icViewer.scss'
import './style.scss'


import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

import fs from 'fs'
import $ from 'jquery'
import debugMenu from 'debug-menu'

import userJo from '../../../libs/jsono-user'
import ju from '../../../libs/jodb-user'
import jd from '../../../libs/jodb-data'
import setting from '../../../libs/setting'
import utils from '../../../libs/utils'

import helper from './helper'
import helper2 from './helper2'
import backTop from '../../js/back-top'

import historyModel from './historyModel'

import markTagCtrl from './markTag-ctrl'
import listCtrl from './list-ctrl'
import attachCtrl from './attach-ctrl'

// activate context menu
debugMenu.install();

// 交易记录json
const tradeArr = userJo('SEL', []).get();

const viewerJodb = ju('viewer', [], {key: 'img'});
const tagsJodb = jd('tags');
const systemJodb = jd('system');

window.$ = $;
window.brick = brick;

window.TAGS_FILTER = ['交易错误', '交易统计', '交易风险', '行情类型', '目标行情', '行情驱动因素'];

brick.services.reg('historyModel', historyModel);

brick.set('ic-viewer-interval', setting.get('viewer.interval') || 10);


brick.reg('mainCtrl', function (scope) {

    backTop();

    const historyModel = brick.services.get('historyModel');

    let $list = $('#list');
    let $imgDir = $('input[name=imgDir]');
    let $countShow;

    let isReverse = true; // 图片顺序反转
    let isRefresh = false;
    let isOrigin = false;  // 按图片原始时间排序
    let filterByMarked = false; // 根据图片是否被标记进行过滤

    let tagsMap = {};
    let systemMap = {};
    let urlsByDayMap = {};
    tagsJodb.each((item) => {
        tagsMap[item.id] = item;
    });
    systemJodb.each((item) => {
        systemMap[item.id] = item;
    });

    scope.setViewerInterval = function (e) {
        let val = $(this).val() * 1;
        brick.icViewer.set('interval', val);
        setting.refresh().set('viewer.interval', val);
        $.icMsg(val);
    };

    // 特定临时操作
    scope.ls = function () {
        if (confirm('确定此次临时操作？？？')) {
            //helper2.setTo(viewerJodb); // 更改热点系统
        }
    };

    // 检查viewer.json里包含的图片是否存在于文件系统，不存在的话删除viewer.json里的记录
    scope.clean = function (e) {
        let imgArr = viewerJodb.get();
        let resultArr = [];
        for (let i = 0; i < imgArr.length; i++) {
            let imgObj = imgArr[i];
            let imgPath = imgObj.img;
            if (!fs.existsSync(imgPath)) {
                resultArr.push(imgObj);
            }
        }

        if (resultArr.length) {
            if (confirm(`是否删除以下 ${ resultArr.length } 项：\r\n ${ JSON.stringify(resultArr, null, '\t') }`)) {
                resultArr.forEach((imgObj, index) => {
                    viewerJodb.remove(imgObj.img, 'img');
                });
            }
            console.info('scope.clean', resultArr);
        } else {
            $.icMsg('没有错误图片记录.');
        }

    };

    // 刷新目录缓存数据
    scope.reload = function (e) {
        location.reload();
    };

    // 刷新目录缓存数据
    scope.refresh = function (e) {
        viewerJodb.refresh();
        isRefresh = true;
        scope.init('');
        //location.reload();
    };

    // 反转图片列表
    scope.reverse = function (e) {
        //scope.urls.reverse();
        //$list.icRender('list', scope.urls);
        isReverse = !isReverse;
        scope.init('');
    };

    // 按原始顺序排序显示
    scope.toggleOrigin = function (e) {
        isOrigin = $(this).prop('checked');
        scope.init('');
    };

    // 过滤图片是否已经标记
    scope.filterHasTag = function (e) {
        filterByMarked = $(this).prop('checked');
        scope.init('');
    };

    // 按单日分类图片
    function viewByDay () {
        let urls = scope.urls;
        urls.forEach((v, i) => {
            let d = v.d;
            let arr = urlsByDayMap[d] = urlsByDayMap[d] || [];
            arr.push(v);
        });
        scope.render('viewByDay', {model: urlsByDayMap});
    }

    // 点击后显示单日的股票
    scope.viewForDay = function (e, day) {
        scope._init(urlsByDayMap[day]);
    };

    scope.init = function (dir) {
        $.icSetLoading();
        setTimeout(() => {
            scope._init(dir);
            $.icClearLoading();
        }, 40);
    };

    /**
     * 显示目录下图片列表
     * @param dir {Array| String} 图片数组或图片目录路径
     * @returns {Promise<*>}
     * @private
     */
    scope._init = async function (dir) {
        let urls;
        // 如果直接传递一个图片数组
        if (Array.isArray(dir)) {

            urls = dir;
            console.log('urls =>', urls);
            scope.urls = urls;

        } else {

            dir = dir || scope.imgDir;
            scope.imgDir = dir;
            if (!fs.existsSync(dir)) {
                return $.icMsg(`${ dir }\r不存在!`);
            }
            $imgDir.val(dir);

            // 如果是股票交易记录图片，添加交易记录
            let isAddTrade = /交易记录/img.test(dir);

            urls = helper.getImages(dir, {isReverse, isRefresh, isOrigin});
            if (!urls.length) {
                return $.icMsg('no images.');
            }

            // 遍历，绑定交易、标签等数据
            urls.forEach(o => {

                /*               if (isAddTrade) {
                                   let arr = o.tradeInfo = tradeArr.filter(arr => {
                                       // 交易信息 对应 code 和 时间
                                       return o.code === arr[2] && o.d && o.d.replace(/-/g, '') === arr[0];
                                   });
                                   if(arr){
                                       arr = arr.map(a => {
                                           return [a[1], a[4], a[6], a[5]];  // => 时间, 买入/卖出, 数量, 价格
                                       });
                                       arr.reverse(); // 当日多个交易记录按照时间先后显示
                                       o.tradeInfoText = arr.join('\r\n').replace(/,/g, '    ');
                                   }
                               }*/

                // 附加标签信息 和 交易系统信息
                let obj = viewerJodb.get(o.f, 'img')[0] || {tags: [], system: []};
                let arr = obj.tags || [];
                let arr2 = obj.system || [];

                o.tradeInfoText = obj.tradeInfo;

                o.tags = arr.map((v) => {
                    return tagsMap[v];
                });
                o.system = arr2.map((v) => {
                    return systemMap[v];
                });

            });

            console.log('urls =>', urls);
            scope.urls = urls;

            setting.refresh().set('viewer.imgDir', dir);

            // 原始顺序模式下显示日列表
            urlsByDayMap = {}; // 清空上次月份的单日数据
            scope.render('viewByDay', {model: {}});
            isOrigin && viewByDay(); // 按单日分类图片
        }


        // 如果按是否标记对图片进行过滤
        if (filterByMarked) {
            urls = urls.filter( (v,i) => {
                console.log(v);
                return v.system.length || v.tags.length;
            });
        }


        $list.icRender('list', urls);
        $('#countShow').text(`共有 ${ urls.length } 项.`);
    };

    // 图片目录路径选中后回调
    scope.onSelectImgDirDone = (dir) => {
        if (!dir) return;
        scope.imgDir = dir;
        historyModel.add(dir);
        scope.init(dir);
    };

    // 图片剪切测试  fields => {x: 3140, y: 115, width: 310, height: 50}
    // scope.crop = {x: 3140, y: 115, width: 310, height: 50};
    // p2415q => {x: 3100, y: 117, width: 360, height: 50};
    // 328b => {x: 3200, y: 77, width: 190, height: 37};
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
        dir = $(this).data('dir'); // 目录字符里包含 : , 所以没有使用事件参数
        scope.init(dir);
        /*        $.icSetLoading();
                setTimeout(() => {
                    scope.init(dir);
                    $.icClearLoading();
                }, 40);*/
        //$.icClearLoading();
        //$th.icClearLoading();
    };

    // 删除历史目录
    scope.remove = function (e, dir) {
        dir = $(this).data('dir');
        confirm('确认删除?') && historyModel.remove(dir);
    };

    // ------------------------------------------------------------------------------------------------

    historyModel.on('change', () => {
        scope.render('history', {model: {dirs: historyModel.get2(), dir: scope.imgDir}});
        setting.refresh().set('viewer.history', historyModel.get());
    });


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // main 程序入口
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    let imgDir = setting.get('viewer.imgDir');
    scope.imgDir = imgDir;

    historyModel.init(setting.get('viewer.history') || []);

    if (imgDir) {
        scope.init(imgDir);
    }

    scope.viewerVm = setting.get('viewer');
    scope.render('crop', {model: scope.viewerVm || {}}, () => {
        scope.$elm.find('#interval').val(scope.viewerVm.interval);
    });

});


brick.reg('viewerListCtrl', listCtrl);


brick.reg('viewerAttachCtrl', attachCtrl);


brick.reg('viewerMarkTagCtrl', markTagCtrl);
