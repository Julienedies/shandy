/**
 * Created by j on 18/5/26.
 * 调用百度ocr api 图片识别文字
 */

import https from 'https'
import qs from 'querystring'

import getToken from './get-baidu-token.js'

import config from './config'

let access_token = config.api.baidu.ocr.access_token;

/*
 * @param args Object 参数选项 args => { image: dataUrl, callback: Function  }
 * @param image  String   图片base64编码  or 图片file地址
 * @param callback Function  ocr回调函数，接受一个从图片识别出来的字符串参数
 */
export default function ocr (args) {

    let param = qs.stringify({
        'access_token': access_token
    })

    let postData = qs.stringify({
        image: args.image.replace('data:image/png;base64,', '')
    })

    let options = {
        hostname: 'aip.baidubce.com',
        //path: '/rest/2.0/ocr/v1/general_basic?' + param,
        path: '/rest/2.0/ocr/v1/webimage?' + param,
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    }

    let req = https.request(options, function (res) {

            let data = ''

            res.on('data', function (chunk) {
                data += chunk
            });

            res.on('end', function () {

                console.info(data)

                let obj = JSON.parse(data)

                if (obj.error_code === 111) { // 如果 access_token 过期

                    console.error(obj.error_msg)

                    getToken(function (token) {
                        access_token = token
                        ocr(args)
                    })

                    return

                }

                args.callback(obj.words_result_num && obj.words_result[0].words)

            })

        }
    )

    // 携带数据发送https请求
    req.write(postData)
    req.end()

}