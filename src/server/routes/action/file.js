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
let captureDir = config.dir.captureImg;  //
let imgArr = [];

glob(imgDir, {}, (err, files) => {
    if (err) return console.error(err);
    imgArr = files || [];
})

export default {
    get (req, res) {
        let imgPath = decodeURIComponent(req.query.path);
        let fullPath = path.join(captureDir, imgPath);
        console.log(fullPath);
        res.sendFile(fullPath);
    },
    random (req, res) {
        let index = Math.round(Math.random() * imgArr.length);
        let fullPath = imgArr[index - 1];
        console.log(fullPath);
        res.sendFile(fullPath);
    },
}
