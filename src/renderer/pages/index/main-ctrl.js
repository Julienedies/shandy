/**
 * Created by j on 18/8/21.
 */

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
                height: 64,
                x: 60,
                ...getBounds(name),
                //titleBarStyle: 'hidden',
                // transparent: true,
                // frame: false,
                hasShadow: false,
                alwaysOnTop: true,
                onClose: () => {
                    delete scope.newsWin;
                }
            }
            newsWin = scope.newsWin = new Win(opt);
            // newsWin.win.setIgnoreMouseEvents(true);
            newsWin.win.webContents.on('did-finish-load', function () {
                newsWin.win.webContents.send('id', newsWin.win.id)
            })
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

    scope.openWarn = function () {
        let warnWindow = scope.warnWindow
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
                //alwaysOnTop: true,
                onClose () {
                    delete scope.warnWindow;
                }
            }
            warnWindow = scope.warnWindow = new Win(opt);
            warnWindow.maximize()
            //warnWindow.win.setIgnoreMouseEvents(true)
            warnWindow.win.webContents.on('did-finish-load', function () {
                warnWindow.win.webContents.send('id', warnWindow.win.id)
            })
        }
    }

    window.addEventListener('beforeunload', function (e) {
        scope.warnWindow && scope.warnWindow.close()
        scope.newsWin && scope.newsWin.close()
    })

    // ----------------------------------------------------------------

    // scope.news()
    // scope.warn()

    // ----------------------------------------------------------------

    let activeWarnWindow = () => {
        if (scope.warnWindow) {
            scope.warnWindow.show()
            scope.warnWindow.win.webContents.send('view', 'reminder')
        }
    };

    let mistakeText =
        `鸡肋头寸, 错误头寸, 竞价即刻平仓; 或者最小止损;
            不要停止止损, 这个错误一直重复. 本质上是囿于小利, 斤斤计较!
            正确的头寸不需要大的止损!`;

    utils.timer('9:05', () => {
        scope.openReminder()
    });
    utils.timer('9:10', () => {
        scope.openNews();
        scope.openWarn();
    });
    utils.timer('9:26', () => {
        voice(mistakeText);
        activeWarnWindow();
    });
    utils.timer('12:57', () => {
        activeWarnWindow();
    });

    utils.timer('15:00', () => {
        scope.newsWin && scope.newsWin.close()
    });

});


brick.reg('memoCtrl', function () {

    let $memo = $('#memo')

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
        console.log(fields)
        utils.addStock(fields)
    }
});
