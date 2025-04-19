/**
 * viewer.json 增删改查
 * Created by j on 20/1/26.
 */

import jodbUser from '../../../libs/jodb-user'
import ViewerMap, { beforeGet } from '../../helper/viewerMap2'

const viewerMap = ViewerMap.getInstance();  // 全局单例

const getDB = function () {
    return jodbUser('viewer', [], {key: 'img'});
}


export default {

    get (req, res) {
        let id = req.params.id;
        let img = req.query.img;

        if (img) {
            let viewerJsonDb = getDB();
            let result = viewerJsonDb.get2(img, 'img');
            res.json(result);
        } else {
            res.json('缺少img参数');
        }

    },


    post (req, res) {
        let item = req.body;
        let viewerJsonDb = getDB();
        let img = item.img;
        viewerJsonDb.set(item);
        res.json(viewerJsonDb.get(img, 'img'));
    },

    del (req, res) {
        let id = req.params.id;
        let viewerJsonDb = getDB();
        viewerJsonDb.remove(id, 'id');
        res.json(viewerJsonDb.get());
    },

    // 更新viewerMap.json
    refresh (req, res) {
        let reverse = req.query.reverse;
        viewerMap.refresh(reverse);
        res.json({msg: 'refresh tag&system ok'});
    },

    // 为viewer.json绑定交易信息
    bindTradeInfo (req, res) {
        viewerMap.bindTradeInfo();
        res.json({msg: 'bindTradeInfo ok'});
    }

}
