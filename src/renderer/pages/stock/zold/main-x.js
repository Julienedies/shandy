/**
 * Created by j on 17/7/23.
 */

import '../../../css/basic/0.7/basic.scss'

import './style.scss'

import './trade.html'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'


brick.set('bootstrap.auto', 1);
brick.set('view.aniId', 26);

brick.reg('mainCtrl', function (scope) {
    let $body = $(document.body);
    let $elm = scope.$elm;
    let $nav = $('[ic-tabs="nav"] > li');
    let $views = $elm.find('>div[aic-view]');

    let views = $nav.map(function () {
        return $(this).attr('aic-view-to');
    }).get();

    let bounce = 0;
    let index = 0;
    let max = views.length - 1;

    let clientHeight = $elm.height();
    let oldIsUp;

    let callback = _.debounce(function (e) {
        console.log($elm.scrollTop(), clientHeight, $elm[0].scrollHeight, bounce);
        //正负值表示滚动方向
        let isUp = e.originalEvent.deltaY < 0;
        let viewElem = $views.get(index);

        if(isUp !== oldIsUp) {
            bounce = 0;
            oldIsUp = isUp;
        }

        //判断当前视图是否有隐藏内容
       /* if (viewElem.scrollHeight > clientHeight) {
            //判断滚动方向
            if (isUp && $elm.scrollTop() > 0) {
                return;
            }

            if (!isUp && $elm.scrollTop() + clientHeight + 5 < $elm[0].scrollHeight) {
                return;
            }

            if(bounce < 2) {
                bounce++;
                return;
            }
        }*/

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

    $body.on('mousewheel', callback);

    scope.$elm.on('ic-scroll', function (e) {
        //console.log('scroll', e);
        //$body.off('mousewheel', callback);
    }).on('click', 'p, dt, li', function (e) {
        //$(this).toggleClass('focus');
    });

});


brick.bootstrap()