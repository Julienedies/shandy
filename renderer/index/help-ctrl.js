/**
 * Created by j on 18/6/30.
 */

const os = require("os");
const electron = require('electron');
const remote = electron.remote;

const shell = electron.shell;
const tdx = require('../../libs/tdx.js');

const cm = require('../../libs/console.js');
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


brick.controllers.reg('help_ctrl', function (scope) {

    $('#ip').text(get_ip());

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
        $('#ip').text(get_ip());
    };

    this.debug = function (){
        cm($(this).prop('checked'), 'log');
    };

    this.view = function(e, code){
        tdx.show(code, 4);
    };

    this.test = function (){
        //const shelljs = require('shelljs');
        //console.info(shelljs.which('jhandy'));
    };

});