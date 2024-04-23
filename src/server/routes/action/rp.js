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
        // 不设为[], 则不会更新items数组项，客户端ajax也无法传输[]或''；
        if(data.items === undefined) {
            data.items = [];
        }
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
        let a = dob.get2(data.id);
        let b = dob.get2(data.dest);
        a.level = b.level * 1 + 1;
        dob.set(a);
        dob.move(data.id, data.dest);
        res.json(getData());
    }

}
