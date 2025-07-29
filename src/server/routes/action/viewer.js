/**
 * viewer.json 增删改查
 * Created by j on 20/1/26.
 */

import jodbUser from '../../../libs/jodb-user'
import ViewerMap, { beforeGet } from '../../helper/viewerMap'
import imagesHelper from '../../../renderer/pages/viewer/helper'

const viewerMap = ViewerMap.getInstance();  // 全局单例

const getDB = function () {
    return jodbUser('viewer', [], { key: 'img' });
}


export default {

    get(req, res) {
        let id = req.params.id;
        let [[key, value]] = Object.entries(req.query);
        let viewerJsonDb = getDB();
        let result = (key && value) ? viewerJsonDb.get(value, key) : viewerJsonDb.get(id, 'id');
        res.json(result);
    },

    post(req, res) {
        let item = req.body;
        let viewerJsonDb = getDB();
        let result = viewerJsonDb.set(item);
        res.json(result);

        // 同时更新特定的目录数据
        let imgPath = item.img;
        let viewerCacheJo = imagesHelper.getViewerCacheJo(imgPath);
        let key = imagesHelper.getImgKey(imgPath);
        let value = { tags: item.tags, system: item.system, tradeInfo: item.tradeInfo };
        console.info(key ,value);
        viewerCacheJo.set(key, value);
    },

    del(req, res) {
        let id = req.params.id;
        let viewerJsonDb = getDB();
        viewerJsonDb.remove(id, 'id');
        res.json(viewerJsonDb.get());
    },

    // 更新viewerMap.json
    refresh(req, res) {
        let reverse = req.query.reverse;
        viewerMap.refresh(reverse);
        res.json({ msg: 'refresh tag&system ok' });
    },

    // 为viewer.json绑定交易信息
    bindTradeInfo(req, res) {
        viewerMap.bindTradeInfo();
        res.json({ msg: 'bindTradeInfo ok' });
    }

}
