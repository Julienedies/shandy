/**
 * Created by j on 18/6/28.
 */

import utils from '../../libs/e-bridge'

import $ from 'jquery'
import brick from '@julienedies/brick'

import parentCtrl from './parentCtrl'

brick.set('ic-show-img-item', 'a[href$=png]');
brick.set('ic-show-img-url', 'href');

brick.set('ic-select-cla', 'is-info');

brick.set('cla.error', 'is-danger');

brick.debug('log');

//brick.set('debug', true);

brick.set('render.wrapModel', true);

brick.reg('main_ctrl', parentCtrl);
brick.reg('mainCtrl', parentCtrl);
brick.reg('parentCtrl', parentCtrl);

setTimeout(function () {
    brick.bootstrap();
}, 30);
