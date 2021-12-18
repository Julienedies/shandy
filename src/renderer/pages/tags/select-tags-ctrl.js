/**
 *
 * Created by j on 2021/12/17.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'
import { ON_GET_TAGS_DONE, TAG_SELECT_CHANGE, ON_SELECT_TAGS } from '../../js/constants'

export default function () {

    let scope = this;
    let model = {tags: {}, selected: []};

    // tags数据保存在setTagCtrl
    scope.on(ON_GET_TAGS_DONE, function (e, data) {
        //console.log(data);
        model.tags = data;
        render();
    });

    scope.on(ON_SELECT_TAGS, function (e, data) {
        console.log('select tags selected', e, data);
        model.selected = data || [];
        render();
    });

    // tag select change
    scope.onChange = function (data) {
        model.selected = data.value;
        scope.emit(TAG_SELECT_CHANGE, data);
    };

    function render () {
        scope.render('selectTags', {model});
    }

}
