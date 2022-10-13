/**
 * Created by j on 18/7/22.
 */

import dob from '../../../libs/dob.js'
import _tags from './tags.js'

const tags = _tags.tags;

let replay;

function initDb () {
    replay = replay || dob('replay', {key: 'date'});
    return replay;
}

function getData (date) {
    let result = {};
    let list = replay.get();
    if (date) {
        let item = replay.get2(date, 'date');
        if (item) {
            result = item;
        } else {
            result = Object.assign({}, list[0]);
            result['date'] = date;
            delete result.id;
        }
    } else {
        result = list;
    }
    return result;
    //return {replay: vm, tags: tags.convert()};
}

export default {

    get: function (req, res) {
        initDb();
        let date = req.query.date || req.params.date;
        res.json(getData(date));
    },

    // 复盘
    post: function (req, res) {
        initDb();
        let obj = req.body;
        let date = obj.date;
        replay.set(obj);
        res.json(getData(date));
    },

    del (req, res) {
        initDb();
        let id = req.params.id;
        replay.remove(id, 'id');
        res.json(getData());
    },

}
