/**
 *
 * Created by j on 2020-01-01.
 */

/*import 'babel-polyfill'*/
import $ from 'jquery'

import userJodb from '../../../libs/user-jodb'

const viewerJodb = userJodb('viewer');

export default function (scope) {

    let $elm = scope.$elm;
    let currentImg = {};  // 当前显示的viewer img对象
    let model = null;
    let imgObj = {};

    function render () {
        // 在viewer中有记录的img 或者 第一次添加标签记录的img；
        let imgPath = currentImg.f;
        // 为了能够同时在浏览器中工作, 改为使用ajax获取数据
        imgObj = viewerJodb.get(imgPath, 'img')[0] || {img: imgPath};
/*        imgObj = await $.ajax({
            url: `/stock/viewer?img=${ imgPath }`
        });
        if (!imgObj[0]) {
            imgObj = {img: imgPath};
        }*/
        //console.log(imgObj);
        model.img = imgObj;
        scope.render('viewerTags', {model});
    }

    scope.onGetSystemDone = function (data) {
        console.info(data);
        model = data;
        render();
    };


    scope.onChange = function (val) {
        imgObj[val.name] = val.value;
/*        $.ajax({
            type: 'post',
            url: '/stock/viewer',
            data: imgObj
        });*/
        viewerJodb.set(imgObj);
    };

    scope.on('viewer-markTag', function (e, msg) {
        currentImg = msg;
        //console.log(msg);
        render();
    });

    scope.hide = function (e) {
        scope.$elm.icPopup(false);
    };

    scope.on('viewer-close', function () {
        scope.hide();
    });

    $elm.hover(function () {
        //scope.$elm.find('.tag, .button').css('opacity', 1);
        //scope.$elm.css('background', '');
    }, function () {
        //scope.$elm.css('opacity', 0);
        //scope.$elm.css('cssText', 'background:none!important;');
        //scope.$elm.find('.tag, .button').not('.tag.is-info').css('opacity', 0);
        //scope.$elm.find('.tag.is-info').css('opacity', 1);
    });

/*    $elm.on('mousewheel', function(e) {
        e.stopPropagation();
        //return false;
    });*/

    scope.toggleScrollMode = function (e) {
        let cla = 'is-primary';
        let $th = $(this);
        $th.toggleClass(cla);
        if ($th.hasClass(cla)) {
            $elm.on('mousewheel', function (e) {
                e.stopPropagation();
            });
        } else {
            $elm.off('mousewheel');
        }
    };

}
