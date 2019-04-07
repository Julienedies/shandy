/*!
 * Created by j on 2019-02-22.
 */

import brick from '@julienedies/brick'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let types = []

    scope.onGetTagsDone = function (data) {
        let arr = scope.tags_convert(data);
        list.init(arr);
        types = Object.keys(data)
        scope.render(data);
    };

    scope.edit = function (e, id) {
        console.info(id, list.get(id));
        scope.emit('tag.edit', list.get(id));
    };

    scope.add = function (e, type) {
        let vm = {type}
        if (!type) {
            vm.types = types;
        }
        scope.emit('tag.edit', vm);
    };

    scope.remove = function (data) {
        scope.onGetTagsDone(data);
    };

    scope.on('tag.edit.done', function (e, msg) {
        scope.onGetTagsDone(msg);
    });

}
