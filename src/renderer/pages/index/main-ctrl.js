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
import rts from '../../../libs/real-time-stock'
import userJodb from '../../../libs/user-jodb'

const {ipcRenderer} = electron


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

    let $elm = this.$elm

    let $viewsWrapper = $('#viewsWrapper')
    let $indexView = $('#indexView')
    let $viewTabs = $('#viewTabs')
    let $views = $('#views')

    const viewsModel = brick.services.get('viewsModel')

    let render = () => {
        let list = viewsModel.get()
        $viewTabs.icRender({model: list})
        if (!list.length) {
            scope.showIndex()
        }
    }

    this.show = function (e, url) {
        $viewsWrapper.show()
        $indexView.hide()
        let $th = $(this)
        let title = $th.text()
        let item = {title, url}
        if (viewsModel.has(item)) {
            viewsModel.active(item)
        } else {
            item.$webView = $(`<webview src="${ url }" nodeintegration style="height: 100%;"></webview>`).appendTo($views)
            viewsModel.add(item)
        }
        render()
    }

    this.closeTab = function (e, url) {
        viewsModel.remove({url})
        render()
        return false
    }

    this.activeTab = (e, url) => {
        viewsModel.active({url})
        render()
    }

    this.showIndex = function (e, url) {
        $indexView.show()
        $viewsWrapper.hide()
    }

    // -------------------------------------------------------------------------------------------

    function getBounds (name) {
        return setting.get(`${ name }.bounds`) || {};
    }

    scope.openReview = function () {
        let win = scope.reviewTradingWindow
        if (win) {
            win.show()
        } else {
            let name = 'review';
            let url = 'review.html';
            scope.reviewTradingWindow = new Win({
                name,
                url,
                ...getBounds(name),
                onClose: () => {
                    delete scope.reviewTradingWindow;
                }
            });
            scope.reviewTradingWindow.maximize()
        }
    };

    scope.openViewer = function () {
        let viewerWindow = scope.viewerWindow;
        if (viewerWindow) {
            viewerWindow.show();
        } else {
            let name = 'viewer';
            let url = 'viewer.html';
            scope.viewerWindow = new Win({
                name,
                url,
                ...getBounds(name),
                onClose: () => {
                    delete scope.viewerWindow;
                }
            });
            scope.viewerWindow.maximize();
        }
    };

    scope.openCsd = function (e) {
        let csdWindow = scope.csdWindow
        if (csdWindow) {
            csdWindow.show();
        } else {
            let name = 'csd';
            let url = 'csd.html';
            scope.csdWindow = new Win({
                name,
                url,
                x: 160,
                y: 80,
                ...getBounds(name),
                onClose: () => {
                    delete scope.csdWindow;
                }
            });
        }
    };

    scope.openSetting = function () {
        let settingWindow = scope.settingWindow;
        if (settingWindow) {
            settingWindow.show()
        } else {
            let name = 'setting';
            let url = 'setting.html';
            scope.settingWindow = new Win({
                name,
                url,
                x: 160,
                y: 80,
                ...getBounds(name),
                onClose: () => {
                    delete scope.settingWindow;
                }
            });
        }
    };

    // -------------------------------------------------------------------------------------------

    scope.openNews = function () {
        let newsWin = scope.newsWin;
        if (newsWin) {
            newsWin.show();
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
                useContentSize: true,
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
                newsWin.win.webContents.send('id', newsWin.win.id)
            });
            setTimeout(() => {
                newsWin.win.setIgnoreMouseEvents(true);
            }, 1000 * 60 * 2);
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

    scope.openWarn = function (isFrame) {
        let warnWindow = scope.warnWindow;
        if (warnWindow) {
            return warnWindow.show();
            /* let msg = `
 增加这么多步骤, 只是为了让你少犯错;
 控制本能, 把事情做对, 而不是被本能控制;
 想想你重复犯了多少错?
 不围绕主线; 随意操作; 无计划操作; 无逻辑操作; 不要再犯错了;
 想想那些恐惧和痛苦吧!`
             utils.msg(msg)
             if (window.confirm(msg)) {
                 warnWindow.close()
             }*/
        } else {
            let name = 'warn';
            let url = 'warn.html';
            let opt = {
                name,
                url,
                ...getBounds(name),
                // width: 480,
                // height: 320,
                // x: 1440,
                // y: 640,
                //show: false,
                //transparent: true,
                //titleBarStyle: 'hidden',
                //frame: false,
                //hasShadow: false,
                alwaysOnTop: true,
                onClose () {
                    delete scope.warnWindow;
                }
            }
            // opt.frame = !!isFrame;
            warnWindow = scope.warnWindow = new Win(opt);
            warnWindow.maximize()
            //warnWindow.win.setIgnoreMouseEvents(true)
            warnWindow.win.webContents.on('did-finish-load', function () {
                warnWindow.win.webContents.send('id', warnWindow.win.id)
            })
        }
    };

    scope.openPrompt = function () {
        let promptWindow = scope.promptWindow;
        if (promptWindow) {
            return promptWindow.close();
        } else {
            let name = 'prompt';
            let url = 'prompt.html';
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
                    delete scope.promptWindow;
                    fn2();
                }
            };

            let fn = (flag) => {
                promptWindow = scope.promptWindow = new Win(opt);
                flag && promptWindow.win.setIgnoreMouseEvents(true);
                promptWindow.win.webContents.on('did-finish-load', function () {
                    promptWindow.win.webContents.send('id', promptWindow.win.id, flag)
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
                    delete scope.promptWindow;
                }
                fn(true);
            };

            fn();

        }
    };

    window.addEventListener('beforeunload', function (e) {
        scope.warnWindow && scope.warnWindow.close();
        scope.newsWin && scope.newsWin.close();
        scope.promptWindow && scope.promptWindow.close();
    });

    // ----------------------------------------------------------------

    let d = new Date()
    let h = d.getHours()
    let m = d.getMinutes()
    if (h < 15) {
        scope.openNews();
        scope.openPrompt();
    }


    // ----------------------------------------------------------------

    let activeWarnWindow = () => {
        if (scope.warnWindow) {
            scope.warnWindow.show();
            scope.warnWindow.win.webContents.send('view', 'reminder');
        }
    };


    utils.timer('9:07', () => {
        scope.openReminder();
    });

    utils.timer('9:19', () => {
        //voice('竞价撤单！竞价撤单！竞价撤单！竞价撤单！竞价撤单！竞价撤单！竞价撤单！');
    });

    utils.timer('9:26', () => {
        //voice('低开不要停止止损！低开不要停止止损！低开不要停止止损！低开不要停止止损！低开不要停止止损！');
        //voice('开盘价最低2点止损！开盘价最低2点止损！开盘价最低2点止损！开盘价最低2点止损！开盘价最低2点止损！');
        scope.openWarn(false);
        setTimeout(() => {
            if (scope.warnWindow) {
                scope.warnWindow.hide();
            }
        }, 1000 * 60 * 3);
    });

    utils.timer('12:57', () => {
        activeWarnWindow();
    });

    utils.timer('15:00', () => {
        scope.newsWin && scope.newsWin.close();
    });


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
        }).froalaEditor('html.set', text || '')

    })

    this.saveMemo = function (e) {
        let text = $memo.froalaEditor('html.get', true)
        console.log(text)
        $.post('/stock/memo', {text}).done((o) => {
        })
    };

});

brick.reg('setStockCtrl', function () {
    this.addStock = function (fields) {
        console.log(fields);
        utils.addStock(fields);
    }
});

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

        return ` 现价: ${ p } \r\n 涨停价: ${ a } \r\n 跌停价: ${ b } \r\n ------------- \r\n${ text }`;
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

            ac.getStockName(function (stock) {

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
                })
            });
        }
    };

    $elm.on('ic-popup.show', function () {
        scope.countSwing();
    });

});

brick.reg('setVoiceWarnCtrl', function (scope) {

    const warnJodb = userJodb('warn', [], {joinType: 'push'});
    // 存储定时器句柄，用以取消
    const warnHandleMap = {};

    ipcRenderer.on('warn', (event, info) => {
        console.log(11, info, warnHandleMap[info])
        voice(warnHandleMap[info] || '');
    });

    let render = () => {
        let model = warnJodb.get();
        scope.render('warnList', {model});
    };

    warnJodb.on('change', render);

    scope.save = function (fields) {
        warnJodb.set(fields);
        scope.reset();
    };

    scope.reset = (model = {}) => {
        scope.render('setWarnItem', {model});
    };

    scope.edit = function (e, id) {
        let model = warnJodb.get(id)[0];
        scope.render('setWarnItem', {model});
    };

    scope.rm = function (e, id) {
        warnJodb.remove(id);
    };

    scope.up = function (e, id) {
        warnJodb.insert(id);
    };

    scope.disable = function (e, id, isDisable) {
        let item = warnJodb.get(id)[0];
        item.disable = !item.disable;
        warnJodb.set(item);
        $(this).text(isDisable ? '启用' : '禁用');
    }

    render();

    function setVoiceWarnForItem (item) {
        let id = item.id;
        let content = item.content;
        let trigger = item.trigger;
        let disable = item.disable;
        let old = warnHandleMap[id];
        // trigger => 10 : 间隔执行
        if (/^\d+$/.test(trigger)) {
            old && clearInterval(old.handle);
            if (disable) {
                return;
            }
            let handle = setInterval(() => {
                voice(content);
            }, 1000 * 60 * trigger);
            warnHandleMap[id] = {handle};
        }
        // trigger => 9:00: 定时执行
        else if (/^\d+[:]\d+$/.test(trigger)) {
            old && old.handle.cancel();
            if (disable) {
                return;
            }
            let handle = utils.timer(trigger, () => {
                voice(content);
            });
            warnHandleMap[id] = {handle};
        }
        // trigger => 'daban': 打板动作触发
        else {
            old && delete warnHandleMap[old.handle];
            if (disable) {
                return;
            }
            warnHandleMap[trigger] = content;
            warnHandleMap[id] = {handle: trigger};
        }
    }

    function updateVoiceWarn () {
        warnJodb.get().forEach(setVoiceWarnForItem);
    }

    warnJodb.on('change', function () {
        updateVoiceWarn();
        console.log('##### updateVoiceWarn on change', warnHandleMap);
    });

    updateVoiceWarn();


});
