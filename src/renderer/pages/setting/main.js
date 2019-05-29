/*!
 * Created by j on 2019-02-09.
 */

import './index.html'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

import bridge from 'e-bridge'

const setting = bridge.setting();

brick.reg('mainCtrl', function (scope) {

    if (!setting.json.warn) {
        setting.json.warn = {};
    }

    let model = setting.json

    this.render('setting', {model})

    this.onSelectRandomBgImgDirDone = (paths) => {
        let randomBgImgDir = paths[0]
        randomBgImgDir && setting.merge('warn', {randomBgImgDir}).save()
    }

});

brick.reg('setVoiceWarnTextCtrl', function (scope) {

    let $input = scope.$elm.find('[ic-form] input');

    let render = () => {
        let model = setting.json.voiceWarnText || {};
        scope.render('voiceWarnTextList', {model});
    };

    scope.save = function ({name, text}) {
        let o = {};
        o[name] = text;
        setting.merge('voiceWarnText', o).save();
        $input.val('');
        render();
    };

    scope.edit = function (e, name) {
        $input.filter('[ic-form-field="name"]').val(name);
        $input.filter('[ic-form-field="text"]').val(setting.json.voiceWarnText[name]);
        render();
    };

    scope.rm = function (e, name) {
        delete setting.json.voiceWarnText[name];
        setting.save();
        render();
    };

    render();
});

