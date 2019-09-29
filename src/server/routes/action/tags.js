/**
 * 标签数据管理
 * Created by j on 18/7/22.
 */

import dob from '../../../libs/dob.js'; // 功能类似jodb

import viewerMap, { beforeGet } from '../../helper/viewerMap'

const tagsJodb = dob('tags', {
    beforeGet,
    convert: function () {
        let tagsByTypeMap = {};
        let tagsByTypeMap2 = {};
        let list = this.get2();
        list.forEach(function (item) {
            let type = item.type;
            let arr = tagsByTypeMap[type] = tagsByTypeMap[type] || [];
            arr.push(item);
        });
        Object.entries(tagsByTypeMap).forEach(([name, items]) => {
            items.sort((a, b) => {
                a = a.level || 0;
                b = b.level || 0;
                return b - a;
            })
        });

        tagsByTypeMap.type.forEach((item, index) => {
            let tagType = item.text;
            tagsByTypeMap2[tagType] = tagsByTypeMap[tagType];
        });

        return tagsByTypeMap2;
    }
});

export default {

    tags: tagsJodb,

    get: function (req, res) {
        viewerMap.get();
        let type = req.params.type;
        let data = type ? tagsJodb.get2(type, 'type') : tagsJodb.convert();
        res.json(data);
    },

    post: function (req, res) {
        let obj = req.body;
        obj['示例图片'] = obj['示例图片'] || '';
        tagsJodb.set(obj);
        res.send(tagsJodb.convert());
    },

    del: function (req, res) {
        let id = req.params.id;
        tagsJodb.find(id, 'id').remove();
        res.send(tagsJodb.convert());
    }
}
