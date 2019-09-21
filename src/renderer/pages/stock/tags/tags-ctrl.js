/*!
 * Created by j on 2019-02-22.
 */

import brick from '@julienedies/brick'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let types = [];

    scope.model = {};

    scope.onGetTagsDone = function (data) {
        scope.model = data;
        let arr = scope.tags_convert(data);
        list.init(arr);
        types = Object.keys(data);
        scope.render('tags', data);
    };

    scope.view = function (e, type) {
        scope.emit('view-details', type);
    };

    scope.edit = function (e, id) {
        let vm = list.get(id)[0];
        vm.parents = scope.model[vm.type];
        scope.emit('tag.edit', vm);
        return false; // 禁止事件冒泡，触发父元素的事件绑定，有用;
    };

    scope.add = function (e, type) {
        let vm = {type, parents: scope.model[type]};
        if (!type) {
            vm.types = types;
        }
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
