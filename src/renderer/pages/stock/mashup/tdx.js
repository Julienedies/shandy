/**
 * Created by j on 18/8/13.
 */

brick.reg('main_ctrl', function(){

    var scope = this;
    var model = brick.utils.get_query();

    this.render('ajax', model, function(){
        $(this).find('[ic-ajax]').click();
    });

    this.done = function(data){
        console.info(data);
        scope.render('base', data);
        $(this).remove();
    }

});




brick.reg('ajax_ctrl', function(){






});