/*!
 * Created by j on 18/10/4.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const electron = require('electron');
const nativeImage = electron.nativeImage;

const _ = require('underscore');

const ocr = require('../../libs/baidu-ocr.js');


module.exports = {
    get_images: function get_images(dir) {

        var arr = fs.readdirSync(dir);

        arr = arr.filter(function (f) {
            return /\.(png|jpg|gif)$/img.test(f);
        });

        arr = arr.map(function (f) {
            let arr = f.match(/\d{6}(?=\.png$)/);
            let code = arr[0];
            f = path.join(dir, f);
            let stat = fs.statSync(f);
            return {f: f, c: stat.ctimeMs, code: code};
        });

        var map = _.groupBy(arr, function(item){
            return item.code;
        });

        var arr2 = _.values(map);

        arr2.forEach(arr => {
            arr.sort(function (a, b) {
                return a.c - b.c;
            });
        });

        arr = _.flatten(arr2, true);

        return arr.map(function (v) {
            return v.f;
        });

    },

    crop_ocr: function (img_path, callback) {
        console.info('crop_ocr => ', img_path);
        let img = nativeImage.createFromPath(img_path);
        img = img.crop({x: 3140,y: 95, width: 310, height: 40});

/*        let file_name = img_path.split('/').pop();
        let file_path = path.join(os.tmpdir(), file_name.replace(/\.png$/,'___x.png'));
        console.log(file_path);
        fs.writeFile(file_path, img.toPNG(), function (error) {
            if (error) {
                return console.error(error);
            }
        });*/

        let dataUrl = img.toDataURL();
        console.info("%c", `border:solid 1px blue;padding:20px 150px; line-height:60px;background:url(${dataUrl}) no-repeat 0 0`);

        ocr({
            image: dataUrl,
            callback: callback || function(data){
                console.log(data);
            }
        });

    }
};