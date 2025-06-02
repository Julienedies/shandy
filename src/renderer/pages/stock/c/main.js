/*!
 * Created by j on 18/9/20.
 */
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

import bridge from 'e-bridge'


brick.reg('c_ctrl', function () {

    let scope = this;

    let query = brick.utils.get_query() || {};
    let code = query.code;
    let edit = query.edit;

    let c;

    $.ajax({url: `/stock/c/${ code }`, dataType: 'json'}).done(function (data) {
        c = data;
        $('title').text(data['名称']);
        if (edit) {
            scope.set_c(data);
        } else {
            set_c_done({}, data);
        }
    });

    scope.set_c = function (e) {
        scope.$elm.hide();
        scope.emit('set_c', c);
    };

    function set_c_done (e, data) {
        data && scope.render('c', data);
        scope.$elm.show();
    }

    scope.on('set_c_done', set_c_done);
});


brick.reg('set_c_ctrl', function () {

    let scope = this;

    scope.openItem = function (e, concept) {
        console.log(e, concept)
        let url = `http://localhost:3300/web/stock_concept.html?name=${ concept }`
        bridge.openExternal(url)
    }


    //alert(window.screen.screenLeft);

    if (window.screen.screenLeft >= 1700 || window.innerWidth === 1200) {

        scope.done = function (data) {
            window.close();
        };

        scope.close = function (e) {
            window.close();
        };

    } else {

        scope.done = function (data) {
            scope.$elm.hide();
            scope.emit('set_c_done', data);
        };

        scope.close = function (e) {
            scope.$elm.hide();
            scope.emit('set_c_done');
        };

    }


    scope.on('set_c', function (e, data) {
        scope.render('set_c', data);
        scope.$elm.show();
    });

});
