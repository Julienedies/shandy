/**
 *
 * Created by j on 2024/4/15.
 */

import $ from 'jquery'
import brick from '@julienedies/brick'
import { READY_SELECT_TAGS } from '../../js/constants'

export default function () {

    let scope = this;
    let $elm = scope.$elm;
    let model = {};

    let rpListCtrl = brick.controllers.get('rpListCtrl');
    let listManager = rpListCtrl.listManager;

    scope.on('createReplay', function (e, rpForm) {
        brick.view.to('replay');
        model = rpForm || {};
        let vm = fixData (rpForm);
        scope.render('replay', {model:vm});
        scope.render('replay2', {model});
    });

    // 点击 退出 快捷方便
    $elm.on('click', function(e){
        let originalTarget = e.originalEvent.target;
        if(originalTarget.id === 'backRpBtn') return false;
        brick.view.back();
        return false;
    });

    // filterByKey 在不同的控制器内有不同的定义和功能
    scope.filterByKey = function (e, msg) {
        //$.icMsg(msg);
        brick.view.back();
        scope.emit('go_rp', msg);
    };


    // 对复盘数据replay进行处理优化
    function fixData (rpForm) {
        let result = {};

        for( let i in rpForm){

            let value = rpForm[i];

            let chain = i.split('.');

            (function fx (chain, result) {

                let k = chain.shift();

                let o = {};

                if (chain.length) {
                    o = result[k] = result[k] || o;
                    return fx(chain, o);
                }

                result[k] = value;

            })(chain, result);

        }
        result.week = window.getDayOfWeek(rpForm.date);
        console.log('replay fix => ', result);
        return result;
    }


}
