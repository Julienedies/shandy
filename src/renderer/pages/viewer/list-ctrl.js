/**
 *
 * Created by j on 2020-01-01.
 */

import $ from 'jquery'
import utils from '../../../libs/utils'
import brick from '@julienedies/brick'

export default function (scope) {

    // ic-viewer  回调函数
    let $viewerAttach = $('#viewerAttach');
    let $TradeInfo = $('#tradeInfo');


    scope.onViewerOpen = () => {
        $viewerAttach.show();
    };

    scope.onViewerClose = () => {
        $viewerAttach.hide();
        scope.emit('viewer-close');
    };


    scope.onViewerShow = function (index, src, $info, isFirstShow) {

        let imgObj = scope.viewerCurrentImg = scope.urls[index]; // scope.urls 继承自mainCtrl

       // $TradeInfo.text(imgObj.tradeInfoText); // 统一移到markTagCtrl里处理

        $info.text('\r\n' + imgObj.f);

        brick.emit('viewer-markTag', imgObj);
        isFirstShow && $('[ic-popup="viewerMarkTag"]').icPopup(true);

    };


}
