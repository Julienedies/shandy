/**
 * Created by j on 17/12/17.
 */

import '../../../../css/basic/0.7/basic.scss'

import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

brick.set('ic-show-img-item', 'a[href$=png]');
brick.set('ic-show-img-url', 'href');

brick.reg('mainCtrl', function (scope) {
    let $body = $(document.body);
    let $elm = scope.$elm;
    let $nav = $('[ic-tabs="nav"] > li');
    let $views = $elm.find('section');

    let views = $nav.map(function () {
        return $(this).attr('aic-view-to');
    }).get();

    let bounce = 0;
    let index = 0;
    let max = views.length - 1;

    let clientHeight = $elm.height();
    let oldIsUp;

    let callback = _.debounce(function (e) {
        console.log(e.originalEvent.deltaY);
        //正负值表示滚动方向
        let isUp = e.originalEvent.deltaY < 0;

        //if (isUp !== oldIsUp) {
        //    bounce = 0;
        //    oldIsUp = isUp;
        //}

        //判断当前视图是否有隐藏内容
        //if (viewElem.scrollHeight > clientHeight) {
            //判断滚动方向
            //if (isUp && $elm.scrollTop() > 0) {
            //    return;
            //}
            //
            //if (!isUp && $elm.scrollTop() + clientHeight + 5 < $elm[0].scrollHeight) {
            //    return;
            //}
            //
            //if (bounce < 1) {
            //    bounce++;
            //    return;
            //}
        //}

        bounce = 0;

        isUp ? --index : ++index;
        if (index < 0) {
            index = max;
        }
        if (index > max) {
            index = 0;
        }
        $nav.eq(index).click();
        //brick.view.to(views[index]);
    }, 150);

    $(window).on('mousewheel', callback);

    $elm.on('ic-show-img.show', function(e){
        $body.off('mousewheel', callback);
    });

    $elm.on('ic-show-img.hide', function(e){
        $body.on('mousewheel', callback);
    });

    scope.$elm.on('ic-scroll', function (e) {
        //console.log('scroll', e);
        //$body.off('mousewheel', callback);
    }).on('click', 'p, dt, li', function (e) {
        //$(this).toggleClass('focus');
    });

});

brick.bootstrap()