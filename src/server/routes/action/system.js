/**
 *
 * Created by j on 2019-08-18.
 */

import _ from 'lodash'
import dob from '../../../libs/dob.js'
import _tags from './tags'

import ViewerMap, { beforeGet } from '../../helper/viewerMap'

const viewerMap = ViewerMap.getInstance();  // 全局单例

const tags = _tags.tags;

let systemJodb = dob('system', {
    beforeGet
});


function getData (reverse) {
    viewerMap.get(reverse);
    return {system: systemJodb.get2(), tags: tags.convert()};
}

export default {

    get (req, res) {
        let reverse = req.query.reverse;
        res.json(getData(reverse));
    },


    post (req, res) {
        let obj = req.body;
        obj['示例图片'] = obj['示例图片'] || '';
        systemJodb.set(obj);
        res.json(getData());
    },

    del (req, res) {
        let id = req.params.id;
        systemJodb.remove(id);
        res.json(getData());
    },

    move (req, res) {
        let id = req.params.id;
        let dest = req.params.dest;
        systemJodb.move(id, dest);
        res.json(getData());
    }
}
