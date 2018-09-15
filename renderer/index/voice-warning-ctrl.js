/**
 * Created by j on 18/6/16.
 */
const {BrowserWindow} = require('electron');
const {dialog} = require('electron').remote;


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

    var news_win;

    scope.news = function () {
        console.info(news_win);
        if (news_win) {
            news_win.close();
            news_win = null;
        } else {
            let opt = {
                width: 1600,
                height: 32,
                x: 1530,
                y: 3,
                //transparent: true,
                opacity: 0.6,
                frame: false,
                hasShadow: false,
                alwaysOnTop:true,
                url: 'http://localhost:3000/news'
            };
            news_win = bw(opt);
            news_win.win.setIgnoreMouseEvents(true);
        }
    };

    scope.view_img = function() {
        let dist = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}, function(filePaths){
            console.info(filePaths);
            let dir = encodeURIComponent(filePaths[0]);
            let url = `view-img/index.html?dir=${dir}`;
            let win = scope.view_img_win;
            if(win && win.win){
                win.load(url);
            }else{
                win = scope.view_img_win = bw({x:1440, url:url});
                win.maximize();
                //win.dev();
            }

        });
    }

});