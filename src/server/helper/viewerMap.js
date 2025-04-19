/**
 * 公用的辅助函数集合
 * Created by j on 2019-09-08.
 */

import _ from 'lodash'
import userJodb from '../../libs/jodb-user'
import imagesHelper from '../../renderer/pages/viewer/helper'
import ju from '../../libs/jodb-user'


/**
 * VIEWER_AMP 是以Tag ID作为键，对应一个图片数组；
 * example:
 * {'92893399': ['东方通 2019-09-11 下午10.35.27 -东方通-300379', '东信和平 2019-09-10 下午10.30.33 -东信和平-002017']}
 */

class ViewerMap {
    constructor () {

    }
    static getInstance () {
        return ViewerMap.instance;
    }
}

ViewerMap.VIEWER_MAP = {};

ViewerMap.instance = {
    // 默认使用缓存
    get: function () {
        let viewerMapJsonDb = ju('viewerMap', {});
        ViewerMap.VIEWER_MAP = viewerMapJsonDb.get();
        return ViewerMap.VIEWER_MAP;
    },
    get2: function () {
        return this.refresh();
    },
    // 强制更新
    refresh: function () {
        let VIEWER_MAP = ViewerMap.VIEWER_MAP = {};
        let viewerMapJsonDb = ju('viewerMap', {});
        let viewerJodb = userJodb('viewer');
        viewerJodb.get().forEach((item, index) => {
            let img = item.img;
            let system = item.system;
            let tags = item.tags;
            let f = (id, i) => {
                let arr = VIEWER_MAP[id] = VIEWER_MAP[id] || [];
                arr.push(img);
            };
            system && system.forEach(f);
            tags && tags.forEach(f);
        });
        for (let i in VIEWER_MAP) {
            let arr = VIEWER_MAP[i];
            VIEWER_MAP[i] = imagesHelper.sort(arr);
/*            arr.sort((a, b) => {
                //console.log(a, b);
                let ad = (a.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
                let bd = (b.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
                return new Date(bd) - new Date(ad);
            });*/
        }
        viewerMapJsonDb.init(VIEWER_MAP);
        return VIEWER_MAP;
    }
}


function beforeGet (record, index) {
    let example = ViewerMap.VIEWER_MAP[record.id];
    let oldExample = record['示例图片'];
    if (example) {
        if (oldExample) {
            let arr = _.concat(oldExample, example);
            record['示例图片'] = _.uniq(arr);
        } else {
            record['示例图片'] = example;
        }
    }
    return record;
}

export { beforeGet }

export default ViewerMap

