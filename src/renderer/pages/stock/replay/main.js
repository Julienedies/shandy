/**
 * Created by j on 18/7/28.
 */

brick.reg('replay_ctrl', function () {

    var scope = this;
    var $elm = this.$elm;

    var list = brick.services.get('recordManager')();
    var model;

    scope.get_replay_done = function (data) {
        console.info(data);
        list.init(scope.tags_convert(data.tags));
        model = data;
        scope.render('replay', data);
    };


    scope.replay = {
        before: function (fields){
            console.info(fields);
            return fields;
        },
        done: function(msg){
            scope.get_replay_done(msg);
        }
    };


    scope.tag_edit = function(e, id){
        scope.emit('tag.edit', list.get(id));
    };

    scope.tag_remove_done = function(data){
        model.tags = data;
        scope.get_replay_done(model);
    };


    scope.on('tag.edit.done', function(e, msg){
        console.info(e, msg);
        scope.tag_remove_done(msg);
    });

});