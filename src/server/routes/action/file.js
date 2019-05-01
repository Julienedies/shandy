/**
 * 文件处理
 * Created by j on 2019-04-06.
 */
import path from 'path'
import glob from 'glob'

import config from '../../../libs/config'
import setting from '../../../libs/setting'

const randomBgImgDir = setting.get('warn.randomBgImgDir') || config.dir.randomBgImg;
let imgDir = path.join(randomBgImgDir, './**/*.+(jpg|png)');
let imgArr = [];

glob(imgDir, {}, (err, files) => {
    if (err) return console.error(err);
    imgArr = files || [];
})

export default {
    get (req, res) {
        let path = decodeURIComponent(req.query.path)
        res.sendFile(path)
    },
    random (req, res) {
        let index = Math.round(Math.random() * imgArr.length)
        let filePath = imgArr[index - 1]
        console.log(filePath)
        res.sendFile(filePath)
    },
}
