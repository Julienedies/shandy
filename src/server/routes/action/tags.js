/**
 * Created by j on 18/7/22.
 */

const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const dob = require('../../libs/dob.js');

const tags = dob('tags', {convert: function(){
    var result = {};
    var list = this.get();
    list.map(function(item){
        let type = item.type;
        let arr = result[type] = result[type] || [];
        arr.push(item);
    });
    return result;
}});

module.exports = {

    tags: tags,

    get: function (req, res) {
        var type = req.params.type;
        var data = type ? tags.get(type, 'type') : tags.convert();
        res.json(data);
    },

    post: function (req, res) {
        var data = req.body;
        var type = data.type;
        tags.set(data);
        res.send(tags.convert());
    },

    del: function (req, res) {
        var id = req.params.id;
        tags.find(id, 'id').remove();
        res.send(tags.convert());
    }
};