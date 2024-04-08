/*!
 * Created by j on 18/11/25.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

const socket = io();

brick.reg('conceptCtrl', function (scope) {
    let $elm = this.$elm;

    let query = brick.utils.get_query() || {};
    let name = query.name || '';

    $('title').text(name);

    $elm.icSetLoading();

    $.ajax({url: `/stock/concept/${ encodeURIComponent(name) }`, dataType: 'json'})
        .done(function (data) {
            name ? scope.render('list', {name: name, list: data}) : scope.render('allConcept', _.groupBy(data, (item) => {
                return item.key;
            }));
        })
        .always(() => {
            $elm.icClearLoading();
        });

    scope.viewInTdx = function (e, code) {
        socket.emit('shandy', {event: 'view_in_tdx', code});
    };
});
