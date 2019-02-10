/*!
 * Created by j on 18/10/4.
 */

import fs from 'fs'
import path from 'path'
import os from 'os'

import electron from 'electron'

import _ from 'lodash'

const nativeImage = electron.nativeImage;

export default {
    /**
     * @param images   {Array} 图片对象数组
     * @returns {Array}
     */
    sort: function (images) {

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

    get_images: function get_images (dir, is_only_path) {

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

    crop: function (img_path, crop) {
        console.info('crop => ', img_path, crop);

        let img = nativeImage.createFromPath(img_path);
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

    }

};