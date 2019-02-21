/**
 * Created by j on 18/7/28.
 */

import './style.scss'
import './index.html'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

brick.set('render.wrapModel', true)

brick.reg('notes_ctrl', function(){

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    scope.get_notes_on_done = function(data){
        list.init(data);
        scope.render('notes', data);
    };

    this.note = {
        add : function(){
            scope.emit('note.edit');
        },
        edit : function(e, id){
            scope.emit('note.edit', list.get(id));
        },
        removed : function(data){
            scope.get_notes_on_done(data);
        }
    };

    scope.on('note.edit.done', function(e, data){
        scope.get_notes_on_done(data);
    });

});

brick.reg('set_note_ctrl', function(){

    let scope = this;
    let $elm = this.$elm;

    scope.done = function(data){
        scope.emit('note.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function(){
        scope.render({});
    };

    scope.on('note.edit', function(e, msg){
        let note = msg || {};
        scope.render(note[0] || note);
        $elm.icPopup(true);
    });


    scope.on_select_change = function(msg){
        $elm.find('[ic-form-field="type"]').val(msg.value);
    };


});

