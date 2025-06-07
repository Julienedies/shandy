/**
 * Created by j on 18/6/28.
 */

import utils from '../../libs/e-bridge'

import $ from 'jquery'
import brick from '@julienedies/brick'

import parentCtrl from './parentCtrl'

brick.set('ic-show-img-item', 'a[href$=png]');
brick.set('ic-show-img-url', 'href');

brick.set('ic-select-cla', 'is-warning');

brick.set('cla.error', 'is-danger');


brick.debug('log');

//brick.set('debug', true);

brick.set('render.wrapModel', true);

brick.reg('main_ctrl', parentCtrl);
brick.reg('mainCtrl', parentCtrl);
brick.reg('parentCtrl', parentCtrl);


window.TAGS_FILTER = ['交易错误','交易统计','交易风险','行情类型', '目标行情', '买点'];


setTimeout(function () {
    brick.bootstrap();
}, 30);
