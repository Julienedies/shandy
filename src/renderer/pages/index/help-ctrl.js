/**
 * Created by j on 18/6/30.
 */

import os from "os"
import electron from 'electron'
const {remote,shell} = electron

import tdx from '../../../libs/tdx.js'

import cm from '../../../libs/console.js'

import $ from 'jquery'
import brick from '@julienedies/brick'

cm('log');

function get_ip(){
    let ip;
    try {
        let networkInterfaces = os.networkInterfaces();
        ip = networkInterfaces.en0[0].address;
    } catch (e) {
        console.error('ip address 获取失败. =>', e);
    }
    return ip;
}

let ip = get_ip();

brick.reg('help_ctrl', function (scope) {

    $('#ip').text(ip);

    this.relaunch = function () {
        remote.app.relaunch();
        remote.app.exit();
    };

    this.open = function () {
        let map = {
            gushenwei: `http://${ip}:2018/`,
            jhandy: `http://${ip}:3000/`
        };
        let id = $(this).data('id');
        shell.openExternal(map[id]);
    };

    this.show_ip = function(){
        ip = get_ip();
        console.info(ip);
        $('#ip').text(ip);
    };

    this.debug = function (){
        cm($(this).prop('checked'), 'log');
    };

    this.view = function(e, code){
        tdx.show(code, 4);
    };

    this.test = function (){
        //import shelljs from 'shelljs'
        //console.info(shelljs.which('jhandy'));
    };

});