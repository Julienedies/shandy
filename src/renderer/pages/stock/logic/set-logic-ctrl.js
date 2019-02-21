/**
 * Created by j on 18/8/5.
 */

brick.reg('set_logic_ctrl', function(){

    var scope = this;
    var $elm = this.$elm;

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