/*!
 * Created by j on 18/11/25.
 * 股票市场概念列表
 */

const sdob = require('../../libs/sdob.js');

const stocks = require(global.CSD_DIR + 'stocks.json');

module.exports = {

    get: function (req, res) {
        var concept = req.params.name;
        var result = [];
        stocks.forEach(function(v, i){
            let code = v[0];
            let dob = sdob(code);
            let data = dob.match(`概念详情.${concept}`);
            if(data){
                result.push({
                    code:code,
                    name: v[1],
                    text: data
                });
            }
        });

        res.json(result);
    }

};