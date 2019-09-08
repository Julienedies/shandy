/**
 *
 * Created by j on 2019-09-08.
 */

import userJodb from '../../libs/user-jodb';

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

export { VIEWER_AMP }
