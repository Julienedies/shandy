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

const setting = bridge.setting()

brick.reg('mainCtrl', function(scope){

    if(!setting.json.warn){
        setting.json.warn = {}
    }

    let model = setting.json

    this.render('setting', {model})

    this.onSelectRandomBgImgDirDone = (paths) => {
        console.log(paths)
        let randomBgImgDir = paths[0]
        randomBgImgDir && setting.merge('warn', {randomBgImgDir}).save()
    }

})

brick.bootstrap()
