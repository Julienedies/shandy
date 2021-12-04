/**
 * review & plan
 * Created by j on 2021/12/4.
 */

import dob from '../../../libs/dob.js'

function getDb () {
    getDb.dob = getDb.dob || dob('rp');
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

    move (req, res) {
        let dob = getDb();
        let data = req.body;
        let id = data.id;
        let destId = data.dest;
        dob.move(id, destId);
        res.json(getData());
    }

}
