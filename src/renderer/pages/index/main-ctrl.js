/**
 * Created by j on 18/8/21.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'

brick.reg('main_ctrl', function () {

    let $webview = $('#webviewWrapper')
    let $indexView = $('#indexView')
    let $webView = $('#web_view')

    this.open = function(e, url){
        if(url === 'index.html'){
            $webview.fadeOut()
            $indexView.fadeIn()
        }else{
            $indexView.fadeOut()
            $webview.fadeIn()
            $webView.attr('src', url)
        }
    }

});