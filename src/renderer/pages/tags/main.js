/**
 * Created by j on 18/8/5.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'
import '../viewer/icViewer.scss'

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

// 现在有一个问题, 在构建target=web的时候, js/common.js 由于依赖node环境, 会报错: can't find module 'fs'
// 但是构建target=renderer的时候又是必须的, 如何解决?
// 引入e-bridge 解决;
// 另外的解决方案,可以考虑: https://www.npmjs.com/package/webpack-conditional-loader
import '../../js/common.js'
import '../../js/common-stock.js'
import '../../js/utils.js'

import tagsCtrl from './tags-ctrl'
import detailsCtrl from './details-ctrl'
import setTagCtrl from './set-tag-ctrl'
import viewerMarkTagCtrl from '../viewer/markTag-ctrl'

import bridge from '../../../libs/utils'

const setting = bridge.setting();

window.brick = brick; // 不是测试用；模板里需要全局获取用于嵌套模板 {{ brick.getTpl('details')({model:v.children}) }}

brick.set('ic-viewer-interval', setting.get('icViewerInterval'));

brick.reg('tagsCtrl', tagsCtrl);

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('detailsCtrl', detailsCtrl);

brick.reg('viewerMarkTagCtrl', viewerMarkTagCtrl);
