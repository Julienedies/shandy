/**
 * Created by j on 18/6/28.
 */

import utils from '../../libs/e-bridge'

import $ from 'jquery'
import brick from '@julienedies/brick'

brick.set('ic-show-img-item', 'a[href$=png]');
brick.set('ic-show-img-url', 'href');

brick.set('ic-select-cla', 'is-warning');

brick.set('cla.error', 'is-danger');

brick.debug('log');

//brick.set('debug', true);

brick.set('render.wrapModel', true);

function mainCtrl () {

    let scope = this;
    let $elm = scope.$elm;

    scope.tagsMap2Arr = scope.tags_convert = function (data) {
        let arr = [];
        for (let i in data) {
            arr = arr.concat(data[i]);
        }
        return arr;
    };

    scope.addTag = scope.tag_add = function (e, type) {
        scope.emit('tag.add', {type});
    };

    scope.editTag = scope.tag_edit = function (e, id) {
        scope.emit('tag.edit', id);
    };

    scope.tag_remove_done = function (res) {
        $(this).closest('li').remove();
    };

    scope.before = function (f) {
        console.info('ic-form-submit-before => ', f);
    };

    this.ajax_before_confirm = function (data, msg) {
        //console.info([].slice.call(arguments));
        return confirm(data || msg);
    };

    $elm.on('ic-form.error', function (e, msg) {
        console.info(msg);
    });


    // ic-viewer 功能
    let $viewerAttach = $('#viewerAttach');
    // ic-viewer  回调函数
    scope.onViewerOpen = () => {
        $viewerAttach.show();
    };
    scope.onViewerClose = () => {
        $viewerAttach.hide();
        scope.emit('viewer-close');
    };

    scope.onViewerShow = function (index, src, $info) {
        let arr = src.split('=');
        src = arr[1] || arr[0];
        scope.viewerCurrentImg = {f: src};
        scope.viewerMarkTag();
        $info.text(src);
    };

    scope.editImg = () => {
        utils.preview(scope.viewerCurrentImg.f);
    };

    scope.viewItemInFolder = () => {
        utils.showItemInFolder(scope.viewerCurrentImg.f);
    };

    scope.viewInTdx = () => {
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
        let pathArr = imgObj.f.split('/');
        let fileName = pathArr.pop();
        let dirOfImg = pathArr.join('/')
        utils.move(imgObj.f, `${ dirOfImg }/C/${ fileName }`)
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
        let fileName = imgObj.f.split('/').pop();
        utils.copy(imgObj.f, `${ dirPath }${ fileName }`)
            .then(() => {
                $.icMessage('ok!')
            })
            .catch(err => {
                utils.err('error, 查看控制台.')
                console.error(err)
            });
    }

}

brick.reg('main_ctrl', mainCtrl);
brick.reg('mainCtrl', mainCtrl);


setTimeout(function () {
    brick.bootstrap();
}, 30);
