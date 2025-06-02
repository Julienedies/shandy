/**
 *
 * Created by j on 2020-01-01.
 */

/*import 'babel-polyfill'*/
import $ from 'jquery'

// import ju from '../../../libs/jodb-user'

// function getViewerDb() {
//     return ju('viewer', [], { key: 'img' });
// }



export default function (scope) {

    let $elm = scope.$elm;
    let currentImg = {};  // 当前显示的viewer img对象，由其它控制器emit viewer-mark传入
    let model = null;  // system tags imgObj数据
    let imgObj = {};


    let showTradeInfo = (function () {
        let $TradeInfo = $('#tradeInfo');
        // 因为不同的页面都会调用markTag组件
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


    function render() {
        // 在viewer中有记录的img 或者 第一次添加标签记录的img；
        // viewer.json里并不包含所有img，所以有些图片的交易信息只能在viewer.init里进行绑定；
        let imgPath = currentImg.f;

        if(!imgPath){
            return;
        }

        // let viewerJodb = getViewerDb();
        // imgObj = viewerJodb.get(imgPath, 'img')[0] || {img: imgPath, tradeInfo: currentImg.tradeInfoText};

        // 为了能够同时在浏览器中工作, 改为使用ajax获取数据
        $.ajax({
            url: `/stock/viewer?img=${imgPath}`
        }).done((data) => {
            // 可能是空数组，viewer.json里并不包含没有mark的img
            console.log('markTagCtrl ajax get img viewer info =>', data);
            imgObj = data[0] || { img: imgPath, tradeInfo: currentImg.tradeInfoText };

            //console.log('viewer currentImg=>', imgObj);

            model.img = imgObj;
            showTradeInfo(); // 直接显示交易信息，不用广播事件，在其它地方处理 scope.emit('VIEWER_CURRENT_IMG', imgObj);
            scope.render('viewerTags', { model });

        }).fail((msg) => {
            console.error(msg);
            alert(msg);
        });

    }

    
    // markTagCtrl控制器会独立获取system和tags数据，不附加图片数据
    scope.onGetSystemDone = function (data) {
        console.info('markTagCtrl onGetSystemDone', data);
        model = data;  
        // 首次获取数据render调用无用，但是system更新时有用
        render();
    };

    // 响应其它控制器调用，这里会传进来当前查看的图片
    scope.on('viewer-markTag', function (e, msg) {
        console.log('markTagCtrl on viewer-markTag', msg);
        currentImg = msg;
        render();
    });


    // 当一个图片的tag改变，保存到viewer.json
    scope.onChange = function (val) {
        imgObj[val.name] = val.value;
        console.log('markTagCtrl:onChange', imgObj);

        // let viewerJodb = getViewerDb();
        // viewerJodb.set(imgObj);

        // 如果上传数据的值是空数组[]，则被jquery忽略，所以把[]替换为''或序列化数据为json字符，才能在服务器端覆盖旧值; 服务器端更新数据是通过Object.assign
        $.ajax({
            url: '/stock/viewer',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(imgObj)
        }).done((data) => {
            console.log(data);
        }).fail((msg) => {
            alert(msg);
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


}
