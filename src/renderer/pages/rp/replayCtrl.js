/**
 *
 * Created by j on 2024/4/15.
 */

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
        scope.render('replay', {model});
    });



}
