/**
 * Created by j on 18/6/30.
 */

const os = require("os");
const electron = require('electron');
const remote = electron.remote;
const shell = electron.shell;

let ip;

try {
    let networkInterfaces = os.networkInterfaces();
    ip = networkInterfaces.en0[0].address;
} catch (e) {
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
    }

});