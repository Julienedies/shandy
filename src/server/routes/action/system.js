/**
 *
 * Created by j on 2019-08-18.
 */

import dob from '../../../libs/dob.js'
import viewerMap, { beforeGet } from '../../helper/viewerMap'
import _tags from './tags'
import _ from 'lodash'

const tags = _tags.tags;

let systemJodb;

let VIEWER_MAP = {};

function getDb () {
    return systemJodb || dob('system', {
        beforeGet
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
