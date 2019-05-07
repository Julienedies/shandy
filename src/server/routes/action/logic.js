/**
 * Created by j on 18/7/28.
 */

import dob from '../../../libs/dob.js'

function getDb () {
    getDb.dob = getDb.dob || dob('logic');
    return getDb.dob;
}

function getData () {
    let dob = getDb();
    let arr = dob.get();

    arr.sort((a, b) => {
        a = a.level || 0;
        b = b.level || 0;
        return b - a;
    });
    return arr;
}


export default {

    get (req, res) {
        res.json(getData());
    },

    post (req, res) {
        let dob = getDb();
        let data = req.body;
        dob.set(data);
        res.json(getData());
    },

    del (req, res) {
        let dob = getDb();
        let id = req.params.id;
        dob.remove(id);
        res.json(getData());
    },

    // 提高level级别;
    focus (req, res) {
        let dob = getDb();
        let id = req.params.id;
        let record = dob.get(id);
        record.level = (record.level || 1) + 1;
        dob.set(record);
        res.json(getData());
    }
}
