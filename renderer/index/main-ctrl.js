/**
 * Created by j on 18/6/30.
 */

const remote = require('electron').remote;


brick.controllers.reg('main_ctrl', function(){

    this.relaunch = function(){
        remote.app.relaunch();
        remote.app.exit();
    };

});