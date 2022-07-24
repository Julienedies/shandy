/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common-stock.js'

brick.set('debug', false);
brick.set('ic-select-cla', 'is-info');
brick.set('render.wrapModel', true);

brick.reg('notesCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    scope.tagMap = {};
    scope.tag = '';

    let render = () => {
        let tag = scope.tag;
        let vm = tag ? list.get(tag, 'type') : list.get();
        scope.render('notes', vm);
    };

    scope.onGetNoteDone = function (data) {
        list.init(data);
        let tags = data.map((item, index) => {
            return item.tag || item.type;
        });
        let tagMap = _.countBy(tags);
        scope.tagMap = tagMap;
        console.log(tagMap);
        scope.render('tags', scope);
        render();
    };

    scope.onTagFilterChange = function (msg) {
        scope.tag = msg.value;
        render();
    };

    this.note = {
        edit: function (e, id) {
            let vm = id ? list.get(id) : {};
            vm.tags = scope.tagMap;
            scope.emit('note.edit', vm);
        },
        removed: function (data) {
            scope.onGetNoteDone(data);
        },
    };

    scope.on('note.edit.done', function (e, data) {
        scope.onGetNoteDone(data);
    });

});


brick.reg('setNoteCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    scope.done = function (data) {
        scope.emit('note.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        scope.render({});
    };

    scope.on('note.edit', function (e, note) {
        scope.render(note);
        $elm.icPopup(true);
    });


    scope.onSelectChange = function (msg) {
        $elm.find('[ic-form-field="type"]').val(msg.value);
    };


});

