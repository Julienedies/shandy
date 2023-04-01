/**
 * Created by j on 18/6/13.
 */

import path from 'path'
import electron from 'electron'

import setting from './setting.js'
import config from './config.js'

const BrowserWindow = electron.remote.BrowserWindow;


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
        return `${ config.LOAD_PROTOCOL }/${ url }`
    }


    constructor (opt) {
        if (!this instanceof Win) return new Win(opt);

        this.win = null;

        this.opt = {
            x: 0,
            y: 0,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true, // 赋予此窗口页面中的JavaScript访问Node.js环境的能力
                // 官网似乎说是默认false，但是这里必须设置contextIsolation
                contextIsolation: false,
                // 在electron 10.0.0之后，remote模块默认关闭, 不推荐使用
                // 必须手动设置webPreferences中的enableRemoteModule为true之后才能使用
                enableRemoteModule: true,   // 打开remote模块
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
        let url = this.opt.url;

        let win = new BrowserWindow(this.opt);

        this.win = win;

        win.on('close', function () {
            that.onClose();
            that.opt.onClose && that.opt.onClose();
            that.win = null;
        });

        // 如果窗口有name, 则保存window bounds信息
        if(this.opt.name) {
            win.on('resize', () => {
                this.saveBounds();
            });

            win.on('move', () => {
                this.saveBounds();
            });
        }

        this.opt.dev && win.webContents.openDevTools();

        url && this.load(url);

        if(this.opt.show !== false) {
            win.show();
        }
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

    show () {
        this.win && this.win.show()
    }

    dev () {
        this.win.webContents.openDevTools();
    }

    onClose ( ){

    }

    getWindowName () {
        return this.opt.name;
    }

    saveBounds () {
        let name = this.getWindowName();
        let bounds = this.win.getBounds();
        if (name && name !== 'X-news') {
            setting.refresh().set(`${ name }.bounds`, bounds);
        }
    }
}


export default Win;
