/**
 *
 * Created by j on 2020-01-01.
 */

/*import 'babel-polyfill'*/
import $ from 'jquery'

// import ju from '../../../libs/jodb-user'
//
// function getViewerDb () {
//     return ju('viewer', [], {key: 'img'});
// }


export default function (scope) {

    let $elm = scope.$elm;
    let currentImg = {};  // 当前显示的viewer img对象
    let model = null;
    let imgObj = {};

    let showTradeInfo = (function () {
        let $TradeInfo = $('#tradeInfo');

        if ($TradeInfo.length) {
            return function () {
                let arr = imgObj.tradeInfo || [];

                if (typeof (arr) === 'string') {
                    $TradeInfo.text(arr);
                } else if (arr.length) {
                    let text = arr.join('\r\n').replace(/,/g, '    ');
                    $TradeInfo.text(text);
                } else {
                    $TradeInfo.text('');
                }
            };
        } else {
            return function () {
            };
        }
    })();


    function render () {
        // 在viewer中有记录的img 或者 第一次添加标签记录的img；
        // viewer.json里并不包含所有img，所以有些图片的交易信息只能在viewer.init里进行绑定；
        let imgPath = currentImg.f;
        if (!imgPath) return;

        //let viewerJodb = getViewerDb();
        //imgObj = viewerJodb.get(imgPath, 'img')[0] || {img: imgPath, tradeInfo: currentImg.tradeInfoText};

        // 为了能够同时在浏览器中工作, 改为使用ajax获取数据
        $.ajax({
            url: '/stock/viewer',
            method: 'GET',
            data: {img: imgPath}
        })
            .then(function (response) {
                console.log('成功:', response);
                console.log('viewer currentImg=>', imgObj);
                model.img = imgObj;
            })
            .catch(function (error) {
                console.error('失败:', error);
            });

        showTradeInfo(); // 直接显示交易信息，不用广播事件，在其它地方处理 scope.emit('VIEWER_CURRENT_IMG', imgObj);
        scope.render('viewerTags', {model});
    }


    scope.on('viewer-markTag', function (e, msg) {
        console.log('on viewer-markTag', msg);
        currentImg = msg;
        render();
    });

    // 这个回调是只处理markTag页面的getSystem Ajax
    scope.onGetSystemDone = function (data) {
        console.info('onGetSystemDone', data);
        model = data;
        render();
    };

    // 当一个图片的tag或system 标签修改
    scope.onChange = function (val) {
        imgObj[val.name] = val.value;
        console.log('markTag:onChange', imgObj);

        // let viewerJodb = getViewerDb();
        // viewerJodb.set(imgObj);

        $.ajax({
            url: '/stock/viewer',
            method: 'POST',
            data: imgObj,
        })
            .then(function (response) {
                console.log('成功:', response);
            })
            .catch(function (error) {
                console.error('失败:', error);
            });

    };


    scope.hide = function (e) {
        scope.$elm.icPopup(false);
    };

    scope.on('viewer-close', function () {
        scope.hide();
    });


    scope.toggleScrollMode = function (e) {
        let cla = 'is-primary';
        let cla2 = 'scrollMode';
        let $th = $(this);
        $th.toggleClass(cla);
        if ($th.hasClass(cla)) {
            $elm.addClass(cla2);
            $elm.on('mousewheel', function (e) {
                e.stopPropagation();
            });
        } else {
            $elm.off('mousewheel');
            $elm.removeClass(cla2);
        }
    };

    scope.toggleWh = function (e) {
        $elm.toggleClass('horizontal');
    };

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


}
