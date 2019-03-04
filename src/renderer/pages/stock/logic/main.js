/**
 * Created by j on 18/7/28.
 */

import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

brick.reg('logics_ctrl', function(){

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    this.get_logic_on_done = function(data){
        list.init(data);
        scope.render('logics', data);
    };

    this.logic = {
        add : function(){
            scope.emit('logic.edit');
        },
        edit : function(e, id){
            scope.emit('logic.edit', list.get(id));
        },
        remove : function(){
            $(this).closest('li').remove();
        }
    };

    scope.on('logic.edit.done', function(){
        $elm.find('#get_logic').click();
    });

});

brick.reg('set_logic_ctrl', function(){

    let scope = this;
    let $elm = this.$elm;

    scope.done = function(){
        scope.emit('logic.edit.done');
        $elm.icPopup(false);
    };

    scope.reset = function(){
        scope.render({});
    };

    scope.on('logic.edit', function(e, msg){
        let logic = msg || {};
        scope.render(logic[0] || logic);
        $elm.icPopup(true);
    });


    scope.on_select_change = function(msg){
        $elm.find('[ic-form-field="type"]').val(msg.value);
    };


});