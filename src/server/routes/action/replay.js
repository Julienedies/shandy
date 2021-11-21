/**
 * Created by j on 18/7/22.
 */

import dob from '../../../libs/dob.js'
import _tags from './tags.js'

const tags = _tags.tags;

let replay;

function initDb () {
    replay = replay || dob('replay');
    return replay;
}

function data () {
    return {replay: replay.get(), tags: tags.convert()};
}

export default {

    get: function (req, res) {
        initDb();
        res.json(data());
    },

    // 复盘
    post: function (req, res) {
        initDb();
        let obj = req.body;
        replay.set(obj);
        res.json(data());
    }

}
