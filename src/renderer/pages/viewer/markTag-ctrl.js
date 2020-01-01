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
        // 在viewer页面和其它页面, on viewer-markTag 事件时传递的viewerImgObj不同,有的只有文件路径一个属性
        imgObj = currentImg.id ? currentImg : viewerJodb.get(currentImg.f, 'img')[0];
        console.log(JSON.stringify(imgObj, null, '\t'));
        let f = (imgObj) => {
            return imgObj;
        };
        model.img = f(imgObj);
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

    scope.$elm.hover(function () {
        scope.$elm.css('opacity', 1);
    }, function () {
        scope.$elm.css('opacity', 0);
    });

}
