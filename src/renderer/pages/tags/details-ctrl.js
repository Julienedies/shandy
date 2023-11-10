import $ from 'jquery'

/**
 *
 * Created by j on 2019-09-19.
 */

export default function (scope) {

    let $elm = scope.$elm;
    let $typeTitle = $elm.find('#typeTitle');
    let type;

    let render = () => {
        let vm = arr2tree(scope.model[type]);
        console.log(vm);
        $typeTitle.text(type);
        scope.render('details', vm);
    };


    scope.close = function (e) {
        $elm.icPopup();
    };


    scope.on('view-details', function (e, _type) {
        console.log(_type);
        if(typeof _type === 'string'){
            type = _type;
            render();
        }else{
            let vm = arr2tree(_type);
            scope.render('details', vm);
        }
        $elm.icPopup(true);
    });


    scope.on('tag.edit.done', function (e, msg) {
        render();
    });

/*    //
    let $TradeInfo = $('#tradeInfo');

    scope.on('VIEWER_CURRENT_IMG', function (e, msg) {
        let arr = msg.tradeInfo || [];
        let text = arr.join('\r\n').replace(/,/g, '    ');
        $TradeInfo.text(text);
    });*/

}

// 数组转tree
function arr2tree (list = []) {
    return list;
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
