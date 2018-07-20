/**
 * Created by j on 18/6/30.
 */

const os = require("os");
const electron = require('electron');
const remote = electron.remote;
const shell = electron.shell;

const cm = require('../../libs/console.js');
cm('log');

let ip;

try {
    let networkInterfaces = os.networkInterfaces();
    ip = networkInterfaces.en0[0].address;
} catch (e) {
    console.info('ip address 获取失败. =>');
    console.error(e);
}


brick.controllers.reg('main_ctrl', function () {

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

    this.debug = function (){
        cm($(this).prop('checked'), 'log');
    };

    this.test = function (){
        const shelljs = require('shelljs');
        console.log(shelljs.which('jhandy'));
    };

});