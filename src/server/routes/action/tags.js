/**
 * Created by j on 18/7/22.
 */

import dob from '../../../libs/dob.js'

const tags = dob('tags', {convert: function(){
    let result = {};
    let list = this.get();
    list.map(function(item){
        let type = item.type;
        let arr = result[type] = result[type] || [];
        arr.push(item);
    });
    return result;
}});

export default {

    tags: tags,

    get: function (req, res) {
        let type = req.params.type;
        let data = type ? tags.get(type, 'type') : tags.convert();
        res.json(data);
    },

    post: function (req, res) {
        let data = req.body;
        let type = data.type;
        tags.set(data);
        res.send(tags.convert());
    },

    del: function (req, res) {
        let id = req.params.id;
        tags.find(id, 'id').remove();
        res.send(tags.convert());
    }
}