/**
 * Created by j on 18/6/13.
 */

import path from 'path'
import electron from 'electron'

const electronScreen = electron.screen;
const BrowserWindow = electron.remote.BrowserWindow;

import config from './config.js'

class Win {
    static resolve (url) {
        if (/^\//.test(url)) {
            return url;
        }
        if (/^(https?)|(file):\/\//.test(url)) {
            return url;
        }
        if (/^file:\/\//.test(config.LOAD_PROTOCOL)) {
            return path.join(config.LOAD_PROTOCOL, config.HTML_DIR, url);
        }
        return `${config.LOAD_PROTOCOL}/${url}`
    }

    constructor (opt) {
        if (!this instanceof Win) return new Win(opt)

        let {sw, sh} = electronScreen.getPrimaryDisplay().workAreaSize;
        console.log(sw, sh);

        this.opt = {
            width: 1240,
            height: 820,
            x: 0,
            y: 80,
            webPreferences: {
                webSecurity: false
            }
        };

        if (typeof opt == 'string') {
            opt = {url: opt};
        }

        Object.assign(this.opt, opt);

        this.create();
    }

    create () {
        let that = this;
        let _opt = this.opt;
        let url = _opt.url;

        let win = new BrowserWindow(_opt);
        this.win = win;

        win.on('close', function () {
            that.win = null;
            that.opt.onClose && that.opt.onClose();
        });

        _opt.dev && win.webContents.openDevTools();
        //win.maximize()
        win.show();

        url && this.load(url);
    }

    load (url) {
        url = Win.resolve(url);
        this.win.loadURL(url);
    }

    close () {
        this.win.close();
    }

    maximize () {
        this.win.maximize();
    }

    show (){
        this.win && this.win.show()
    }

    dev () {
        this.win.webContents.openDevTools();
    }
}


export default Win