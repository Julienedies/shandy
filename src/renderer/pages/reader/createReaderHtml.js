/**
 *
 * Created by j on 2019-08-14.
 */

import fs from 'fs'
import jschardet from 'jschardet'
import iconv from 'iconv-lite'

function createReaderHtml (textFile) {

    return new Promise(function (resolve, reject) {

        fs.readFile(textFile, function (err, buffer) {
            if (err) return reject(err);

            // 检查文件编码
            let chartType = jschardet.detect(buffer).encoding;

            console.log(chartType);

            let str = iconv.decode(buffer, chartType);

            // 以标点符号分割文本
            //let resultArr = str.split(/(?=(?:[,.;!:]|[，。；！：]|[\r]))/img);

            let resultArr = str.match(/[^\r.;!。；！]+(?:[.;!]|[。；！]|[\r])/img);

            //console.log(resultArr);
            let htmlStr = '';
            resultArr.map((item, index) => {
                console.log(index, item);
                htmlStr += `<i id="T_${ index }">${ item }</i>`;
            });

            //console.log(htmlStr);
            resolve(htmlStr);

        });

    });


}

export default createReaderHtml;
