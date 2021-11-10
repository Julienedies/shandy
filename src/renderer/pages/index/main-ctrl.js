/**
 * Created by j on 18/8/21.
 */

import electron from 'electron'

import $ from 'jquery'
import brick from '@julienedies/brick'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'

import utils from '../../../libs/utils'
import setting from '../../../libs/setting'
import Win from '../../../libs/window'
import voice from '../../../libs/voice'
import ac from '../../../libs/ac'
import captureOcr from '../../../libs/capture-ocr'
import rts from '../../../libs/real-time-stock'
import userJodb from '../../../libs/user-jodb'

import parentCtrl from '../../js/parentCtrl'
import setTagCtrl from '../tags/set-tag-ctrl'
import setVoiceWarnCtrl from './set-voice-warn-ctrl'

import { COLORS_BACKGROUND } from '../../js/constants'

import viewsModel from './viewsModel'

const {ipcRenderer} = electron;
let mainWindowId;

ipcRenderer.on('windowId', function (event, windowId) {
    console.log('mainWindow.id', windowId);
    mainWindowId = windowId;
});

brick.services.reg('viewsModel', viewsModel);

brick.reg('mainCtrl', function (scope) {

    let $elm = this.$elm;

    let $viewsWrapper = $('#viewsWrapper');
    let $indexView = $('#indexView');
    let $viewTabs = $('#viewTabs');
    let $views = $('#views');

    const viewsModel = brick.services.get('viewsModel');

    let render = () => {
        let list = viewsModel.get();
        $viewTabs.icRender({model: list});
        if (!list.length) {
            //scope.showIndex();
        }
    };

    function _show (item) {
        if (viewsModel.has(item)) {
            viewsModel.active(item);
        } else {
            if (/.+\.html$/img.test(item.url)) {
                item.$webView = $(`<webview src="${ item.url }" nodeintegration style="height: 100%; "></webview>`).appendTo($views);
            } else {
                item.$webView = $(`${ item.url }`).appendTo($views);
            }
            viewsModel.add(item);
        }
        $viewsWrapper.show();
        //$indexView.hide();
        render();
    }

    // 显示标签视图
    this.showTab = function (e, url) {
        let $th = $(this);
        let title = $th.text().trim() || $th.attr('aria-label') || $th.attr('title') || '无题';
        let item = {title, url};
        console.log(item);
        _show(item);
    };

    this.closeTab = function (e, url) {
        viewsModel.remove({url});
        render();
        return false;
    };

    this.activeTab = (e, url) => {
        viewsModel.active({url});
        render();
    };

    this.showIndex = function (e, url) {
        $indexView.show();
        $viewsWrapper.hide();
    };


    // ------------------------------------------------------------------------------------------
    // 默认显示实时监控和语言警告两个标签
    _show({url: '#indexView', title: '股票实时监控'});
    _show({url: '#setVoiceWarnCtrl', title: '语言警告'});
    //_show({url: 'system.html', title: '系统'});
    //_show({url: 'tags.html', title: '标签'});
    // -------------------------------------------------------------------------------------------

    function getBounds (name) {
        return setting.get(`${ name }.bounds`) || {};
    }

    this.openByWindow = function (e, url) {
        let name = url.match(/([^/]+)\.html$/)[1];
        new Win({
            url,
            name,
            ...getBounds(name)
        });
    };

    scope.openWindow = function (e, name) {
        let windowKey = `${ name }Window`;
        let win = scope[windowKey];
        if (win) {
            win.show();
        } else {
            let url = `${ name }.html`;
            scope[windowKey] = new Win({
                name,
                url,
                x: 160,
                y: 80,
                ...getBounds(name),
                onClose: () => {
                    delete scope[windowKey];
                }
            });
        }
    };

    // -------------------------------------------------------------------------------------------

    scope.openNews = function () {
        let newsWin = scope.newsWin;
        if (newsWin) {
            newsWin.close();
        } else {
            let name = 'news';
            let url = 'news.html';
            let opt = {
                name,
                url,
                width: 600,
                height: 64,
                x: 60,
                ...getBounds(name),
                titleBarStyle: 'hiddenInset',
                transparent: true,
                // frame: false,
                hasShadow: false,
                alwaysOnTop: true,
                onClose: () => {
                    delete scope.newsWin;
                }
            }
            newsWin = scope.newsWin = new Win(opt);
            newsWin.win.webContents.on('did-finish-load', function () {
                newsWin.win.webContents.send('id', newsWin.win.id);
            });
            setTimeout(() => {
                newsWin.win.setIgnoreMouseEvents(true);
            }, 1000 * 60 * 1.1);
        }
    };

    scope.openWarn = function (e, ignore) {
        let warnWindow = scope.warnWindow;
        if (warnWindow) {
            return warnWindow.close();
        } else {
            let name = 'warn';
            let url = 'warn.html';
            let opt = {
                name,
                url,
                width: 530,
                height: 320,
                x: 2150,
                y: 220,
                ...getBounds(name),
                //transparent: true,
                //titleBarStyle: 'hidden',
                //frame: false,
                hasShadow: false,
                alwaysOnTop: true,
                onClose () {
                    delete scope.warnWindow;
                    fn2();
                }
            };

            let fn = (flag) => {
                warnWindow = scope.warnWindow = new Win(opt);
                flag && warnWindow.win.setIgnoreMouseEvents(true);
                warnWindow.win.webContents.on('did-finish-load', function () {
                    warnWindow.win.webContents.send('id', warnWindow.win.id, flag);
                });
            };

            let fn2 = () => {
                opt = {
                    ...opt,
                    ...getBounds(name),
                };
                opt.frame = false;
                opt.transparent = true;
                opt.onClose = function () {
                    delete scope.warnWindow;
                }
                fn(true);
            };

            ignore ? fn2() : fn();
        }
    };

    scope.openReminder = function () {
        let reminderWin = scope.reminderWin;
        if (reminderWin) {
            //reminderWin.close();
        } else {
            let name = 'reminder';
            let url = 'reminder.html';
            scope.reminderWin = new Win({
                name,
                url,
                ...getBounds(name),
                frame: false,
                simpleFullscreen: true,
                //frame: false,
                //transparent: true,
                //titleBarStyle: 'hidden',
                //hasShadow: false,
                alwaysOnTop: true,
                //fullscreen: true,
                onClose: () => {
                    delete scope.reminderWin;
                },
            });
            scope.reminderWin.maximize();
        }
    };

    scope.openTodo = function (e, isFrame) {
        let todoWindow = scope.todoWindow;
        if (todoWindow) {
            return todoWindow.show();
        } else {
            let name = 'todo';
            let url = 'todo.html';
            let opt = {
                name,
                url,
                ...getBounds(name),
                show: false,
                simpleFullscreen: true,
                //frame: false,
                //transparent: true,
                //titleBarStyle: 'hidden',
                //hasShadow: false,
                alwaysOnTop: true,
                onClose () {
                    delete scope.todoWindow;
                    setTimeout(() => {
                        scope.openTodo();
                    }, 100);
                }
            }
            // opt.frame = !!isFrame;
            todoWindow = scope.todoWindow = new Win(opt);
            todoWindow.maximize();
            //todoWindow.win.setIgnoreMouseEvents(true);
            todoWindow.win.webContents.on('did-finish-load', function () {
                todoWindow.win.webContents.send('windowId', todoWindow.win.id);
                todoWindow.win.webContents.send('mainWindowId', mainWindowId);
            });
        }
    };

    // --------------------------------------------------------------------------------------------

    window.addEventListener('beforeunload', function (e) {
        scope.newsWin && scope.newsWin.close();
        scope.warnWindow && scope.warnWindow.close();
        scope.todoWindow && scope.todoWindow.close();
    });

    ipcRenderer.on('openWindow', function (event, windowName) {
        let url = `${ windowName }.html`;
        scope.openByWindow({}, url);
    });

    // ---------------------------------------------------------------------------------------------

    setTimeout(() => {
        scope.openTodo();
    }, 1000 * 7);


    if (utils.isTrading()) {
        //!scope.newsWin && scope.openNews();
        //!scope.warnWindow && scope.openWarn(null, 1);
    }

    if (utils.isTradingDate()) {
        utils.timer('9:00', () => {
            //scope.openReminder();
        });
        utils.timer('12:45', () => {
            //scope.openReminder();
        });
        utils.timer('15:00', () => {
            scope.newsWin && scope.newsWin.close();
            scope.warnWindow && scope.warnWindow.close();
        });
    }

});

//brick.reg('parentCtrl', parentCtrl);
brick.reg('setTagCtrl', setTagCtrl);

brick.reg('memoCtrl', function () {

    let $memo = $('#memo');

    $.get('/stock/memo').done(function (o) {
        let text = o.text;

        $memo.froalaEditor({
            toolbarInline: true,
            colorsBackground: COLORS_BACKGROUND,
            /*toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insert'],*/
            // Change save interval (time in miliseconds).
            saveInterval: 2500,
            // Set the save param.
            saveParam: 'text',
            // Set the save URL.
            saveURL: '/stock/memo',
            // HTTP request type.
            saveMethod: 'POST',
            // Additional save params.
            saveParams: {time: +new Date}
        }).froalaEditor('html.set', text || '');

    });

    this.saveMemo = function (e) {
        let text = $memo.froalaEditor('html.get', true);
        console.log(text);
        $.post('/stock/memo', {text}).done((o) => {
        });
    };

});

brick.reg('setVoiceWarnCtrl', setVoiceWarnCtrl);

brick.reg('countSwingCtrl', function (scope) {

    let $elm = scope.$elm;
    let $countSwingResult = $elm.find('#countSwingResult');

    function calculate (p) {

        console.info(p)
        let a = p + p * 0.1
        console.info(a)
        a = Math.round(a * 100) / 100
        console.info(a)
        let b = p - p * 0.1
        console.info(b)
        b = Math.round(b * 100) / 100
        console.info(b)

        let text = '';
        for (let i = -0.025; i <= 0.105; i += 0.005) {
            text += `${ Math.round(p * (1 + i) * 100) / 100 }  :  ${ Math.round(i * 1000) / 10 }% \r\n`;
        }

        return ` 现价: ${ p } -------- 涨停价: ${ a } --------- 跌停价: ${ b }\r\n ------------------ \r\n${ text }`;
    }

    // 涨跌停价计算
    scope.countSwing = function (fields) {
        fields = fields || {};
        let cb = (price) => {
            $countSwingResult.text(calculate(price));
        };

        let price = fields.price * 1;
        if (price) {
            cb(price);
        } else {
            utils.getStock().then((stock) => {
                // $.icMsg(stock.code)
                rts({
                    interval: false,
                    code: stock.code,
                    callback: function (data) {
                        $elm.find('[ic-form-field="code"]').val(stock.name);
                        console.info(data[0])
                        let p = data[0].price * 1;
                        $elm.find('[ic-form-field="price"]').val(p);
                        cb(p);
                    }
                });
            });
        }
    };

    $elm.on('ic-popup.show', function () {
        scope.countSwing();
    });

});

brick.reg('setStockCtrl', function () {
    this.addStock = function (fields) {
        console.log(fields);
        utils.addStock(fields);
        $.icMsg('添加成功.');
    };
});

