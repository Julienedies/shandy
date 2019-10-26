/*!
 * Created by j on 18/10/4.
 */

import fs from 'fs'
import path from 'path'
import os from 'os'

import glob from 'glob'
import moment from 'moment'

import electron from 'electron'

import _ from 'lodash'
import ocr from '../../../libs/baidu-ocr'
import stockQuery from '../../../libs/stock-query'

const nativeImage = electron.nativeImage;

export default {
    /**
     * @param images   {Array} 图片对象数组
     * @returns {Array}
     */
    sort: function (images) {

        // 先按时间排序
        images.sort((a, b) => {
            let a1 = +moment(a.d);
            let b1 = +moment(b.d);
            return a1 - b1;
        });

        // 按照日期分组
        let dateMap = _.groupBy(images, function (o) {
            return o.d;
        });

        // 获取日期key数组，按照3个3个截取分组
        let dateKeyArr = _.keys(dateMap);
        // 对日期key数组，按照4个4个截取分组
        let dateKeyChunkArr = _.chunk(dateKeyArr, 4);

        let dateMap2 = {};

        dateKeyChunkArr.forEach((chunks, index) => {
            chunks.forEach((dateKey) => {
                let arr = dateMap[dateKey];
                let arr2 = dateMap2[index] = dateMap2[index] || [];
                dateMap2[index] = arr2.concat(arr);
            });
        });

        let resultArr = [];
        let dateMapArr = _.values(dateMap2);

        for (let i = 0; i < dateMapArr.length; i++) {
            let imgArr = dateMapArr[i];
            imgArr = this._sortByCodeAndDate(imgArr);
            //console.log(imgArr);
            resultArr.push(imgArr);
        }

        //console.log(11, _.flatten(resultArr, true));
        return _.flatten(resultArr, true);

    },

    _sortByCodeAndDate: function (images) {
        let map = _.groupBy(images, function (o) {
            return o.code;
        });

        let arr = _.values(map);

        arr.forEach(arr => {
            arr.sort(function (a, b) {
                return a.c - b.c;
            });
        });

        arr.sort(function (a, b) {
            return a[0].c - b[0].c;
        });

        return _.flatten(arr, true);
    },

    getImages: function (dir, is_only_path) {
        console.log('getImages => ', dir)
        // 测试是否是交易记录图片
        if (dir.indexOf('截图') === -1) {
            let files = glob.sync(path.join(dir, './*.+(jpg|png)')) || []
            return files.map((path) => {
                return {f: path}
            })
        }

        let arr = fs.readdirSync(dir);

        arr = arr.filter(f => {
            return /\.png$/img.test(f);
        });

        arr = arr.map(f => {
            let full_path = path.join(dir, f);
            let arr = f.match(/\d{6}(?=\.png$)/) || [];
            let code = arr[0];
            let stat = fs.statSync(full_path);
            arr = f.match(/\d{4}-\d{2}-\d{2}/) || [];
            return {f: full_path, c: stat.birthtimeMs, d: arr[0], code: code};
        });

        arr = this.sort(arr);

        return !is_only_path ? arr : arr.map(o => {
            return o.f;
        });
    },

    crop: function (imgPath, crop) {
        console.info('crop => ', imgPath, crop);

        let img = nativeImage.createFromPath(imgPath);
        img = img.crop(crop);
        let dataUrl = img.toDataURL();
        console.info("%c", `border:solid 1px blue;padding:20px 240px; line-height:60px;background:url(${ dataUrl }) no-repeat 0 0`);
        return dataUrl;

        /*        let file_name = img_path.split('/').pop();
                let file_path = path.join(os.tmpdir(), file_name.replace(/\.png$/,'___x.png'));
                console.log(file_path);
                fs.writeFile(file_path, img.toPNG(), function (error) {
                    if (error) {
                        return console.error(error);
                    }
                });*/

    },

    /**
     * 根据ocr对图片重命名; // '屏幕快照 2019-03-22 下午9.08.59 -九阳股份-002242.png' 重命名到: '九阳股份 2019-03-22 下午9.08.59 -九阳股份-002242.png'
     * @param images  {Array|String} 图片文件绝对路径
     * @param crop   {Object}  {x: 3140, y: 115, width: 310, height: 50}
     * @param cb  {Function} 处理每一个图片crop的回调
     * @return {undefined}
     */
    renameByOcr: function (images, crop, cb) {
        let that = this;
        // 如果是单个图片路径字符串，转为数组
        if (!Array.isArray(images)) {
            images = [images]
        }

        (function fn (arr) {
            let imgPath = arr.shift();

            // 忽略富途大盘指数截图
            if (/\d{2}\.\d{2}\.png$/img.test(imgPath)) {
                return fn(arr);
            }

            // 图片数组重命名结束
            if (!imgPath) {
                //$(that).icClearLoading();
                //return scope.init();
                return cb(null);
            }
            // 已经ocr 重命名过的跳过
            if (imgPath.match(/\d{6}(?=\.png$)/)) {
                // '屏幕快照 2019-03-22 下午9.08.59 -九阳股份-002242.png' 重命名到: '九阳股份 2019-03-22 下午9.08.59 -九阳股份-002242.png'
                let rename = imgPath.replace(/^(.+)\/(屏幕快照)(\s+.+\s+)-(.+)-(\d{6}\.png)$/img, '$1/$4$3-$4-$5');
                if (imgPath !== rename) {
                    fs.renameSync(imgPath, rename);
                }
                return fn(arr);
            }

            // 裁剪预览
            let dataUrl = that.crop(imgPath, crop);
            //$view_crop.attr('src', dataUrl);

            // ocr 命名
            ocr({
                image: dataUrl,
                callback: function (words) {
                    //$ocr_text.text(words);
                    cb({dataUrl, words});
                    let stock = stockQuery(words);
                    if (stock.code) {
                        let rename = imgPath
                            .replace('屏幕快照', stock.name)
                            .replace('(2)', `-${ stock.name }`)
                            .replace(/\.png$/, `-${ stock.code }.png`);
                        fs.renameSync(imgPath, rename);
                    } else {
                        console.error('ocr fail: ', imgPath, stock);
                        return fn(arr);
                    }
                    setTimeout(function () {
                        fn(arr);
                    }, 1000);
                }
            });

        })(images);


    }


};
