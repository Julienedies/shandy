/**
 * Created by j on 18/8/5.
 */

brick.controllers.reg('plans_ctrl', function () {

    var scope = this;
    var $elm = scope.$elm;
    var list = brick.services.get('recordManager')();
    var model = {};

    scope.replay_get_done = function(data){
        console.info(data);
        scope.render('replay', data.replay);
    };

    scope.plan_get_done = function(data){
        console.info(data);
        model = data;
        list.init(data.plans);
        scope.render('plans', data.plans);
    };

    scope.plan_add = function(){
        scope.emit('plan.edit', {plan:{}, tags:model.tags});
    };

    scope.plan_edit = function(e, id){
        let plans = list.get(id);
        scope.emit('plan.edit', {plan:plans[0], tags:model.tags});
    };

    scope.plan_remove_done = function(res){
        $(this).closest('li').remove();
    };

    scope.on('plan.edit.done', function(e, msg){
        $elm.find('#get_plans').click();
        //scope.plan_get_done(msg);
        console.info('on plan.edit.done =>', msg);
    });

    scope.on('tag.edit.done', function(e, data){
        model.tags = data;
    });

});