/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import './style.scss'

import electron from 'electron'
import $ from 'jquery'
import utils from '../../../libs/utils'
import warnText from '../../js/warn-text'
import brick from '@julienedies/brick'

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
let win

let socket = io()

ipc.on('id', function (event, windowID) {
    console.log(event, windowID)
    win = BrowserWindow.fromId(windowID)
})

brick.directives.reg('ic-step', function($elm){
    let cla = 'active'
    $elm.on('click', 'li', function(){
        console.log(this)
        let $th = $(this).removeClass(cla)
        let $next = $th.next()
        if($next.length){
            return $next.addClass(cla)
        }
        $elm.find(':first-child').addClass(cla)
        $elm.trigger('ic-step.over')
    })
})

brick.reg('warnCtrl', function (scope) {
    let $msg = $('#msg')

    socket.on('warn', (info) => {
        if (info === 'esc') {
            return;
        }
        $msg.text(info).addClass('warn')
        win.showInactive()
    })

    $('#step').on('ic-step.over', () => {
        win.hide()
    })

    scope.hide = () => {
        win.hide()
        setTimeout(() => {
            utils.activeFtnn()
            utils.activeTdx()
        }, 400)
    }



})

brick.reg('plansCtrl', function () {

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

})

brick.reg('mistakeCtrl', function (scope) {

})

brick.bootstrap()
