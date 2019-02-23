/*!
 * Created by j on 2019-02-22.
 */

export default function () {

    let scope = this;
    let $elm = this.$elm;

    scope.done = function (data) {
        scope.emit('tag.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    scope.on('tag.add, tag.edit', function (e, msg) {
        console.info(e, msg);
        let model = msg || {};
        scope.render(model[0] || model);
        $elm.icPopup(true);
    });

}