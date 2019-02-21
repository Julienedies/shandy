/**
 * Created by j on 18/8/5.
 */

import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common.js'

brick.reg('tags_ctrl', function(){

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    scope.on_get_done = function(data){
        let arr = scope.tags_convert(data);
        list.init(arr);
        scope.render(data);
    };

    scope.edit = function(e, id){
        console.info(id, list.get(id));
        scope.emit('tag.edit', list.get(id));
    };

    scope.add = function(e, type){
        scope.emit('tag.edit', {type: type});
    };

    scope.remove = function(data){
        scope.on_get_done(data);
        //$(this).closest('.control').remove();
    };

    scope.on('tag.edit.done', function(e, msg){
        scope.on_get_done(msg);
    });
});

brick.reg('set_tag_ctrl', function () {

    let scope = this;
    let $elm = this.$elm;

    scope.done = function(data){
        scope.emit('tag.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function(){
        scope.render({});
    };

    scope.on('tag.add, tag.edit', function (e, msg) {
        console.info(e, msg);
        let model = msg || {};
        scope.render(model[0] || model);
        $elm.icPopup(true);
    });

});