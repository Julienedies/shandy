/**
 * Created by j on 18/5/26.
 * @todo 截屏
 */

import os from 'os'
import fs from 'fs'
import path from 'path'

import electron from 'electron'

const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;

function determineScreenShotSize () {
    const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);
    return {
        width: maxDimension * window.devicePixelRatio,
        height: maxDimension * window.devicePixelRatio
    };
}

/*
 * @param args {Object}  {returnType: String, crop: Object, callback: Function}
 * @param returnType  {String}   接受截图数据类型   'file' || '' 'dataUrl';  图片file地址  or  base64
 * @param crop  {Object}  对截图剪切  {x: 2372,y: 88, width: 200,height: 42}
 * @param callback {Function}   处理截屏图片数据回调函数
 */
export default function (args) {

    let thumbSize = determineScreenShotSize();
    let options = {types: ['screen'], thumbnailSize: thumbSize};

    desktopCapturer.getSources(options, function (error, sources) {

        if (error) {
            return console.log(error);
        }

        sources.forEach(function (source) {

            console.log(source);
            let img = source.thumbnail;

            if (source.name === 'Entire screen' || source.name === 'Screen 2') {

                if (args.crop) {
                    img = img.crop(args.crop);
                }

                if (args.returnType === 'file') {
                    let imgPath = path.join(os.tmpdir(), source.name + '.png');
                    fs.writeFile(imgPath, img.toPNG(), function (error) {
                        if (error) {
                            return console.log(error);
                        }
                        args.callback(imgPath);
                    })
                }

                if (args.returnType === 'dataUrl') {
                    let dataUrl = img.toDataURL();
                    args.callback(dataUrl);
                }

            }
        });
    });

}

