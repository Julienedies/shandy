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

    scope.onUploadDone = function (data){
        console.info(333, data)
        let model = $elm.find('[ic-form="set_tag"]').icForm();
        model['示例图片'] = model['示例图片'] || []
        console.log(111, model)
        data.forEach((v, i) => [
            model['示例图片'].push(v.url)
        ])
        scope.render(model)
    }

    scope.on('tag.add, tag.edit', function (e, msg) {
        console.info(e, msg);
        let model = msg || {};
        scope.render(model[0] || model);
        $elm.icPopup(true);
    });

}
