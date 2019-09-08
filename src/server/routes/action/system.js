/**
 *
 * Created by j on 2019-08-18.
 */

import dob from '../../../libs/dob.js'
import viewerMap from '../../helper/viewerMap'
import _tags from './tags'
import _ from 'lodash'

const tags = _tags.tags;

let systemJodb;

let VIEWER_MAP = {};

function getDb () {
    return systemJodb || dob('system', {
        beforeGet: function (record, index) {
            record.id === '6053312' && console.log(+new Date(), VIEWER_MAP, +new Date());
            let example = VIEWER_MAP[record.id];
            let oldExample = record['示例图片'];
            record.id === '6053312' && example && console.log('beforeGet => ', example, oldExample);
            if (example) {
                if (oldExample) {
                    let arr = _.concat(oldExample, example);
                    record['示例图片'] = _.uniq(arr);
                } else {
                    record['示例图片'] = example;
                }
            }
            return record;
        },
    });
}

function getData () {
    VIEWER_MAP = viewerMap.get();
    systemJodb = getDb();
    return {system: systemJodb.get(), tags: tags.convert()};
}

export default {

    get (req, res) {
        res.json(getData());
    },

    post (req, res) {
        let obj = req.body;
        console.log(obj)
        systemJodb.set(obj);
        res.json(getData());
    },

    del (req, res) {
        let dob = getDb();
        let id = req.params.id;
        dob.remove(id);
        res.json(getData());
    },

    move (req, res) {
        let dob = getDb();
        let id = req.params.id;
        let dest = req.params.dest;
        dob.move(id, dest);
        res.json(getData());
    }
}
