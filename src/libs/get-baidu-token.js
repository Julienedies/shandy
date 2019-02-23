/**
 * Created by j on 18/5/23.
 * 获取百度ocr api access_token
 */

import https from 'https'
import qs from 'querystring'

import config from '../../config.json'

import jsonCrud from './json-crud'

const co = jsonCrud('../config.json');

const param = qs.stringify(config.api.baidu.ocr.param);

export default function (callback) {

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

}