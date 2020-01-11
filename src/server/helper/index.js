/**
 *
 * Created by j on 2019-09-08.
 */
import pinyin from 'pinyin'
import _ from 'lodash'

import { VIEWER_MAP } from './viewerMap'

function beforeGet (record, index) {
    let example = VIEWER_MAP[record.id];
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


function sortByPinYin(arr){

}

export { beforeGet }
