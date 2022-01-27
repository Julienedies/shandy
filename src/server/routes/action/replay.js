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

function data (date) {
    let result = date ? replay.get2(date, 'date') : replay.get();
    return result ? result : {};
    //return {replay: vm, tags: tags.convert()};
}

export default {

    get: function (req, res) {
        initDb();
        let date = req.query.date || req.params.date;
        res.json(data(date));
    },

    // 复盘
    post: function (req, res) {
        initDb();
        let obj = req.body;
        let date = obj.date;
        replay.set(obj);
        res.json(data(date));
    }

}
