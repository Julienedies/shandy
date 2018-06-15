/**
 * Created by j on 18/6/15.
 */

brick.services.reg('rts-model', function(){

    return {
        prev:[], //上一次行情数据
        first:[], //第一次取得的行情数据
        current:[], //最新行情数据
        x:[]
    };

});