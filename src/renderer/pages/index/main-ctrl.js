/**
 * Created by j on 18/8/21.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'

brick.reg('main_ctrl', function () {

    let $elm = this.$elm

    let $webview = $('#webviewWrapper')
    let $indexView = $('#indexView')
    let $webView = $('#web_view')

    this.open = function (e, url) {
        if (url === 'index.html') {
            $webview.fadeOut()
            $indexView.fadeIn()
        } else {
            $indexView.fadeOut()
            $webview.fadeIn()
            $webView.attr('src', url)
        }
    }

})


brick.reg('memoCtrl', function(){

    let $memo_plc = $('#memo_plc')
    let $memo = $('#memo')

    $.get('/stock/memo').done(function (o) {
        let text = o.text
        text && $memo.val(text) && $memo_plc.text(text)
    })

    this.saveMemo = function (e) {
        $.post('/stock/memo', {text: $memo.val()}).done((o) => {
            $memo.attr('readonly', true)
        })
    }


    $memo.on('dblclick', function (e) {
        $memo.removeAttr('readonly')
    }).on('mouseup', function (e) {
        console.log($memo.val())
        $memo_plc.text($memo.val())
    })

})