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
    /**
     * @param images   {Array} 图片对象数组
     * @returns {Array}
     */
    sort: function(images){

        var map = _.groupBy(images, function(o){
            return o.code;
        });

        var arr = _.values(map);

        arr.forEach(arr => {
            arr.sort(function (a, b) {
                return a.c - b.c;
            });
        });

        return _.flatten(arr, true);
    },

    get_images: function get_images(dir, is_only_path) {

        var arr = fs.readdirSync(dir);

        arr = arr.filter( f => {
            return /\.png$/img.test(f);
        });

        arr = arr.map( f => {
            let full_path = path.join(dir, f);
            let arr = f.match(/\d{6}(?=\.png$)/) || [];
            let code = arr[0];
            let stat = fs.statSync(full_path);
            arr = f.match(/\d{4}-\d{2}-\d{2}/) || [];
            return {f: full_path, c: stat.ctimeMs, d: arr[0], code: code};
        });

        arr = this.sort(arr);

        return !is_only_path ? arr : arr.map( o => {
            return o.f;
        });
    },

    crop_ocr: function (img_path, callback) {

        console.info('crop_ocr => ', img_path);

        let img = nativeImage.createFromPath(img_path);
        img = img.crop({x: 3140,y: 95, width: 310, height: 40});
        let dataUrl = img.toDataURL();
        console.info("%c", `border:solid 1px blue;padding:20px 150px; line-height:60px;background:url(${dataUrl}) no-repeat 0 0`);

/*        let file_name = img_path.split('/').pop();
        let file_path = path.join(os.tmpdir(), file_name.replace(/\.png$/,'___x.png'));
        console.log(file_path);
        fs.writeFile(file_path, img.toPNG(), function (error) {
            if (error) {
                return console.error(error);
            }
        });*/

        dataUrl && ocr({
            image: dataUrl,
            callback: callback || function(data){
                console.log(data);
            }
        });

    }
};