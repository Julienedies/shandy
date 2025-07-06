/*!
 * electron main
 * Created by j on 18/5/21.
 */

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

import fs from 'fs'
import path from 'path'
import electron from 'electron'

import * as remoteMain from '@electron/remote/main';


import config from '../libs/config'

import stockQuery from '../libs/stock-query'
import screenCapture from '../libs/screen-capture'

import ac from '../libs/ac'
import server from '../server/index'

const {app, ipcMain, BrowserWindow, globalShortcut} = electron;

const port = config.SERVER_PORT;


app.SHARED_CONFIG = config;

server.start(port);

remoteMain.initialize();


let mainWindow;

function screenshot(arg) {
        //mainWindow.webContents.send('screenCapture');
        console.log(arg);
        let stock = stockQuery(arg.name);

        screenCapture({
            returnType: "file",
            dir: config.STOCK_IMG_DIR,
            callback: (imgPath) => {
                //kcAudio.play();
                let rename = imgPath
                    .replace("屏幕快照", stock.name)
                    .replace("(2)", `-${stock.name}`)
                    .replace(/[*]ST/gim, "ST")
                    .replace(/\.png$/, `-${stock.code}.png`);
                fs.renameSync(imgPath, rename);
            },
        });
}

// 创建主窗口，一个渲染进程
function createWindow () {

    let windowOptions = {
        width: 1360,
        minWidth: 1360,
        height: 820,
        x: 0,
        y: 0,
        titleBarStyle: 'hidden',
        title: app.getName(),
        webPreferences: {
            webviewTag: true,
            webSecurity: false,
            nodeIntegration: true, // 赋予此窗口页面中的JavaScript访问Node.js环境的能力
            // 官网似乎说是默认false，但是这里必须设置contextIsolation
            contextIsolation: false,
            // 在electron 10.0.0之后，remote模块默认关闭, 不推荐使用
            // 必须手动设置webPreferences中的enableRemoteModule为true之后才能使用
            enableRemoteModule: true,   // 打开remote模块
        }
    };

    mainWindow = new BrowserWindow(windowOptions);

    if (/^file:\/\//.test(config.LOAD_PROTOCOL)) {
        console.log(`file://${ path.resolve(__dirname, './index.html') }`);
        mainWindow.loadURL(`file://${ path.resolve(__dirname, './index.html') }`);
    } else {
        mainWindow.loadURL(`${ config.LOAD_PROTOCOL }/index.html`);
    }
    
    // 启用 #########################################################
    remoteMain.enable(mainWindow.webContents);
     // 启用 #########################################################
    
    mainWindow.webContents.openDevTools()
    mainWindow.maximize();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send('windowId', mainWindow.id);
    });
    
}

//
function ready () {

    createWindow();

    electron.powerMonitor.on('resume', () => {
        let d = new Date();
        let h = d.getHours();
        // 只在早上重启
        if (h > 5 && h < 7) {
            app.relaunch();
            app.exit();
        }
    });

    ipcMain.on('quit', (event, isExit) => {
        isExit && app.quit();
    });

    // 鼠标手势  => 快捷键 =>  apple script获取通达信个股代码  => 在浏览器打开同花顺个股资料页面
    globalShortcut.register('CommandOrControl+Alt+x', function () {
        ac.getStockName(function (stock) {
            mainWindow.webContents.send('view_stock_info', stock);
        });
    });

    // 鼠标手势 => 快捷键 =>  apple script获取通达信个股代码  => 个股资料编辑
    globalShortcut.register('CommandOrControl+Alt+b', function () {
        ac.getStockName(function (stock) {
            mainWindow.webContents.send('set_stock_c', stock);
        });
    });

    // 鼠标手势 => 快捷键 =>  apple script获取通达信个股代码  => 打板封单监控
    globalShortcut.register('CommandOrControl+Alt+z', function () {
        ac.getStockName(function (stock) {
            mainWindow.webContents.send('rts_db_monitor', stock);
        });
    });

    // 鼠标手势 => 快捷键 =>  apple script获取通达信个股代码  => 在富途里显示
    globalShortcut.register('CommandOrControl+Alt+p', function () {
        ac.getStockName(function (stock) {
            mainWindow.webContents.send('view_in_ftnn', stock);
        });
    });



    // 截屏: 快捷键 => 只截大屏幕的图
    globalShortcut.register('CommandOrControl+shift+2', function () {
        screenshot();
    });

/*    // 监听通达信F9买入动作， 会覆盖F9功能，并不起到监控键盘按下的动作
    globalShortcut.register('F9', function () {
        console.log('F9');
        server.io.emit('warn', 'buy');
    });

    // 监听通达信F10卖出动作
    globalShortcut.register('F10', function () {
        console.log('F10');
        server.io.emit('warn', 'sell');
    });*/

    /***************************************************************************************************************************/
    /***************************************************************************************************************************/

    // 查看个股信息: 鼠标手势 =》 http =>  查看个股信息
    server.on('viewStock', function (msg) {
        console.log('打板封单监控', msg);
        mainWindow.webContents.send('view_stock_info', msg);
    });

    // 编辑个股信息
    server.on('set_stock_c', function (msg) {
        let stock = stockQuery(msg.name);
        mainWindow.webContents.send('set_stock_c', stock);
    });

    // 打板封单监控: 通过鼠标手势向server发送打板封单监控
    server.on('rts', function (msg) {
        console.log('打板封单监控', msg);
        mainWindow.webContents.send('rts_db_monitor', msg);
    });

    // 截屏: 通过鼠标手势向server发送截屏请求
    server.on('screenshot', function (msg) {
        console.log('server 要求截屏', msg);
        //mainWindow.webContents.send('screenCapture', msg);
        screenshot(msg);
    });

    // renderer进程 (打板封单监控数据) => socket.io => socket.client (浏览器页面 http://192.168.3.20:3000/)
    ipcMain.on('rts_push', (event, stocks) => {
        server.push(stocks);
    });

    // renderer进程 => 主进程 => socket.io => socket.client
    ipcMain.on('voice_warn', (event, warnText) => {
        server.io.emit('warn', warnText);
    });

    // server会通过http 或socket 接收client端发来的消息, 广播一些事件, 通过server.on订阅
    server.on('warn', function (msg) {
        mainWindow.webContents.send('warn', msg);
    });

    // 浏览器页面 http://192.168.3.20:3000/  => socket.io => 取消个股打板封单监控
    server.on('rts_cancel', function (msg) {
        mainWindow.webContents.send('rts_cancel', msg.code);
    });

    // 淘股吧页面 => chrome扩展 => socket.io => 在通达信显示个股
    server.on('view_in_tdx', function (msg) {
        // 在render进程中执行tdx.view(), 貌似不会因为事件tick迟滞
        mainWindow.webContents.send('view_in_tdx', msg);
    });

    // 淘股吧页面 => chrome扩展 => socket.io => 在富途显示个股
    server.on('view_in_ftnn', function (msg) {
        // 在render进程中执行tdx.view(), 貌似不会因为事件tick迟滞
        mainWindow.webContents.send('view_in_ftnn', msg);
    });

    // 同花顺个股资料页面 => chrome扩展 => socket.io => 激活富途牛牛
    server.on('active_ftnn', function (msg) {
        ac.activeFtnn();
        ac.activeTdx();
    });
}

//#############################################################################
//
app.on('ready', ready);

// ############################################################################
// 不安全， 但这样就能在所有渲染窗口使用require("@electron/remote"); 主要是为了解决 config.js里ROOT_DIR在渲染进程和主进程解析不一样的问题
app.on('web-contents-created', (_, contents) => {
  remoteMain.enable(contents); // 自动为所有窗口启用
});

app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (mainWindow === null) {
        ready();
    }
});

// 在应用退出时，注销快捷键
app.on('will-quit', ()=>{
    globalShortcut.unregisterAll();
});

