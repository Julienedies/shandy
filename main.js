/**
 * Created by j on 18/5/21.
 */

const path = require('path');

const electron = require('electron');
const app = electron.app;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

global.AC_DIR = path.join(__dirname, './applescript/');

console.log(global.AC_DIR);

const server = require('./server/server.js');

const ac = require('./libs/ac.js');

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow;

// 创建主窗口，一个渲染进程
function createWindow() {

    var windowOptions = {
        width: 1360,
        minWidth: 1360,
        height: 820,
        x: 0,
        y: 0,
        title: app.getName()
    };

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (true) {
        mainWindow.webContents.openDevTools();
        //mainWindow.maximize();
        //require('devtron').install();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function ready() {

    createWindow();

    globalShortcut.register('CommandOrControl+Alt+x', function () {
        ac.getStockName(function(code){
            mainWindow.webContents.send('stock_code', code);
        });
    });

    globalShortcut.register('CommandOrControl+Alt+z', function () {
        ac.getStockName(function(code){
            mainWindow.webContents.send('real-time-stock', code);
        });
    });

    ipcMain.on('rts-push', (event, arg) => {
        //console.log(arg);
        server.push('rts', arg);
    });

}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', ready);

// 当全部窗口关闭时退出。
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

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。