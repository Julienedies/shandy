/**
 * Created by j on 18/7/1.
 */

//brick.debug('log',true);

brick.controllers.reg('plans_ctrl', function () {

    var scope = this;
    var $elm = scope.$elm;
    var list = brick.services.get('recordManager')();

    scope.plan = {
        get: {
            done: function (data) {
                console.info(data);
                list.init(data);
                scope.render('plans', data);
            }
        },
        add: function () {
            scope.emit('plan.edit');
        },
        edit: function (e, id) {
            scope.emit('plan.edit', list.get(id));
        },
        remove: function () {
            $(this).closest('li').remove();
        }
    };

    scope.get_replay_done = function(data){
        console.info(data);
        var obj = {};
        for(let i in data){
            let text = data[i].text;
            obj[i] = {text: Array.isArray(text) ? text.join(' , '): text};
        }
        scope.render('replay', obj);
    };


    scope.on('plan.edit.done', function(){
        $elm.find('#get_plans').click();
    });

});

//
brick.reg('set_plan_ctrl', function () {

    var scope = this;
    var $elm = this.$elm;
    var model;

    scope.done = function(){
        $elm.hide();
        scope.emit('plan.edit.done');
    };

    scope.reset = function(){
        scope.render({});
    };

    scope.close = function(){
        $elm.hide();
    };

    scope.on('plan.edit', function (e, msg) {
        model = msg;
        $elm.show();
        msg && scope.render(msg[0] || msg);
    });

    $elm.on('ic-select.change', '[ic-select]', function(e, msg){
        console.log(e, msg);
        $elm.find(`input[name=${msg.name}]`).val(msg.value);
    });

});

