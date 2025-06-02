/*!
 * Created by j on 2019-02-22.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'
import { EDIT_TAG, ADD_TAG, DEL_TAG, GET_TAGS_DONE, TAGS_CHANGE, SET_TAG_DONE, DEL_TAG_DONE } from '../../js/constants'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let types = [];  // tag type 数组

    // 因为都是通过 setTagCtrl 进行标签添加或修改, setTagCtrl里的标签数据总是最新的
    let tagsManager = brick.services.get('recordManager')();

    window.TAGS_MAP_BY_ID = {}; // 以tag id 为 key
    window.TAGS_MAP_BY_TEXT = {};
    window.TAGS_MAP = {};  // 以type tag的id为key
    window.GET_TAGS_DEF = window.GET_TAGS_DEF || $.Deferred();

    // 把tagsMap 转成数组 [tag, tag, tag]
    function tagsMap2Arr(data) {
        let result = [];
        for (let i in data) {
            let arr = data[i];
            arr.forEach((item) => {
                TAGS_MAP_BY_ID[item.id] = item;
                TAGS_MAP_BY_TEXT[item.text] = item;
            });
            result = result.concat(arr);
        }
        return result;
    }

    // ajax 获取 tagsMap数据
    function getTagsMapByAjax() {
        $.ajax({
            url: '/stock/tags',
            type: 'get',
        }).done(onGetTagMapDone);
    }

    //
    function render(model) {
        model.types = model.types || types;
        scope.render({ model });
        $elm.icPopup(true);
    }

    // 更新tag数据
    function updateData(data) {
        window.TAGS_MAP = data;
        types = data['type'];
        tagsManager.init(tagsMap2Arr(data));
    }

    // 当从服务器获取到tagsMap数据
    function onGetTagMapDone(data) {
        updateData(data);
        window.GET_TAGS_DEF.resolve(data);
        scope.emit(GET_TAGS_DONE, data);
    }

    // tag ajax post one done
    scope.onSetTagDone = function (data) {
        updateData(data);
        $elm.icPopup(false);
        scope.emit(SET_TAG_DONE, data);
        scope.emit(TAGS_CHANGE, data);
    };

    // 重置setTag表单
    scope.reset = function () {
        scope.render({ types });
    };

    // 主要是处理electron里修改了数据， web 页面需要刷新数据；目前好像没有用到
    //scope.on(TAGS_CHANGE, getTagsMapByAjax);

    /**
     * 其它ctrl发消息要求删除某个tag
     * @param id {String} tag id
     */
    scope.on(DEL_TAG, function (e, id) {
        if (window.confirm('确定删除此标签？')) {
            $.ajax({
                url: `/stock/tags/${id}`,
                method: `delete`,
            }).done((data) => {
                updateData(data);
                scope.emit(DEL_TAG_DONE, data);
                scope.emit(TAGS_CHANGE, data);
            });
        }
    });

    /**
     * 有控制器发消息要修改某个tag
     * @param msg {String|Object}  标签Id 或者 标签对象 或者 是单个标签对象数组 ()
     */
    scope.on(EDIT_TAG, function (e, msg) {
        console.info('on edit tag', e, msg);
        let model = msg;
        if (typeof msg === 'number' || typeof msg === 'string') {
            model = tagsManager.get2(msg);
        }
        if (Array.isArray(msg)) {
            model = msg[0];
        }

        render(model);
    });

    /**
     * 其它控制器发消息要添加标签
     * @param msg {Object|String}  含有标签类型的标签对象或标签类型
     */
    scope.on(ADD_TAG, function (e, msg) {
        console.info('on add tag', e, msg);
        let model = msg;
        if (typeof msg === 'string') {
            model = { type: msg };
        }
        render(model);
    });


    /**
     *
     * @param data
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


    // main
    getTagsMapByAjax();

}
