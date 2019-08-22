/**
 *
 * Created by j on 2019-08-18.
 */

import dob from '../../../libs/dob.js'
import _tags from './tags'

const tags = _tags.tags;

let system;

function getDb () {
    return system || dob('system');
}

function getData () {
    system = getDb();
    return {system: system.get(), tags: tags.convert()};
}

export default {

    get (req, res) {
        res.json(getData());
    },

    post (req, res) {
        let obj = req.body;
        console.log(obj)
        system.set(obj);
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
