/**
 * Created by j on 18/5/23.
 * 获取百度ocr api access_token
 */

const https = require('https');
const qs = require('querystring');

const config = require('../../config.json');

const co = require('./json-crud.js')('../config.json');

const param = qs.stringify(config.api.baidu.ocr.param);

module.exports = function(callback){

    https.get(
        {
            hostname: 'aip.baidubce.com',
            path: '/oauth/2.0/token?' + param,
            agent: false
        },
        function (res) {
            res.pipe(process.stdout);

            var data = '';

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                console.info(data);
                let obj = JSON.parse(data);
                let access_token = obj.access_token;

                callback(access_token);

                // 更新config
                co._json.api.baidu.ocr.access_token = access_token;
                co.save();
            });

        }
    );

};