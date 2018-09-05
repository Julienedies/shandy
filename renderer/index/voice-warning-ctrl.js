/**
 * Created by j on 18/6/16.
 */
const {BrowserWindow} = require('electron');

const bw = require('../../libs/window.js');
const schedule = require('../../libs/schedule.js');

schedule(function createVoiceWarningWindow() {
    bw('voice-warning/index.html');
}, 9, 5);

brick.reg('voice_warning_ctrl', function (scope) {

    scope.open_voice_warning = function () {
        //bw('http://localhost:2018/public/static/html/stock/plan/index/');
        let winCtrl = bw('voice-warning/index.html');
        winCtrl.maximize();
        winCtrl.dev();
    };

    var news_win_ctrl;

    scope.prompt = function () {
        if (news_win_ctrl && news_win_ctrl.win) {
            news_win_ctrl.win.close();
        } else {
            let opt = {
                width: 1600,
                height: 32,
                x: 1530,
                y: 0,
                frame: false,
                hasShadow: false,
                alwaysOnTop:true,
                url: 'http://localhost:3000/news'
            };
            news_win_ctrl = bw(opt);
        }
    };

    scope.ls = function () {
        bw('ls/index.html');
    };


});