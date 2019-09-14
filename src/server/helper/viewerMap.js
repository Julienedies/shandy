/**
 * 公用的辅助函数集合
 * Created by j on 2019-09-08.
 */

import userJodb from '../../libs/user-jodb';
import _ from 'lodash'

/**
 * VIEWER_AMP 是以Tag ID作为键，对应一个图片数组；
 * example:
 * {'92893399': ['东方通 2019-09-11 下午10.35.27 -东方通-300379', '东信和平 2019-09-10 下午10.30.33 -东信和平-002017']}
 */
let VIEWER_AMP = {};

export default {
    get: function () {
        let viewerJodb = userJodb('viewer');
        VIEWER_AMP = {};
        viewerJodb.get().forEach((item, index) => {
            let img = item.img;
            let system = item.system;
            let tags = item.tags;
            let f = (id, i) => {
                let arr = VIEWER_AMP[id] = VIEWER_AMP[id] || [];
                arr.push(img);
            };
            system && system.forEach(f);
            tags && tags.forEach(f);
        });
        return VIEWER_AMP;
    }
}


function beforeGet (record, index) {
    let example = VIEWER_AMP[record.id];
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

export { VIEWER_AMP }
