/**
 * Created by j on 18/5/23.
 * 获取百度ocr api access_token
 */

import https from 'https'
import qs from 'querystring'
import path from 'path'

import jo from './jsono'
import config from './config'

const param = qs.stringify(config.api.baidu.ocr.param)

export default function (callback) {

    https.get(
        {
            hostname: 'aip.baidubce.com',
            path: '/oauth/2.0/token?' + param,
            agent: false
        },
        function (res) {
            res.pipe(process.stdout)

            let data = ''

            res.on('data', function (chunk) {
                data += chunk
            });

            res.on('end', function () {
                let obj = JSON.parse(data)
                let access_token = obj.access_token

                callback && callback(access_token)

                // 更新config
                try {
                    let co = jo(path.resolve(config.ROOT_DIR, './config.json'))
                    co.json.api.baidu.ocr.access_token = access_token
                    co.save()
                } catch (e) {
                    console.log(e)
                    throw new Error('更新api.baidu.ocr.access_token出错!请手动更新!')
                }
            })

        }
    )

}