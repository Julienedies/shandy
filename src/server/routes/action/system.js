/**
 *
 * Created by j on 2019-08-18.
 */


import jodbData from '../../../libs/jodb-data'

import ViewerMap, { beforeGet } from '../../helper/viewerMap'

import tags from './tags'

const viewerMap = ViewerMap.getInstance();  // 全局单例

//const tags = _tags.tags;

/*let systemJodb = dob('system', {
    beforeGet
});*/

// tags 数据， 图片可选
let getTagsDb = function (notBeforeGet) {
    return tags.getDb(notBeforeGet);
}

// system + 图片数据
let getDb = function (notBeforeGet) {
    let _beforeGet = notBeforeGet ? null : beforeGet;
    return jodbData('system', [],{beforeGet:_beforeGet});
}

// system + 图片数据 + tags + 图片数据
function getData (reverse) {
    viewerMap.get(reverse);
    let systemJodb = getDb();
    let tagsDb = getTagsDb();
    return {system: systemJodb.get2(), tags: tagsDb.convert()};
}


// system数据 + tags数据， 没有图片数据
function getData2 (reverse) {
    viewerMap.get(reverse);
    let systemJodb = getDb(true);
    let tagsDb = getTagsDb(true);
    return {system: systemJodb.get2(), tags: tagsDb.convert()};
}



export default {

    // 全部数据： system+图片数据， tags+图片数据
    get (req, res) {
        let reverse = req.query.reverse;
        res.json(getData(reverse));
    },

    // 不包含图片数据： system， tags
    get2 (req, res) {
        let reverse = req.query.reverse;
        res.json(getData2(reverse));
    },


    post (req, res) {
        let obj = req.body;
        obj['示例图片'] = obj['示例图片'] || '';
        let systemJodb = getDb();
        let result = systemJodb.set(obj);
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
