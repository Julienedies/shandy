/**
 * Created by j on 18/8/5.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

// 现在有一个问题, 在构建target=web的时候, js/common.js 由于依赖node环境, 会报错: can't find module 'fs'
// 但是构建target=renderer的时候又是必须的, 如何解决?
// 引入e-bridge 解决;
// 另外的解决方案,可以考虑: https://www.npmjs.com/package/webpack-conditional-loader
import '../../../js/common.js'
import '../../../js/common-stock.js'
import '../../../js/utils.js'

import setTagCtrl from './set-tag-ctrl'
import tagsCtrl from './tags-ctrl'

// 数组转tree
function arr2tree (list = []) {
    const data = JSON.parse(JSON.stringify(list)) // 浅拷贝不改变源数据
    const result = []
    if (!Array.isArray(data)) {
        return result
    }
    data.forEach(item => {
        delete item.children
    })
    const map = {}
    data.forEach(item => {
        map[item.id] = item
    })
    data.forEach(item => {
        const parent = map[item.parentId]
        if (parent) {
            (parent.children || (parent.children = [])).push(item)
        } else {
            result.push(item)
        }
    })
    return result
}

window.brick = brick;


brick.reg('tagsCtrl', tagsCtrl);

brick.reg('setTagCtrl', setTagCtrl);

brick.reg('detailsCtrl', function (scope) {

    let $elm = scope.$elm;
    let $typeTitle = $elm.find('#typeTitle');
    let type;

    let render = () => {
        let vm = arr2tree(scope.model[type]);
        console.log(55, vm);
        $typeTitle.text(type);
        scope.render('details', vm);
    };

    scope.close = function (e) {
        $elm.icPopup();
    };

    scope.on('view-details', function (e, _type) {
        console.log(_type);
        type = _type;
        render();
        $elm.icPopup(true);
    });

    scope.on('tag.edit.done', function (e, msg) {
        render();
    });

});
