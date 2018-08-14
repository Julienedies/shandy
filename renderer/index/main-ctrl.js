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

let ip;

try {
    let networkInterfaces = os.networkInterfaces();
    ip = networkInterfaces.en0[0].address;
} catch (e) {
    console.info('ip address 获取失败. =>');
    console.error(e);
}


brick.controllers.reg('main_ctrl', function (scope) {

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
        //const shelljs = require('shelljs');
        //console.info(shelljs.which('jhandy'));

        var _ = require('underscore');
        var j = require('/Users/j/tdx/加速拉升.json');
        var z = require('/Users/j/tdx/主力买入.json');
        var t = require('/Users/j/tdx/沪深Ａ股20180811.json');
        console.info(z);
        console.info(j);
        console.info(t);

        j = j.map((v)=>{
            return v[0].replace('-自','').split(',');
        });
        z = z.map((v)=>{
            return v[0].replace('-自','').split(',');
        });
        let _j = j.map((v)=>{
            return v[1]
        });
        let _z = z.map((v)=>{
            return v[1];
        });
        let _t = t.map((v)=>{
            return v[1];
        });

        var zt = _.intersection(_z,_t);
        //console.table(zt)

        var jt = _.intersection(_j,_t);
        //console.table(jt)

        let model = [];

        t.map((v)=>{
            let arr = j.filter((o)=>{
                return o[1] == v[1];
            });
            arr[0] && console.table(arr);
            model.push({t:v, xt:arr[0]});
        });


        scope.render('ls', model);

    };

    this.view = function(e, code){
        tdx.show(code, 4);
    };

});