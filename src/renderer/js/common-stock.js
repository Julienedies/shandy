/**
 * Created by j on 18/6/28.
 */

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

    scope.tags_convert = function (data) {
        let arr = [];
        for (let i in data) {
            arr = arr.concat(data[i]);
        }
        return arr;
    };

    scope.tag_add = function (e, type) {
        scope.emit('tag.add', {type: type});
    };

    scope.tag_edit = function (e, id) {
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

}


brick.reg('main_ctrl', mainCtrl);
brick.reg('mainCtrl', mainCtrl)


setTimeout(function () {
    brick.bootstrap()
}, 30)
