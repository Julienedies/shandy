/**
 * Created by j on 18/6/13.
 */

const path = require('path');

const electron = require('electron');
const electronScreen = electron.screen;
const BrowserWindow = electron.remote.BrowserWindow;

const config = require('../config.json');

let {sw, sh} = electronScreen.getPrimaryDisplay().workAreaSize;
//console.info(sw, sh);


function Win(opt){

    this.opt = {width: 1240, height: 820, x: 200, y: 0};

    if(typeof opt == 'string'){
        opt = {url: opt};
    }

    Object.assign(this.opt, opt);

    this.create();

}

Win.prototype = {
    create: function createWindow() {

        let that = this;
        let _opt = this.opt;
        let url = _opt.url;

        let win = new BrowserWindow(_opt);
        this.win = win;

        win.on('close', function () {
            win = that.win = null;
        });

        //win.webContents.openDevTools();
        //win.maximize()
        win.show();

        url && this.load(url);
    },
    load: function(url){
        url = this._url(url);
        this.win.loadURL(url);
    },
    _url: function (url) {
        if(/^\//.test(url)){
            return url;
        }
        if(/^(https?)|(file):\/\//.test(url)){
            return url;
        }
        return path.join('file://', config.dir.html_dir, url);
    },
    close: function(){
        this.win.close();
    },
    maximize: function(){
        this.win.maximize();
    },
    dev: function(){
        this.win.openDevTools();
    }
};


module.exports = function win(opt){
    return new Win(opt);
};