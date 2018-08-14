/**
 * Created by j on 18/8/12.
 */

const tdx = require('../../libs/tdx.js');

brick.reg('main_ctrl', function () {

    var scope = this;

    scope.view = function(e, code){
        tdx.view(code, 4);
    };

    var _ = require('underscore');
    var j = require('/Users/j/tdx/加速拉升.json');
    var z = require('/Users/j/tdx/主力买入.json');
    var t = require('/Users/j/tdx/沪深Ａ股20180811.json');
    console.info(z);
    console.info(j);
    console.info(t);

    j = j.map((v)=> {
        return v[0].replace('-自', '').split(',');
    });
    z = z.map((v)=> {
        return v[0].replace('-自', '').split(',');
    });
    let _j = j.map((v)=> {
        return v[1]
    });
    let _z = z.map((v)=> {
        return v[1];
    });
    let _t = t.map((v)=> {
        return v[1];
    });

    var zt = _.intersection(_z, _t);

    var jt = _.intersection(_j, _t);

    let model = [];

    t.map((v)=> {
        let arr = j.filter((o)=> {
            return o[1] == v[1];
        });
        model.push({t: v, xt: arr[0]});
    });


    scope.render('ls', model);

});