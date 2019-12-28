/**
 * Created by j on 18/6/3.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/utils.js'

brick.set('render.wrapModel', true)

brick.reg('mainCtrl', function (scope) {

    $.get('/stock/tags/').done((data) => {
        console.log(data);
        scope.render('prepare', data);
        scope.render('mistake', data);
        scope.render('logic', data);
        scope.render('principle', data);
    });

});





