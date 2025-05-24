/*!
 * Created by j on 2019-02-22.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'
import { EDIT_TAG, ADD_TAG, ON_SET_TAG_DONE, DEL_TAG, GET_TAGS_DONE, ON_DEL_TAG_DONE } from '../../js/constants'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let types = [];

    // 因为都是通过 setTagCtrl 进行标签添加或修改, setTagCtrl里的标签数据总是最新的
    let tagsManager = brick.services.get('recordManager')();

    window.TAGS_MAP_BY_ID = {};
    window.TAGS_MAP = {};

    function tagsMap2Arr (data) {
        let result = [];
        for (let i in data) {
            let arr= data[i];
            arr.forEach((item) => {
                TAGS_MAP_BY_ID[item.id] = item;
            });
            result = result.concat(arr);
        }
        return result;
    }

    let onGetTagMapDone = (data) => {
        window.TAGS_MAP = data;
        tagsManager.init(tagsMap2Arr(data));
        types = data['type'];
        scope.emit(GET_TAGS_DONE, data);
    };

    $.ajax({
        url: '/stock/tags',
        type: 'get',
    }).done(onGetTagMapDone);

    // tag ajax post one done
    scope.onSetTagDone = function (data) {
        onGetTagMapDone(data);
        $elm.icPopup(false);
        scope.emit(ON_SET_TAG_DONE, data);
    };

    scope.reset = function () {
        scope.render({types});
    };

    /**
     * 修改标签对象
     * @param msg {String|Object}  标签Id 或者 标签对象 或者 是单个标签对象数组 ()
     */
    scope.on(EDIT_TAG, function (e, msg) {
        console.info('on edit tag', e, msg);
        let tagItemVm = msg;
        if (typeof msg === 'number' || typeof msg === 'string') {
            tagItemVm = tagsManager.get2(msg);
        }
        if (Array.isArray(msg)) {
            tagItemVm = msg[0];
        }

        tagItemVm.types = tagItemVm.types || types;
        scope.render({model: tagItemVm});
        $elm.icPopup(true);
    });
    /**
     * 添加标签事件
     * @param msg {Object|String}  含有标签类型的标签对象或标签类型
     */
    scope.on(ADD_TAG, function (e, msg) {
        console.info('on add tag', e, msg);
        let model = msg;
        if (typeof msg === 'string') {
            model = {types, type: msg};
        }
        model.types = model.types || types;
        scope.render({model});
        $elm.icPopup(true);
    });

    /**
     * 要求删除标签事件
     */
    scope.on(DEL_TAG, function (e, id) {
        if(window.confirm('确定删除此标签？')){
            $.ajax({
                url: `/stock/tags/${ id }`,
                method: `delete`,
            }).done((data) => {
                scope.emit(ON_DEL_TAG_DONE, data);
                onGetTagMapDone(data);
            });
        }
    });


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

    /**
     * 上传图片：只在electron端使用
     * @param data {Array} 图片路径数组, 可以是绝对路径或者url
     * @returns {boolean}
     */

    // 图片上传 web端使用，暂时无用，
    /*scope.onUploadDone = function (data) {
        // 获取表单数据model
        let model = $elm.find('[ic-form="setTag"]').icForm();
        model['示例图片'] = model['示例图片'] || [];
        data.forEach((v, i) => {
            model['示例图片'].push(v.url)
        });
        scope.render(model);
    };*/

}
