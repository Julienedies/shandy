/**
 * Created by j on 18/6/16.
 */

const bw = require('../../libs/window.js');
const schedule = require('../../libs/schedule.js');

schedule(function createVoiceWarningWindow(){
    bw('voice-warning/index.html');
}, 9, 5);

brick.controllers.reg('voice_warning_ctrl', function(scope){

    scope.open_voice_warning = function () {
        //bw('http://localhost:2018/public/static/html/stock/plan/index/');
        let winCtrl = bw('voice-warning/index.html');
    };

    scope.ls = function(){
        bw('ls/index.html');
    };




});