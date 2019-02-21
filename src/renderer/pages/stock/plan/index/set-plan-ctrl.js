/**
 * Created by j on 18/8/5.
 */

brick.reg('set_plan_ctrl', function () {

    var scope = this;
    var $elm = this.$elm;
    var _model = {plan:{}, tags:{}};
    var model = _model;
    var tags = brick.services.get('recordManager')();

    function update(data){
        tags.init(scope.tags_convert(data));
        model.tags = data;
        model.plan  = $elm.find('[ic-form="plan"]').icForm();
        scope.render(model);
    }

    scope.done = function(){
        $elm.icPopup(false);
        scope.emit('plan.edit.done');
    };

    scope.reset = function(){
        scope.render(_model);
    };

    scope.tag_edit = function(e, id){
        scope.emit('tag.edit', tags.get(id));
    };

    scope.tag_remove_done = update;

    scope.on('plan.edit', function (e, msg) {
        model = msg || _model;
        tags.init(scope.tags_convert(model.tags));
        scope.render(model);
        $elm.icPopup(true);
    });

    scope.on('tag.edit.done', function(e, data){
        update(data);
    });

});