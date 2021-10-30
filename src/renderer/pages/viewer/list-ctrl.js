/**
 *
 * Created by j on 2020-01-01.
 */

import path from 'path'
import $ from 'jquery'
import utils from '../../../libs/utils'
import brick from '@julienedies/brick'

export default function (scope) {

    // ic-viewer  回调函数
    let $viewerAttach = $('#viewerAttach');

    scope.onViewerOpen = () => {
        $viewerAttach.show();
    };
    scope.onViewerClose = () => {
        $viewerAttach.hide();
        scope.emit('viewer-close');
    };

    scope.onViewerShow = function (index, src, $info, isFirstShow) {
        let imgObj = scope.viewerCurrentImg = scope.urls[index]; // scope.urls 继承自mainCtrl
        scope.viewerMarkTag();
        let arr = imgObj.tradeInfo;
        if (arr) {
            arr = arr.map(a => {
                return [a[1], a[4], a[6], a[5]];  // => 时间, 买入/卖出, 数量, 价格
            });
            arr.reverse(); // 当日多个交易记录按照时间先后显示
            let text = arr.join('\r\n').replace(/,/g, '    ');
            $viewerAttach.find('p').text(text);
        }

        $info.text('\r\n' + imgObj.f);

        brick.emit('viewer-markTag', scope.viewerCurrentImg);
        isFirstShow && $('[ic-popup="viewerMarkTag"]').icPopup(true);
    };

    scope.editImg = () => {
        let imgObj = scope.viewerCurrentImg;
        utils.preview(imgObj.f);
    };

    scope.viewItemInFolder = () => {
        utils.showItemInFolder(scope.viewerCurrentImg.f);
    };

    scope.viewInTdx = () => {
        console.log(scope.viewerCurrentImg);
        utils.viewInTdx(scope.viewerCurrentImg.code);
    };

    scope.viewInFtnn = () => {
        utils.viewInFtnn(scope.viewerCurrentImg.code);
    };

    scope.viewerMarkTag = () => {
        brick.emit('viewer-markTag', scope.viewerCurrentImg);
    };

    scope.markMistake = () => {
        copyImageToDist('/Users/j/截图/交易错误/');
    };

    scope.markQuotation = () => {
        copyImageToDist('/Users/j/截图/目标行情/');
    };

    scope.moveToTrash = () => {
        let imgObj = scope.viewerCurrentImg;
        let pathArr = imgObj.f.split(/\\|\//img);
        let fileName = pathArr.pop();
        let dirOfImg = pathArr.join('/')
        let trashPath = path.normalize(`${ dirOfImg }/C/${ fileName }`);
        utils.move(imgObj.f, trashPath)
            .then(() => {
                $.icMessage('ok!');
            })
            .catch(err => {
                utils.err('error, 查看控制台.');
                console.error(err);
            });
    };

    function copyImageToDist (dirPath) {
        let imgObj = scope.viewerCurrentImg;
        let pathArr = imgObj.f.split(/\\|\//img);
        let fileName = pathArr.pop();
        let dirOfImg = pathArr.join('/')
        let distPath = path.normalize(`${ dirPath }/${ dirOfImg }/${ fileName }`);
        utils.copy(imgObj.f, distPath)
            .then(() => {
                $.icMessage('ok!')
            })
            .catch(err => {
                utils.err('error, 查看控制台.')
                console.error(err)
            });
    }

}
