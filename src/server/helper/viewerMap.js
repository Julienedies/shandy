/**
 * 公用的辅助函数集合
 * Created by j on 2019-09-08.
 */

import moment from 'moment'
import _ from 'lodash'
import jsonDb from '../../libs/json-jo'
import userJodb from '../../libs/user-jodb'
import imagesHelper from '../../renderer/pages/viewer/helper'
import ju from '../../libs/jodb-user'


const viewerMapDbFactory = jsonDb('viewerMap');


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
    get: function (isReverse) {
        let f = isReverse ? 'viewerMap_r' : 'viewerMap';
        let viewerMapJsonDb = ju(f, {});
        ViewerMap.VIEWER_MAP = viewerMapJsonDb.get();
        return ViewerMap.VIEWER_MAP;
    },
    get2: function (isReverse) {
        return this.refresh(isReverse);
    },
    // 强制更新
    // 首页toolbar 调用
    // 因为默认排序方式为true， 所以isReverse为undefined时，其实为true，
    refresh: function (reverse) {
        let isReverse = reverse === 0;
        let f = isReverse ? 'viewerMap_r' : 'viewerMap';
        let VIEWER_MAP = ViewerMap.VIEWER_MAP = {};
        let VIEWER_MAP2 = {};
        let viewerMapJsonDb = ju(f, {});
        let viewerJodb = userJodb('viewer');

        const KPR = 'k_';

        // 遍历viewer.json，生成以tags Id 和system Id 为key的map
        viewerJodb.get().forEach((item, index) => {
            let img = item.img;
            let system = item.system;
            let tags = item.tags;

            let f = (id, i) => {
                id = `${ KPR }${ id }`;
                let arr = VIEWER_MAP2[id] = VIEWER_MAP2[id] || [];
                arr.push(img);
            };

            system && system.forEach(f);
            tags && tags.forEach(f);
        });

        //console.log('以上代码不会造成内存溢出',VIEWER_MAP2);
        let q = 0;
        for (let i in VIEWER_MAP2) {
            let arr = VIEWER_MAP2[i];

            //if (['k_3312753', 'k_1305484', 'k_2055992', k_6734208].includes(i)) break;
            console.log(q++, '---', i, '---',arr.length, '---', arr[0]);

            VIEWER_MAP[i] = imagesHelper.sort(arr, !isReverse);

            delete VIEWER_MAP2[i];
        }

        viewerMapJsonDb.init(VIEWER_MAP);
        console.log('viewerMap OK!');
        return VIEWER_MAP;
    },

    // 反转排序显示
    reverse: function () {

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

