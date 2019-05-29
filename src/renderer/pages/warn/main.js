/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import '@julienedies/brick/dist/brick.transition.js'

import '../../js/utils.js'

import electron from 'electron'
import utils from '../../../libs/utils'
import warnText from '../../js/warn-text'

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow

let win;
let $body = $('body');
let socket = io();

// 显示随机背景图片
function randomBgImg () {
    $body.css('background-image', `url("/file/random/?time=${ +new Date }")`)
}

randomBgImg()

ipc.on('id', function (event, windowID) {
    console.log(event, windowID)
    win = BrowserWindow.fromId(windowID)
})

ipc.on('view', (e, view) => {
    brick.view.to(view)
})


brick.directives.reg('x-ic-step', function ($elm) {
    let cla = 'active'
    $elm.children().eq(0).addClass(cla)

    $elm.on('click', '>li', function () {
        let $th = $(this).removeClass(cla)
        let $next = $th.next()
        if ($next.length) {
            return $next.addClass(cla)
        }
        $elm.trigger('ic-step.over')
        $elm.find(':first-child').addClass(cla)
    })
});


brick.reg('mainCtrl', function (scope) {

    socket.on('warn', (info) => {
        let d = new Date()
        let h = d.getHours()
        let m = d.getMinutes()
        if (h === 9 && m > 15 && m < 45) {
            // return;
        }

        if (info === 'esc') {
            return //scope.hideWindow();
        }

        win.showInactive()
        brick.view.to(info)

        let map = {
            daban: 7,
            sell: 7,
            buy: 9
        }

        setTimeout(() => {
            scope.hideWindow()
        }, map[info] * 1000);

    });

    scope.hideWindow = () => {
        win.hide()
        randomBgImg()
        setTimeout(() => {
            utils.activeFtnn()
            utils.activeTdx()
        }, 300)
    };


    $('[ic-view]').on('ic-view.active', () => {

    });

});


brick.reg('warnCtrl', function (scope) {

});

brick.reg('planCtrl', function () {

    let scope = this
    let $elm = scope.$elm

    $.get({
        url: '/stock/replay'
    }).done((data) => {
        console.info(data)
        scope.render('replay', {model: data.replay})
    })

    $.get({
        url: '/stock/plan'
    }).done((data) => {
        console.info(data)
        data.plans && data.plans.length && scope.render('plans', {model: data.plans})
    })

});

brick.reg('mistakeCtrl', function (scope) {
    $.get('/stock/tags')
        .done((data) => {
            console.log(data)
            let vm = data['交易错误']
            scope.render('mistake', vm)
        })
});

