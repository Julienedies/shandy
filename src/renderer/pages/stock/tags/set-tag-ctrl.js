/*!
 * Created by j on 2019-02-22.
 */

export default function () {

    let scope = this;
    let $elm = scope.$elm;

    // tag ajax post one done
    scope.done = function (data) {
        $elm.icPopup(false);
        scope.emit('tag.edit.done', data);
    };

    scope.reset = function () {
        scope.render({});
    };

    /**
     * 上传图片：只在electron端使用
     * @param data {Array} 图片路径数组, 可以是绝对路径或者url
     * @returns {boolean}
     */
    scope.onSelectPathDone = function (data) {
        // 获取表单数据model
        let model = $elm.find('[ic-form="setTag"]').icForm();
        model['示例图片'] = model['示例图片'] || [];
        data.forEach((path, i) => {
            //let url = `/file/?path=${ encodeURIComponent(path) }`
            model['示例图片'].unshift(path)
        });
        scope.render(model);
        return false;
    };

    // 图片上传 web端使用，暂时无用，
    /*scope.onUploadDone = function (data) {
        // 获取表单数据model
        let model = $elm.find('[ic-form="set_tag"]').icForm();

        model['示例图片'] = model['示例图片'] || [];

        data.forEach((v, i) => {
            model['示例图片'].push(v.url)
        });

        scope.render(model);
    };*/

    // 编辑标签或添加标签
    scope.on('tag.add, tag.edit', function (e, msg) {
        console.info(e, msg);
        let vm = msg || {};  // vm是标签对象
        scope.render(vm[0] || vm);
        $elm.icPopup(true);
    });

}
