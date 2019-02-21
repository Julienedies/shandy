/**
 * Created by j on 18/7/22.
 */

const dob = require('../../libs/dob.js');

const replay = dob('replay');

const tags = require('./tags.js').tags;

function data(){
    return {replay:replay.get(), tags: tags.convert()};
}

module.exports = {

    get: function (req, res) {
        res.json(data());
    },

    // 复盘
    post: function (req, res) {
        var obj = req.body;
        replay.set(obj);
        res.json(data());
    }

};