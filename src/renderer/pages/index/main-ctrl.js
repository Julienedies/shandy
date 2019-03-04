/**
 * Created by j on 18/8/21.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'

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

    scope.reviewTrading = function(){
        let win = scope.reviewTradingWindow
        if(win && win.win){
            win.show()
        }else{
            scope.reviewTradingWindow = utils.open({x:160, y: 80, url: 'review-trading.html'})
        }
    }


    scope.csd = function(e){
        let csdWin = scope.csdWin
        if(csdWin && csdWin.win){
            csdWin.show()
        }else{
            scope.csdWin = utils.open({x:160, y: 80, url: 'csd.html'})
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