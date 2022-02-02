/**
 * 公用的辅助函数集合
 * Created by j on 2019-09-08.
 */

import moment from 'moment'
import _ from 'lodash'
import userJodb from '../../libs/user-jodb'
import imagesHelper from '../../renderer/pages/viewer/helper'
import ju from '../../libs/jodb-user'
import del from 'del'


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
        let VIEWER_MAP2 = {};
        let viewerMapJsonDb = ju('viewerMap', {});
        let viewerJodb = userJodb('viewer');

        const k = 'k_';

        console.log('refresh', +new Date);

        viewerJodb.get().forEach((item, index) => {
            let img = item.img;
            let system = item.system;
            let tags = item.tags;

            let f = (id, i) => {
                id = `${ k }${ id }`;
                let arr = VIEWER_MAP2[id] = VIEWER_MAP2[id] || [];
                arr.push(img);
            };

            system && system.forEach(f);
            tags && tags.forEach(f);
        });

        for (let i in VIEWER_MAP2) {
            if (['2087414', '3589400'].includes(i)) break;
            let arr = VIEWER_MAP2[i];
            try {
                //i = i.replace(k, '');
                VIEWER_MAP[i] = imagesHelper.sort(arr, true);
                delete VIEWER_MAP2[i];
            } catch (e) {
                console.log(6666666, i, e);
            }
        }
        viewerMapJsonDb.init(VIEWER_MAP);
        return VIEWER_MAP;
    }
}


function beforeGet (record, index) {
    let id = `k_${ record.id }`;
    let example = ViewerMap.VIEWER_MAP[id];
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

