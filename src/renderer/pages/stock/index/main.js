/*!
 * Created by j on 18/11/25.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

brick.set('render.wrapModel', true)

brick.reg('mainCtrl', function () {
    let scope = this;
    let $elm = this.$elm;

    $.getJSON({url: `/web/manifest.json`, dataType: 'json'}).done(function (data) {
        scope.render('nav', data)
    });

})


brick.bootstrap()