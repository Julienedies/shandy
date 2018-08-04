/**
 * Created by j on 18/6/16.
 */

const bw = require('../../libs/window.js');
const schedule = require('../../libs/schedule.js');


schedule(function createVoiceWarningWindow(){
    bw('/voice-warning/index.html');
}, 19, 24);

brick.controllers.reg('voice_warning_ctrl', function(scope){

        let win;
        let createWin = function () {
            let winCtrl = bw('/voice-warning/index.html');
            win = winCtrl.win;
        };
        $('#voiceWarning').on('change', function(){
            if($(this).prop('checked')){
                if(win){
                    win.focus();
                }else{
                    createWin();
                }
            }else{
                win && win.close();
            }
        });

});