/**
 *
 * Created by j on 2019-08-18.
 */


import jodbData from '../../../libs/jodb-data'
import tags from './tags'

import ViewerMap, { beforeGet } from '../../helper/viewerMap'

const viewerMap = ViewerMap.getInstance();  // 全局单例

//const tags = _tags.tags;

/*let systemJodb = dob('system', {
    beforeGet
});*/

let getTagsDb = function () {
    return tags.getDb();
}

let getDb = function () {
    return jodbData('system', [],{beforeGet});
}


function getData (reverse) {
    viewerMap.get(reverse);
    let systemJodb = getDb();
    let tagsDb = getTagsDb();
    return {system: systemJodb.get2(), tags: tagsDb.convert()};
}

export default {

    get (req, res) {
        let reverse = req.query.reverse;
        res.json(getData(reverse));
    },


    post (req, res) {
        let obj = req.body;
        obj['示例图片'] = obj['示例图片'] || '';
        let systemJodb = getDb();
        systemJodb.set(obj);
        res.json(getData());
    },

    del (req, res) {
        let id = req.params.id;
        let systemJodb = getDb();
        systemJodb.remove(id);
        res.json(getData());
    },

    move (req, res) {
        let id = req.params.id;
        let dest = req.params.dest;
        let systemJodb = getDb();
        systemJodb.move(id, dest);
        res.json(getData());
    }
}
