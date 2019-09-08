/**
 * 标签数据管理
 * Created by j on 18/7/22.
 */


import dob from '../../../libs/dob.js'

import viewerMap from '../../helper/viewerMap'
import _ from 'lodash'

let VIEWER_MAP = {};

const tagsJodb = dob('tags', {
    beforeGet: function (record, index) {
        let example = VIEWER_MAP[record.id];
        let oldExample = record['示例图片'];
        if (example) {
            if (oldExample) {
                let arr = _.concat(oldExample, example);
                record['示例图片'] = _.uniq(arr);
            } else {
                record['示例图片'] = example;
            }
        }
        return record;
    },
    convert: function () {
        let result = {};
        let list = this.get();
        list.map(function (item) {
            let type = item.type;
            let arr = result[type] = result[type] || [];
            arr.push(item);
        });
        Object.entries(result).forEach(([name, items]) => {
            items.sort((a, b) => {
                a = a.level || 0;
                b = b.level || 0;
                return b - a;
            })
        });
        return result;
    }
});

export default {

    tags: tagsJodb,

    get: function (req, res) {
        VIEWER_MAP = viewerMap.get();
        let type = req.params.type;
        let data = type ? tagsJodb.get(type, 'type') : tagsJodb.convert();
        res.json(data);
    },

    post: function (req, res) {
        let data = req.body;
        let type = data.type;
        tagsJodb.set(data);
        res.send(tagsJodb.convert());
    },

    del: function (req, res) {
        let id = req.params.id;
        tagsJodb.find(id, 'id').remove();
        res.send(tagsJodb.convert());
    }
}
