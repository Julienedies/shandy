/*!
 * Created by j on 18/6/16.
 * 截屏, 通过图片ocr识别通达信界面当前股票
 */

import capture from './screen-capture.js'
import ocr from './baidu-ocr.js'
import query from './stock-query.js'

export default function (f) {

    let start = +new Date();
    console.time('截图ocr');
    capture({
        returnType: 'dataUrl',
        crop: {x: 2500, y: 120, width: 280, height: 42},
        callback: function (dataUrl) {
            console.info("\n\n\n\n\n%c", `padding:50px 240px;background:url(${ dataUrl }) no-repeat 0 0`);
            ocr({
                image: dataUrl,
                callback: function (words) {
                    let stock = query(words)
                    console.info(`capture-ocr 耗时 : ${ (+new Date - start) / 1000 }秒 `)
                    console.timeEnd('截图ocr')
                    f(stock)
                }
            })
        }
    })

}

