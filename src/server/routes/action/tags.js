/**
 * 标签数据管理
 * Created by j on 18/7/22.
 */

import jodbData from '../../../libs/jodb-data'

import ViewerMap, { beforeGet } from '../../helper/viewerMap'

let viewerMap = ViewerMap.getInstance();   // 全局单例，服务器端

// notBeforeGet 表示不要使用beforeGet函数去填充图片数据
function getDb (notBeforeGet) {
    let _beforeGet = notBeforeGet ? null : beforeGet;

    return jodbData('tags', [], {
        beforeGet: _beforeGet,

        // 把tags数组转换成 map 结构
        convert: function () {
            let tagsByTypeMap = {};
            let tagsByTypeMap2 = {};
            let list = this.get2();
            list.forEach(function (item) {
                let type = item.type || '_null';
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
}




export default {

    // notBeforeGet 表示不填充图片数据
    getDb: function (notBeforeGet) {
        return getDb(notBeforeGet);
    },

    get: function (req, res) {
        viewerMap.get();
        let type = req.params.type;
        let notBeforeGet = req.query.notimg;
        let tagsJodb = getDb(notBeforeGet);
        let data = type ? tagsJodb.get2(type, 'type') : tagsJodb.convert();
        res.json(data);
    },


    post: function (req, res) {
        let obj = req.body;
        obj['示例图片'] = obj['示例图片'] || '';
        let tagsJodb = getDb();
        tagsJodb.set(obj);
        res.send(tagsJodb.convert());
    },


    del: function (req, res) {
        let id = req.params.id;
        let tagsJodb = getDb();
        tagsJodb.find(id, 'id').remove();
        res.send(tagsJodb.convert());
    }

}
