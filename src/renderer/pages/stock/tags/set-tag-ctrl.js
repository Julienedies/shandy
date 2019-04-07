/*!
 * Created by j on 2019-02-22.
 */

export default function () {

    let scope = this;
    let $elm = this.$elm;

    // 更新tag on-done
    scope.done = function (data) {
        scope.emit('tag.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    /**
     *
     * @param data {Array} 图片路径数组, 可以是绝对路径或者url
     * @returns {boolean}
     */
    scope.onSelectPathDone = function (data) {
        // 获取表单数据model
        let model = $elm.find('[ic-form="set_tag"]').icForm();
        model['示例图片'] = model['示例图片'] || [];
        data.forEach((path, i) => {
            let url = `/file/?path=${ encodeURIComponent(path) }`
            model['示例图片'].push(url)
        });

        scope.render(model);
        return false;
    };

    scope.onUploadDone = function (data) {
        // 获取表单数据model
        let model = $elm.find('[ic-form="set_tag"]').icForm();

        model['示例图片'] = model['示例图片'] || [];

        data.forEach((v, i) => {
            model['示例图片'].push(v.url)
        });

        scope.render(model);
    };

    // 编辑标签或添加标签
    scope.on('tag.add, tag.edit', function (e, msg) {
        console.info(e, msg);
        let model = msg || {};
        scope.render(model[0] || model);
        $elm.icPopup(true);
    });

}
