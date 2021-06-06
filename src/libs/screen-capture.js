/**
 * Created by j on 18/5/26.
 * @todo 截屏
 */

import os from 'os'
import fs from 'fs'
import path from 'path'

import electron from 'electron'
import moment from 'moment'

const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;

function determineScreenShotSize () {
    console.log(electron);
    const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);
    return {
        width: maxDimension * window.devicePixelRatio,
        height: maxDimension * window.devicePixelRatio
    };
}

function createDateStr () {
    let now = new Date();
    let str = now.toLocaleString().replace(/\//img, '-').replace(/[:]/img, '.');
    // 为单个日期数字添加前缀0
    let str2 = str.replace(/\d{4}-\d{1,2}-\d{1,2}/, moment(now).format('YYYY-MM-DD'));
    console.log(str2);
    return str2;
}

/*
 * @param args {Object}  {returnType: String, crop: Object, callback: Function}
 * @param returnType  {String}   接受截图数据类型   'file' || '' 'dataUrl';  图片file地址  or  base64
 * @param crop  {Object}  对截图剪切  {x: 2372,y: 88, width: 200,height: 42}
 * @param dir {String}  图片保存路径
 * @param callback {Function}   处理截屏图片数据回调函数
 * @param [options] {Object} 截屏选项
 */
export default function (args, options = {}) {

    //let thumbSize = determineScreenShotSize();  thumbnailSize: thumbSize
    options = Object.assign({types: ['screen'], thumbnailSize: {width: 3840, height: 2160}}, options);

    args = Object.assign({
        returnType: 'file',
        callback: (arg) => {
            console.log('screenCapture => ', arg);
        }
    }, args);

    desktopCapturer.getSources(options).then( sources => {

            sources.forEach(function (source) {

                console.info(source);
                console.info(os.tmpdir());

                let img = source.thumbnail;

                if (source.name === 'Screen 1') {

                    if (args.crop) {
                        img = img.crop(args.crop);
                    }

                    if (args.returnType === 'file') {
                        let dirPath = args.dir || os.tmpdir();
                        let dateStr = createDateStr();
                        let imgName = `屏幕快照 ${ dateStr } (2).png`;
                        let imgPath = path.join(dirPath, imgName);
                        fs.writeFile(imgPath, img.toPNG(), function (error) {
                            if (error) {
                                return console.error(error);
                            }
                            args.callback(imgPath);
                        });
                    }

                    if (args.returnType === 'dataUrl') {
                        let dataUrl = img.toDataURL();
                        args.callback(dataUrl);
                    }

                }
            });


    });


}

