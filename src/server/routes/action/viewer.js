/**
 * viewer.json 增删改查
 * Created by j on 20/1/26.
 */

import userJodb from '../../../libs/user-jodb'
import ViewerMap, { beforeGet } from '../../helper/viewerMap'

const viewerMap = ViewerMap.getInstance();  // 全局单例

const viewerJsonDb = userJodb('viewer');


export default {

    get (req, res) {
        let id = req.params.id;
        let [[key, value]] = Object.entries(req.query);
        let result = (key && value) ? viewerJsonDb.get(value, key) : viewerJsonDb.get(id);
        res.json(result);
    },

    post (req, res) {
        let item = req.body;
        viewerJsonDb.set(item);
        res.json(viewerJsonDb.get());
    },

    del (req, res) {
        let id = req.params.id;
        viewerJsonDb.remove(id);
        res.json(viewerJsonDb.get());
    },

    // 更新viewerMap.json
    refresh (req, res) {
        //let id = req.query.id;
        let reverse = req.query.reverse;
        //console.log(typeof reverse, req.query);
        viewerMap.refresh(reverse*1);
        res.json({msg: 'ok'});
    },

    // 为viewer.json绑定交易信息
    bindTradeInfo (req, res) {
        viewerMap.bindTradeInfo();
        res.json({msg: 'ok'});
    }

}
