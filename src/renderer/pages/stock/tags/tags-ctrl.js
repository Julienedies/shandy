/*!
 * Created by j on 2019-02-22.
 */

import brick from '@julienedies/brick'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    scope.onGetTagsDone = function (data) {
        let arr = scope.tags_convert(data);
        list.init(arr);
        scope.render(data);
    };

    scope.edit = function (e, id) {
        console.info(id, list.get(id));
        scope.emit('tag.edit', list.get(id));
    };

    scope.add = function (e, type) {
        scope.emit('tag.edit', {type: type});
    };

    scope.remove = function (data) {
        scope.onGetTagsDone(data);
    };

    scope.on('tag.edit.done', function (e, msg) {
        scope.onGetTagsDone(msg);
    });

}
