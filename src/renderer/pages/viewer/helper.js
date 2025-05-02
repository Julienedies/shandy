/*!
 * 图片浏览辅助工具函数
 * Created by j on 18/10/4.
 */

import fs from 'fs'
import path from 'path'

import glob from 'glob'
import moment from 'moment'

import electron from 'electron'

import _ from 'lodash'
import ocr from '../../../libs/baidu-ocr'
import stockQuery from '../../../libs/stock-query'

import ju from '../../../libs/jodb-user'
import jsonDb from '../../../libs/jsono-short'

const nativeImage = electron.nativeImage;
const viewerDbFactory = jsonDb('viewer');
// const imagesDbFactory = jsonDb('images');
const viewerJsonDb = ju('viewer');

// images.json 保存着个股图片的附加信息：股票代码、图片时间戳、图片日期，在viewer页面里主要起缓存作用，不用每次都通过图片名称对其解析代码和日期
const globalImagesJsonDb = ju('images', {});

export default {

    /**
     * 获取文件夹里的图片对象数组: imgObjArr
     * @param dir {String|Array} 文件夹路径 或 图片数组
     * @param [conf] {Boolean|Object} 图片对象是否只包含路径
     * @returns {Array} 图片数组  [{f:图片路径，c:图片创建时间戳，d:图片创建日期, code: 股票code}]
     */
    getImages: function (dir, conf = {isOnlyPath: false, isReverse: true, isRefresh: false, isOrigin: false}) {
        console.log('getImages => ', dir);
        let arr;
        // 测试是否是交易记录图片, 因为主要功能是浏览k线截图
        //  if (dir.indexOf('截图') === -1) {
        //      let files = glob.sync(path.join(dir, './*.+(jpg|png)')) || [];
        //      return files.map((path) => {
        //          return {f: path};
        //      })
        //  }

        // 首先尝试使用图片目录缓存
        //console.log(this.getDirKey(dir));
        let key = this.getDirKey(dir);
        if (conf.isReverse === false) {
            key = key + '_R';
        }
        let dirJo = viewerDbFactory(key);
        let cacheArr = dirJo.get();

        if (cacheArr && cacheArr.length && !conf.isRefresh && !conf.isOrigin) {
            console.log(`使用缓存=》${ key }`);
            arr = cacheArr;
        } else {
            arr = fs.readdirSync(dir);

            arr = arr.filter(f => {
                return /\.png$/img.test(f);
            });

            arr = this.supplement(arr, dir);

            if (conf.isOrigin) {
                return arr.sort((a, b) => {
                    // let a1 = +moment(a.d);
                    // let b1 = +moment(b.d);
                    return a.c - b.c;
                });
            }

            arr = this._sort(arr, conf.isReverse);

            dirJo.set(arr).save();
        }

        return !conf.isOnlyPath ? arr : arr.map(o => {
            return o.f;
        });
    },

    /**
     * 把文件目录路径转成一个字符串，用于缓存数据的文件名
     * @param dirPath
     * @returns {string}
     */
    getDirKey: function (dirPath) {
        console.log(dirPath);
        let arr = dirPath.split(/[\\/]+/img);
        let date = arr.pop();
        let name = arr.pop();
        if (name && date) {
            return `${ name }_${ date }`;
        } else {
            throw new Error(`no result for imageHelper.getDirKey => ${ dirPath }`);
        }
        //let key = dir.replace(/[/\s.\\:]+/img, '_');
    },

    /**
     * 缓存图片信息
     */
    cache: function () {
        let that = this;
        viewerJsonDb.each((item) => {
            let key = that.getKey(item.img);
            globalImagesJsonDb.set(key, item);
        });
    },

    /**
     * 根据图片路径，生成一个只包含图片名称的字符串，作为存储数据的键
     * @param imgPath
     * @returns {*}
     */
    getKey: function (imgPath) {
        /* let arr = imgPath.split(/[\]|[/]/img);
         console.log(imgPath, arr);*/
        return imgPath.split('/').pop().replace(/\s+|\./img, '_').replace(/_png$/, '');
    },

    /**
     * 获取缓存的图片额外数据（日期、时间戳），如果没有缓存，则首次生成
     * @param arr  图片对象数据 必选
     * @param dir  图片目录 可选
     * @returns {Array}
     */
    supplement: function (arr, dir = '') {
        // 使用局部目录imagesJsonDb 代替全局 globalImagesJsonDb，解决文件大小问题
        // 已经使用viewer替代images目录进行缓存
        //let imagesJsonDb = dir ? imagesDbFactory(this.getDirKey(dir)) : globalImagesJsonDb;

        return arr.map(f => {
            // 先尝试从缓存images读取
            let item;

            // 以下这段从缓存读取数据的代码会在生成viewerMap数据时造成内存溢出
            // let key = this.getKey(f);
            // item = imagesJsonDb.get(key);
            // if (item && item.c && item.d) return item;

            let fullPath = path.join(dir, f);
            let arr = f.match(/\d{6}(?=\.png$)/) || [];
            let code = arr[0];
            let f2 = f.replace('上午', 'am').replace('下午', 'pm');

            //console.log(f);

            let arr2 = f2.match(/(\d{4}-\d{2}-\d{2})\s*[ap]m\d{1,2}\.\d{1,2}\.\d{1,2}/);
            console.log(f2, arr2);
            let m = moment(arr2[0], "YYYY-MM-DD Ah.m.s");
            item = {f: fullPath, c: +m, d: arr2[1], code};
            // 保存到缓存
            //imagesJsonDb.set(key, item);
            return item;
        });
    },

    /**
     * 图片排序
     * @param arr 要排序的图片数组
     * @param isReverse  排序方式，默认为反转排序，即最新排在最前面
     * @param chunkSize {Number} 每次排序区块大小，默认为4
     * @param isMerge {Boolean}  是否合并相邻区块里的同一支股票
     * @returns {*[]} 返回排序过的数组
     */
    sort: function (arr, isReverse = true, chunkSize = 4, isMerge = true) {
        arr = this.supplement(arr);
        arr = this._sort(arr, isReverse, chunkSize, isMerge);
        return arr.map((item, i) => {
            return item.f;
        });
    },

    /**
     * 图片排序
     * @param images  {Array} imgObjArr 图片对象数组
     * @param isReverse [Bool] 是否反转排序
     * @param chunkSize {Number} 每次排序区块大小，默认为4
     * * @param isMerge {Boolean}  是否合并相邻区块里的同一支股票
     * @returns {Array} imgObjArr
     */
    _sort: function (images, isReverse, chunkSize, isMerge = true) {
        chunkSize = chunkSize || 4;
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
        //console.log('dateMap', dateMap);

        // 获取日期key数组，按照4个4个截取分组, 等于先按时间大致排序
        // [[{d:'2018-09-04'}, {d:'2018-09-05'},{d:'2018-09-06'} ,{d:'2018-09-07'}]]
        let dateKeyArr = _.keys(dateMap);
        //console.log('dateKeyArr', dateKeyArr);

        let dateKeyChunkArr = _.chunk(dateKeyArr, chunkSize);
        //console.log('dateKeyChunkArr', dateKeyChunkArr);

        let dateMap2 = {};
        dateKeyChunkArr.forEach((chunks, index) => {
            chunks.forEach((dateKey) => {
                let arr = dateMap[dateKey];
                let arr2 = dateMap2[index] = dateMap2[index] || [];
                dateMap2[index] = arr2.concat(arr);
            });
        });
        //console.log('dateMap2', dateMap2);

        let dateMapArr = _.values(dateMap2);
        //console.log('dateMapArr', dateMapArr);

        // 处理相邻日期chunk数组里相同code被分割在两个chunk数组里的情况，移动相同code的imgObj到同一个chunk数组
        if (isMerge) {
            _.reduceRight(dateMapArr, function (currentArr, prevArr) {
                //console.log(prevArr, currentArr);
                prevArr.forEach((imgObj, index) => {
                    for (let i = currentArr.length - 1; i >= 0; i--) {
                        let imgObj2 = currentArr[i];
                        if (imgObj2.code === imgObj.code) {
                            let arr = currentArr.splice(i, 1);
                            //console.log('xxxxx', arr);
                            prevArr.push(arr[0]);
                        }
                    }
                });
                return prevArr;
            });
        }


        let resultArr = [];

        for (let i = 0; i < dateMapArr.length; i++) {
            let imgArr = dateMapArr[i];
            imgArr = this._sortByCodeAndDate(imgArr);
            //console.log(111, imgArr);
            resultArr.push(imgArr);
        }

        resultArr = isReverse ? resultArr.reverse() : resultArr;
        return _.flatten(resultArr, true);
    },

    /**
     * 对imgObj数组按照相同code分组，在按日期排序;
     * @param images {Array} imgObjArr
     * @returns {Array} imgObjArr
     * @private
     */
    _sortByCodeAndDate: function (images) {
        // @step1: 按照code分组
        let map = _.groupBy(images, function (o) {
            return o.code;
        });
        // [[{code:'300012', d:'2018-09-07'}, {code:'300012', d:'2018-09-10'}], [{code:'600001', , d:'2018-04-10'}, {code:'600001', , d:'2018-04-11'}]]
        let arr = _.values(map);

        // @step2: 对code数组内部按日期排序
        arr.forEach(arr => {
            arr.sort(function (a, b) {
                return a.c - b.c;
            });
            let start = arr[0];
            let end = arr[arr.length - 1];
            if (start) start.start = 1;
            if (end) end.end = 1;
        });

        // @step3: 对code数组排序
        arr.sort(function (a, b) {
            return a[0].c - b[0].c;
        });

        return _.flatten(arr, true);
    },

    /**
     * 从图片剪切一小块区域，用于ocr
     * @param imgPath {String} 图片路径
     * @param crop {Object} 剪切区域定义  => {x: 3140, y: 115, width: 310, height: 50}
     * @returns {string} 图片dataUrl
     */
    crop: function (imgPath, crop) {
        console.info('crop => ', imgPath, crop);
        let img = nativeImage.createFromPath(imgPath);
        img = img.crop(crop);
        let dataUrl = img.toDataURL();
        console.info("%c", `border:solid 1px blue;padding:20px 240px; line-height:60px;background:url(${ dataUrl }) no-repeat 0 0`);
        return dataUrl;
    },

    /**
     * 根据ocr结果对图片重命名; // '屏幕快照 2019-03-22 下午9.08.59 -九阳股份-002242.png' 重命名到: '九阳股份 2019-03-22 下午9.08.59 -九阳股份-002242.png'
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
