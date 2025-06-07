/*!
 * Created by j on 2019-02-22.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'

import { SET_TAG, SET_TAG_DONE } from '../../js/constants'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let types = [];

    scope.model = {};

    // 当获取到最新的tags数据， 这里的data是tagsMap
    scope.onGetTagsDone = function (data) {
        scope.model = data;
        console.log('onGetTagsDone =>', data);
        let arr = scope.tagsMap2Arr(data);
        list.init(arr);
        types = data.type; //Object.keys(data);
        scope.render('tags', data);
    };


    // 查看某类标签的细节
    scope.view = function (e, type) {
        let target = e.target;
        console.log(this, target);
        if (target.hasAttribute('ic-ajax')) return false;
        scope.emit('view-details', type);
    };


    // 点击type标签后把页面滚动到对应的标签组
    scope.goto = function (e, id, type, text) {
        if (type === 'type') {
            let $target = $(`[tabindex=${text}]`);
            if ($target.length) {
                $('html, body').animate({ scrollTop: $target.offset().top }, 500);
            }
            return false;
        } else {
            return scope.editTag(e, id);
        }
    };


    // 添加标签
    scope.addTag = function (e, type) {
        let vm = { type, parents: scope.model[type], types: types };
        scope.emit(SET_TAG, vm);
        return false;
    };


    // 编辑某个tag
    scope.editTag = function (e, id) {
        let vm = list.get(id);
        vm.parents = scope.model[vm.type];
        vm.types = types;
        scope.emit(SET_TAG, vm);
        return false; // 禁止事件冒泡，触发父元素的事件绑定，有用;
    };


    // 标签被修改之后的回调函数
    scope.on(SET_TAG_DONE, function (e, msg) {
        scope.onGetTagsDone(msg);
    });


    // 标签被删除后的回调函数
    scope.onDelTagDone = function (data) {
        scope.onGetTagsDone(data);
    };


}
