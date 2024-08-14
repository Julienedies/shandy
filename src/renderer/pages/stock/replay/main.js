/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/utils'
import '../../../js/common-stock.js'

import setTagCtrl from '../../tags/set-tag-ctrl'
import tagsCtrl from '../../tags/tags-ctrl'
import { GET_TAGS_DONE } from '../../../js/constants'

brick.reg('tagsCtrl', tagsCtrl);

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('replayCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    let list = brick.services.get('recordManager')();
    let model;  // 模型数据， {replay: {}, tags: {}}

    let getReplayDef = $.Deferred();

/*    function getReplay () {
        $.get(`/stock/replay?date=${ formatDate() }`).done(scope.onGetReplayDone);
    }*/

    function getReplay () {
        $.get(`/stock/replay?date=${ formatDate2() }`).done((data) => {
            getReplayDef.resolve(data);
        });
    }

    // 等待标签数据获取后，否则 TAGS_MAP_BY_ID 不存在
    scope.on(GET_TAGS_DONE, function (e, data) {
        $.when(window.GET_TAGS_DEF, getReplayDef).done((d1, d2) => {
            console.log('when', d1, d2);
            data = {tags: d1, replay: d2}
            list.init(scope.tags_convert(d1));
            model = data;
            scope.render('replay', model);
        });
    });

    getReplay();

    scope.onGetReplayDone = function (data) {
        console.info(data);
        //list.init(scope.tags_convert(data.tags));
        //model = data;
        //scope.render('replay', data);
    };

    scope.replay = {
        before: function (fields) {
            console.info(fields);
            return fields;
        },
        done: function (data) {
            scope.onGetReplayDone(data);
            $.icMsg(JSON.stringify(data.replay));
        }
    };

    scope.editTag = function (e, id) {
        scope.emit('tag.edit', list.get(id));
    };

    // 当一个tag被删除
    scope.onTagDelDone = function (data) {
        model.replay = $elm.find('[ic-form="replay"]').icForm();
        model.tags = data;
        scope.onGetReplayDone(model);
    };


    scope.on('tag.edit.done', function (e, msg) {
        console.info(e, msg);
        scope.tag_remove_done(msg);
    });


    $elm.on('ic-select.change', '[ic-select][ic-form-field]', function (e) {
        let $th = $(this)
        let name = $th.attr('ic-form-field')
        model.replay[name] = $th.attr('ic-val')
    });


});
