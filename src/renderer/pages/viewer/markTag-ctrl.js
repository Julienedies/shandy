/**
 *
 * Created by j on 2020-01-01.
 */

import userJodb from '../../../libs/user-jodb'

const viewerJodb = userJodb('viewer');

export default function (scope) {

    let currentImg = {};  // 当前显示的viewer img对象
    let model = null;
    let imgObj = {};

    let render = () => {
        // 在viewer中有记录的img 或者 第一次添加标签记录的img；
        imgObj = viewerJodb.get(currentImg.f, 'img')[0] || {img: currentImg.f};
        console.log(imgObj);
        model.img = imgObj;
        scope.render('viewerTags', {model});
    };

    scope.onGetSystemDone = function (data) {
        console.info(data);
        model = data;
        render();
    };

    scope.hide = function (e) {
        scope.$elm.icPopup(false);
    };

    scope.onChange = function (val) {
        imgObj[val.name] = val.value;
        viewerJodb.set(imgObj);
    };

    scope.on('viewer-markTag', function (e, msg) {
        currentImg = msg;
        console.log(msg);
        render();
    });

    scope.on('viewer-close', function () {
        scope.hide();
    });

    scope.$elm.hover(function () {
        scope.$elm.css('opacity', 1);
    }, function () {
        scope.$elm.css('opacity', 0);
    });

}
