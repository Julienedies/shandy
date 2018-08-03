/**
 * Created by j on 18/6/13.
 */

const path = require('path');

const electron = require('electron');
const electronScreen = electron.screen;
const BrowserWindow = electron.remote.BrowserWindow;

const config = require('../config.json');

let {sw, sh} = electronScreen.getPrimaryDisplay().workAreaSize;
console.info(sw, sh);

module.exports = function win(opt){
    return new Win(opt);
};

function Win(opt){

    this.opt = {
        //whxy: {width: sw, height: sh, x: 0, y: 0}
        whxy: {width: 1240, height: 820, x: 200, y: 0}
    };

    this.create(opt);

}

Win.prototype = {
    create: function createWindow(opt) {

        let that = this;
        let _opt = this.opt;
        let url;

        if (typeof opt == 'string') {
            url = this.url(opt);
        }

        let win = new BrowserWindow(_opt.whxy);
        win.on('close', function () {
            win = that.win = null;
        });
        win.loadURL(url);
        win.webContents.openDevTools();
        win.maximize();
        win.show();
        this.win = win;
    },
    url: function (url) {
        if(/^(https?)|(file):\/\//.test(url)){
            return url;
        }
        return path.join('file://', config.dir.html_dir, url);
    }
};

