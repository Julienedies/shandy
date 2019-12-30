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

import view_stock from './view-stock-ctrl'
import setVoiceWarnCtrl from './set-voice-warn-ctrl'

const {ipcRenderer} = electron;

brick.services.reg('viewsModel', () => {
    const list = []
    let activeItem
    return {
        get (isActiveItem) {
            return isActiveItem ? activeItem : list;
        },
        add (item) {
            if (!this.has(item)) {
                list.push(item)
                this.active(item)
            }
        },
        remove (item) {
            let index = this.getIndex(item)
            item = this.find(item)
            if (item) {
                if (activeItem === item) {
                    let nextItem = list[index + 1] || list[0]
                    nextItem && this.active(nextItem)
                }
                item.$webView.remove()
                list.splice(index, 1)
            }
        },
        has (item) {
            return this.getIndex(item) !== -1
        },
        active (item) {
            item = this.find(item)
            if (activeItem) {
                activeItem.active = false
                activeItem.$webView.hide()
            }
            item.active = true
            item.$webView.show()
            activeItem = item
        },
        getIndex (item) {
            return list.findIndex((v) => {
                return v.url === item.url
            })
        },
        /**
         * 参数里的item只有url属性, 并不等于list里存储的item
         * @param item
         * @returns {null}
         */
        find (item) {
            let index = this.getIndex(item)
            return index !== -1 ? list[index] : null
        }
    }
});

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
            scope.showIndex();
        }
    };

    this.show = function (e, url) {
        $viewsWrapper.show();
        $indexView.hide();
        let $th = $(this)
        let title = $th.text();
        let item = {title, url};
        if (viewsModel.has(item)) {
            viewsModel.active(item);
        } else {
            item.$webView = $(`<webview src="${ url }" nodeintegration style="height: 100%; "></webview>`).appendTo($views);
            viewsModel.add(item);
        }
        render();
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
                height: 34,
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
            }, 1000 * 60 * 1);
        }
    };

    scope.openWarn = function () {
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
                    warnWindow.win.webContents.send('id', warnWindow.win.id, flag)
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

            fn();

        }
    };

    scope.openReminder = function () {
        let reminderWin = scope.reminderWin;
        if (reminderWin) {
            reminderWin.show()
        } else {
            let name = 'reminder';
            let url = 'reminder.html';
            scope.reminderWin = new Win({
                name,
                url,
                ...getBounds(name),
                onClose: () => {
                    delete scope.reminderWin;
                },
            });
            scope.reminderWin.maximize();
        }
    };

    scope.openPrompt = function (isFrame) {
        let promptWindow = scope.promptWindow;
        if (promptWindow) {
            return promptWindow.show();
        } else {
            let name = 'prompt';
            let url = 'prompt.html';
            let opt = {
                name,
                url,
                ...getBounds(name),
                show: false,
                frame: false,
                //transparent: true,
                //titleBarStyle: 'hidden',
                //hasShadow: false,
                //alwaysOnTop: true,
                onClose () {
                    delete scope.promptWindow;
                }
            }
            // opt.frame = !!isFrame;
            promptWindow = scope.promptWindow = new Win(opt);
            //promptWindow.maximize();
            //promptWindow.win.setIgnoreMouseEvents(true);
            promptWindow.win.webContents.on('did-finish-load', function () {
                promptWindow.win.webContents.send('id', promptWindow.win.id);
            });
        }
    };

    // --------------------------------------------------------------------------------------------

    window.addEventListener('beforeunload', function (e) {
        scope.newsWin && scope.newsWin.close();
        scope.warnWindow && scope.warnWindow.close();
        scope.promptWindow && scope.promptWindow.close();
    });

    // ---------------------------------------------------------------------------------------------

    scope.openPrompt();

    if (utils.isTrading()) {
        !scope.newsWin && scope.openNews();
        !scope.warnWindow && scope.openWarn();

    }

    if (utils.isTradingDate()) {
        utils.timer('8:55', () => {
            scope.openReminder();
        });

        utils.timer('15:00', () => {
            scope.newsWin && scope.newsWin.close();
            scope.warnWindow && scope.warnWindow.close();
        });
    }

});

brick.reg('memoCtrl', function () {

    let $memo = $('#memo');

    $.get('/stock/memo').done(function (o) {
        let text = o.text

        $memo.froalaEditor({
            toolbarInline: true,
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
    };
});
