/*!
 * Created by j on 2019-02-22.
 */

import '../../../css/common/common.scss'

import './index.html'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

import setTagCtrl from '../tags/set-tag-ctrl'

brick.reg('set_tag_ctrl', setTagCtrl)

brick.reg('mistakeCtrl', function (scope) {

    scope.mistake = {
        add(){
        }
    }

    $.get('/mistake').done( (data) => {
        console.log(data)
        scope.render('mistakes', {model: data})
    })

});


brick.reg('setMistakeCtrl', function (scope) {


});


brick.bootstrap()
