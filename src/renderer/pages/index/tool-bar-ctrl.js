/**
 * Created by j on 18/6/16.
 */

import electron from 'electron'

import $ from 'jquery'
import brick from '@julienedies/brick'

import Win from '../../../libs/window.js'

import tdx from '../../../libs/tdx'
import ac from '../../../libs/ac'
import rts from '../../../libs/real-time-stock'

import cm from '../../../libs/console'
import config from '../../../libs/config'
import getToken from '../../../libs/get-baidu-token'
import utils from '../../../libs/utils'
import setting from '../../../libs/setting'
import helper from '../viewer/helper'

const {remote, shell} = electron;
const {dialog} = electron.remote;


brick.reg('toolBarCtrl', function (scope) {

    this.showIp = function () {
        scope.$elm.find('#ip').text(utils.getIp());
    };

    this.showIp();

    this.view_403 = function () {
        tdx.keystroke('.403', true);
    };

    this.relaunch = function () {
        remote.app.relaunch();
        remote.app.exit();
    };

    this.quit = function () {
        remote.app.exit();
    };

    this.refresh = function (e) {
        location.reload();
    };

    this.openInWeb = function () {
        shell.openExternal(`http://127.0.0.1:${ config.SERVER_PORT }/web/stock_index.html`);
    };

    this.updateToken = function () {
        getToken();
    };

    this.renameByOcr = function (e) {
        let $th = $(this).icSetLoading();
        let dir = setting.get('viewer.MQ_DIR');
        let crop = setting.get('viewer.crop');
        let arr = helper.getImages(dir, {isOnlyPath: true});
        let str = '';
        helper.renameByOcr(arr, crop, (info) => {
            console.log(info);
            if (info !== null) {
                str += info.words;
            } else {
                $th.icClearLoading();
                $.icMsg(`OK! \r\n ${ str }`);
            }
        });
    };

    this.refreshViewer = function (e, reverse) {
        //console.log(reverse, typeof reverse); // 传来的0是string
        let $th = $(this).icSetLoading();
        $.get(`/viewer/refresh?x=${ +new Date }&reverse=${ reverse }`, function (data) {
            console.log(data);
            $.icMsg('refresh ok');
            $th.icClearLoading();
        });
    };


    /*    this.playWarnAudio = function () {
            let audio = new Audio(require('./audio/不要忘记那些恐惧和痛苦.mp3'));
            let $playWarnAudioBtn = scope.$elm.find('#playWarnAudioBtn i');
            let cla = 'icon-sound';

            clearInterval(scope.audioTimer);
            audio.volume = 1;

            if(scope.isPlayWarnAudio){
                audio.pause();
                audio.currentTime = 0;
                $playWarnAudioBtn.removeClass(cla);
            }else{
                audio.play();
                $playWarnAudioBtn.addClass(cla);
                scope.audioTimer = setInterval( () => {
                    audio.play();
                }, 1000 * 60 * 7);
            }

            scope.isPlayWarnAudio = !scope.isPlayWarnAudio;

        };

        utils.timer('9:00', () => {
            // 自动开启语音提醒
            scope.playWarnAudio();
        });*/

});
