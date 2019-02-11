/**
 * Created by j on 18/6/16.
 */

import electron from 'electron'
const {BrowserWindow} = electron;
const {dialog} = electron.remote;

import Win from '../../../util/window.js'
import schedule from '../../../libs/schedule.js'

import brick from '@julienedies/brick'

schedule(function createVoiceWarningWindow() {
    new Win('warn.html');
}, 8, 55);

brick.reg('voice_warning_ctrl', function (scope) {

    scope.open_voice_warning = function () {
        //bw('http://localhost:2018/public/static/html/stock/plan/index/');
        console.log(333,Win.resolve('warn.html'))
        let winCtrl = new Win('warn.html');
        winCtrl.maximize();
        winCtrl.dev();
    };

    scope.get_token = function(){
        require('../../../libs/get-baidu-token.js');
    };

    var news_win;

    scope.news = function () {
        if (news_win) {
            news_win.close();
            news_win = null;
        } else {
            let opt = {
                width: 1400,
                height: 32,
                x: 1600,
                y: 3,
                //width:700,
                //height:200,
                //x:300,
                //y:400,
                opacity: 0.6,
                frame: false,
                hasShadow: false,
                alwaysOnTop:true,
                center:true,
                url: 'http://localhost:3000/news'
            };
            news_win = new Win(opt);
            //news_win.dev();
            news_win.win.setIgnoreMouseEvents(true);
            news_win.win.webContents.on('did-finish-load', function () {
                news_win.win.webContents.send('id', news_win.win.id);
            })
        }
    };

    scope.view_img = function() {
        let dist = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}, function(filePaths){
            console.info(filePaths);
            if(!filePaths) return;
            let dir = encodeURIComponent(filePaths[0]);
            let url = `viewer.html?dir=${dir}`;
            let win = scope.view_img_win;
            if(win && win.win){
                win.load(url);
            }else{
                win = scope.view_img_win = new Win({x:1440, url:url});
                win.maximize();
                win.dev();
            }
        });
    };


});