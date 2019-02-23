/**
 * Created by j on 18/8/5.
 */

import '../../../css/common/common.scss'
import './style.scss'

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common.js'

import setTagCtrl from './set-tag-ctrl'
import tagsCtrl from './tags-ctrl'

brick.reg('tags_ctrl', tagsCtrl);

brick.reg('set_tag_ctrl', setTagCtrl);