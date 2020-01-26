/*!
 * Created by j on 2019-02-22.
 */

import './index.html'
import '../../css/common/common.scss'
import '../tags/style.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common-stock.js'
import '../../js/utils.js'

import detailsCtrl from '../tags/details-ctrl'
import setTagCtrl from '../tags/set-tag-ctrl'

window.brick = brick; // 不是测试用；模板里需要全局获取

brick.reg('setTagCtrl', setTagCtrl);
brick.reg('detailsCtrl', detailsCtrl);

brick.reg('mistakeCtrl', function (scope) {

    scope.onGetTagsDone = function (data) {
        scope.model = data;
        console.log(data);
        scope.emit('view-details', data);
    };


});





brick.reg('setMistakeCtrl', function (scope) {

});


