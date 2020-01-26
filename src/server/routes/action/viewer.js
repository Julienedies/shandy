/**
 * viewer.json 增删改查
 * Created by j on 20/1/26.
 */

import userJodb from '../../../libs/user-jodb'

const viewerJodb = userJodb('viewer');


export default {

    get (req, res) {
        let id = req.params.id;
        let [[key, value]] = Object.entries(req.query);
        let result = (key && value) ? viewerJodb.get(value, key) : viewerJodb.get(id);
        res.json(result);
    },

    post (req, res) {
        let item = req.body;
        viewerJodb.set(item);
        res.json(viewerJodb.get());
    },

    del (req, res) {
        let id = req.params.id;
        viewerJodb.remove(id);
        res.json(viewerJodb.get());
    },

}
