/**
 * Created by j on 18/8/26.
 */

import dobFactory from '../../../libs/dob.js'

function getDb () {
    getDb.dob = getDb.dob || dobFactory('note');
    return getDb.dob;
}

function getData () {
    let dob = getDb();
    return dob.get();
}

export default {

    get: function (req, res) {
        res.json(getData());
    },

    post: function (req, res) {
        let dob = getDb()
        let data = req.body;
        dob.set(data);
        res.json(getData());
    },

    del: function (req, res) {
        let dob = getDb()
        let id = req.params.id;
        let result = dob.remove(id);
        res.json(getData());
    },

    // 提高level级别;
    focus (req, res) {
        let dob = getDb();
        let id = req.params.id;
        let record = dob.get2(id);
        record.level = (record.level || 1) * 1 + 10;
        dob.set(record);
        res.json(getData());
    }
}
