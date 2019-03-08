/**
 * Created by j on 18/8/21.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import froala from 'froala-editor/js/froala_editor.pkgd.min.js'

import utils from '../../../libs/utils'

brick.reg('main_ctrl', function (scope) {

    let $elm = this.$elm

    let $webview = $('#webviewWrapper')
    let $indexView = $('#indexView')
    let $webView = $('#web_view')

    this.show = function (e, url) {
        if (url === 'index.html') {
            $webview.fadeOut()
            $indexView.fadeIn()
        } else {
            $indexView.fadeOut()
            $webview.fadeIn()
            $webView.attr('src', url)
        }
    }

    scope.reviewTrading = function () {
        let win = scope.reviewTradingWindow
        if (win && win.win) {
            win.show()
        } else {
            scope.reviewTradingWindow = utils.open({x: 160, y: 80, url: 'review-trading.html'})
        }
    }


    scope.csd = function (e) {
        let csdWin = scope.csdWin
        if (csdWin && csdWin.win) {
            csdWin.show()
        } else {
            scope.csdWin = utils.open({x: 160, y: 80, url: 'csd.html'})
        }

    }

})


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
    }

})