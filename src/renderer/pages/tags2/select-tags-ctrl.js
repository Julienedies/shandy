/**
 * 标签选择器
 * Created by j on 2021/12/17.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'
import { GET_TAGS_DONE, TAG_SELECT_CHANGE, READY_SELECT_TAGS, TAGS_CHANGE } from '../../js/constants'

export default function () {

    let scope = this;
    let model = {tags: {}, selected: []};

    // tags数据保存在setTagCtrl
    scope.on(`${GET_TAGS_DONE}, ${TAGS_CHANGE}`, function (e, data) {
        model.tags = data;  // 保持最新的tags数据
        render();
    });


    // 准备选择标签事件
    scope.on(READY_SELECT_TAGS, function (e, data) {
        model.selected = data || [];  // data => rp.options数据
        render();
    });

    // tag select change
    scope.onChange = function (data) {
        model.selected = data.value;
        scope.emit(TAG_SELECT_CHANGE, data);
    };

    //
    function render () {
        scope.render('selectTags', {model});
    }

}
