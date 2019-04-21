/*!
 * Created by j on 18/11/25.
 */

import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

brick.reg('conceptCtrl', function () {
    let scope = this;
    let $elm = this.$elm;

    let query = brick.utils.get_query() || {};
    let name = query.name || '';

    $('title').text(name);

    $.ajax({url: `/stock/concept/${ name }`, dataType: 'json'}).done(function (data) {
        name ? scope.render('list', {name: name, list: data}) : scope.render('allConcept', data);
    });

});
