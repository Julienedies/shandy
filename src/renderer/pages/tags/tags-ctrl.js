/*!
 * Created by j on 2019-02-22.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let types = [];

    scope.model = {};

    // 临时用来修正数据, 以后应该用不着了
    let fx = (tagMap) => {
        for (let i in tagMap) {
            let arr = tagMap[i];
            console.log(i);
            if (i !== 'type') {
                $.ajax({
                    url: '/stock/tags',
                    type: 'post',
                    dataType: 'json',
                    data: {}
                });
            }
        }
    }

    scope.onGetTagsDone = function (data) {
        scope.model = data;
        console.log('onGetTagsDone =>', data);
        //fx(data);
        let arr = scope.tags_convert(data);
        list.init(arr);
        types = data.type; //Object.keys(data);
        scope.render('tags', data);
    };

    scope.view = function (e, type) {
        let target = e.target;
        console.log(this, target);
        if(target.hasAttribute('ic-ajax')) return false;
        scope.emit('view-details', type);
    };

    scope.edit = function (e, id) {
        let vm = list.get(id);
        vm.parents = scope.model[vm.type];
        vm.types = types;
        scope.emit('tag.edit', vm);
        return false; // 禁止事件冒泡，触发父元素的事件绑定，有用;
    };

    scope.goto = function (e, id, type, text) {
        if (type === 'type') {
            let $target = $(`[tabindex=${ text }]`);
            if($target.length){
                $('html, body').animate({scrollTop: $target.offset().top}, 500);
            }
            return false;
        } else {
            return scope.edit(e, id);
        }
    };

    scope.add = function (e, type) {
        let vm = {type, parents: scope.model[type], types: types};
        scope.emit('tag.edit', vm);
        return false;
    };

    scope.remove = function (data) {
        scope.onGetTagsDone(data);
    };

    scope.on('tag.edit.done', function (e, msg) {
        scope.onGetTagsDone(msg);
    });

}
