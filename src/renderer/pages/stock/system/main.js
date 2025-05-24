/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import {
    GET_TAGS_DONE,
} from '../../../js/constants'

import utils from '../../../js/utils'
import '../../../js/common-stock.js'
import Reader from '../../../../libs/reader'

import setTagCtrl from '../../tags/set-tag-ctrl'

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('systemCtrl', function () {

    let scope = this;


});
