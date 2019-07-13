/*!
 * Created by j on 2019-02-25.
 */

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'
import '@julienedies/brick/dist/brick.transition.js'

import '../../js/utils.js'

import electron from 'electron'
import utils from '../../../libs/utils'
import voice from '../../../libs/voice'
import warnText from '../../js/warn-text'

const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow

let win;
const socket = io();
const $body = $('body');

const show = () => {
    $body.css('opacity', 1).show();
};

const hide = () => {
    $body.css('opacity', 0).hide();
};

ipc.on('id', function (event, windowID, isFrameMode) {
    win = BrowserWindow.fromId(windowID);
    setTimeout(() => {
        isFrameMode && hide();
    }, 1000 * 4);
});

ipc.on('view', (e, view) => {
    brick.view.to(view);
});

/*utils.timer('9:26', () => {
    voice('早盘市场合力出结果。9点45分钟前完成平仓。必须设定止盈止损预案条件单。 遵守交易原则。');
});
utils.timer('9:35', () => {
    voice('9点45分钟前完成平仓！必须设定止盈止损预案条件单。 遵守交易原则。');
});
utils.timer('9:40', () => {
    voice('早盘市场合力出结果。除非涨停，否则9点45分钟前完成平仓。必须设定止盈止损预案条件单。 遵守交易原则。');
});*/

[
    ['9:05', '交易准备'],
    ['9:29', '竞价研判'],
    ['9:45', '早盘'],
].forEach((item) => {
    utils.timer(item[0], () => {
        //win.show();
        show();
        brick.view.to(item[1]);
    });
})


brick.reg('mainCtrl', function (scope) {

    const audioMap = {
        'daban': require(`./audio/daban-3.mp3`)
    };

    socket.on('warn', (info) => {
        let d = new Date()
        let h = d.getHours()
        let m = d.getMinutes()
        if (h === 9 && m > 15 && m < 45) {
            // return;
        }

        if (info === 'esc') {
            return hide();
        }

        //win.show();
        show();
        brick.view.to(info);

        let audio = new Audio(audioMap[info]);
        audio.volume = 1;
        audio.play();

        setTimeout(() => {
            hide();
        }, 1000 * 1);
    });

    $('[ic-view]').on('ic-view.active', function (e) {
        let str = $(this).find('li:first-child').text();
        //voice(str, () => {});

        setTimeout(() => {
            hide();
        }, 1000 * 7);

    });

});
