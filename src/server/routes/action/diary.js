/**
 *  交易日记
 * Created by j on 2019-10-01.
 */

import dob from '../../../libs/dob.js'

function getDb () {
    getDb.dob = getDb.dob || dob('diary');
    return getDb.dob;
}

function getData () {
    let dob = getDb();
    return dob.get();
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
    up (req, res) {
        let dob = getDb();
        let id = req.params.id;
        dob.move(id);
        res.json(getData());
    }

}
