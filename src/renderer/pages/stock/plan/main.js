/**
 * Created by j on 18/7/1.
 */
import '../../../css/common/common.scss'
import './style.scss'
import './index.html'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

import setTagCtrl from '../../tags/set-tag-ctrl'

brick.set('debug', true)

brick.reg('setTagCtrl', setTagCtrl)

brick.reg('planCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();
    let model = {};

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

brick.reg('set_plan_ctrl', function () {

    let scope = this;
    let $elm = this.$elm;
    let _model = {plan:{}, tags:{}};
    let model = _model;
    let tags = brick.services.get('recordManager')();

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

