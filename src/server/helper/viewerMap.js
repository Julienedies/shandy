/**
 * 公用的辅助函数集合
 * Created by j on 2019-09-08.
 */

import _ from 'lodash'
import imagesHelper from '../../renderer/pages/viewer/helper'
import ju from '../../libs/jodb-user'
import userJo from '../../libs/jsono-user'



/**
 * 主要用于管理viewerMap.json数据
 * 全局单例模式
 */
class ViewerMap {
    constructor () {
    }

    // 单例模式
    static getInstance () {
        return ViewerMap.instance;
    }
}

/**
 * ViewerMap.VIEWER_AMP是一个对象， 是以Tag ID 或 system ID 作为键，对应一个相关的图片数组；
 * 比如严重亏损交易记录的所有图片， 比如所有热点龙头2024的所有图片
 * example:
 * {'92893399': ['东方通 2019-09-11 下午10.35.27 -东方通-300379', '东信和平 2019-09-10 下午10.30.33 -东信和平-002017']}
 */
ViewerMap.VIEWER_MAP = {};


ViewerMap.instance = {
    // 默认使用缓存
    get: function (isReverse) {
        let f = isReverse * 1 === 1 ? 'viewerMap_R' : 'viewerMap';
        console.log(1111, isReverse, f);
        let viewerMapJsonDb = ju(f, {});
        ViewerMap.VIEWER_MAP = viewerMapJsonDb.get();
        return ViewerMap.VIEWER_MAP;
    },

    //
    get2: function (isReverse) {
        return this.refresh(isReverse);
    },


    /**
     * 一次性更新viewerMap.json 和 viewerMap_R.json
     * @param reverse {0 || undefined} 本质是一个布尔值
     */
    refresh: function (reverse) {
        let that = this;
        this._refresh(0);
        setTimeout(()=> {
            that._refresh();
        }, 900);

    },

    // 强制更新viewerMap.json
    // 首页toolbar 调用
    // 因为默认排序方式为true， 所以isReverse为undefined时，其实为true，
    _refresh: function (reverse) {
        let isReverse = reverse === 0;
        console.log(isReverse);
        let f = isReverse ? 'viewerMap_R' : 'viewerMap';
        let VIEWER_MAP = ViewerMap.VIEWER_MAP = {};
        let VIEWER_MAP2 = {};
        let viewerMapJsonDb = ju(f, {});
        let viewerJodb = ju('viewer');

        const KPR = 'k_';

        // 遍历viewer.json，生成以tags Id 和system Id 为key的map
        viewerJodb.get().forEach((item, index) => {
            let img = item.img;
            let system = item.system;
            let tags = item.tags;

            let f = (id, i) => {
                id = `${ KPR }${ id }`;
                let arr = VIEWER_MAP2[id] = VIEWER_MAP2[id] || [];
                arr.push(img);
            };

            system && system.forEach(f);
            tags && tags.forEach(f);
        });

        //console.log('以上代码不会造成内存溢出',VIEWER_MAP2);
        let q = 0;
        for (let i in VIEWER_MAP2) {
            let arr = VIEWER_MAP2[i];

            //if (['k_3312753', 'k_1305484', 'k_2055992', k_6734208].includes(i)) break;
            //console.log(q++, '---', i, '---', arr.length, '---', arr[0]);

            VIEWER_MAP[i] = imagesHelper.sort(arr, !isReverse, 4, true);

            delete VIEWER_MAP2[i];
        }

        // 强制更新，objm init 会触发change事件
        viewerMapJsonDb.init(VIEWER_MAP);
        console.log(`${ f } ok!`);
        //return VIEWER_MAP;
    },

    // 为viewer.json里的img项绑定交易记录，主要是在tags页面查看各种统计标签方便查看当时的交易记录
    // 如果图片没有添加标签，那就不会添加到viewer.json， 也就不会添加交易记录
    bindTradeInfo: function () {

        let tradeArr = userJo('SEL', []).get(); // 交易记录json
        let viewerJodb = ju('viewer', []);  // 记录图片绑定的各种标签json

        // 直接遍历所有项，并修改数据
        viewerJodb.each((item, i) => {
            let d = item.d; // 日期
            let code = item.code;
            let tradeInfo = item.tradeInfo;  // 默认是空字符串
            let fullPath = item.img;

            if (tradeInfo && tradeInfo.length > 0) return; // 已经附加交易信息
            if (!(/交易记录/img.test(fullPath))) return; // 如果不是交易记录图片，不用附加交易信息

            if (!d || !code) {
                let arr = fullPath.match(/\d{6}(?=\.png$)/) || [];
                code = arr[0];
                let f2 = fullPath.replace('上午', 'am').replace('下午', 'pm');

                let arr2 = f2.match(/(\d{4}-\d{2}-\d{2})\s*[ap]m\d{1,2}\.\d{1,2}\.\d{1,2}/);
                //console.log(f2, arr2);
                d = arr2[1];

                //console.log(fullPath, i);

                item.d = d;
                item.code = code;
            }

            tradeInfo = tradeArr.filter(arr => {
                // 交易信息 对应 code 和 时间
                return code === arr[2] && d && d.replace(/-/g, '') === arr[0];
            });

            console.log(fullPath, tradeInfo);

            item.tradeInfo = tradeInfo.map(a => {
                return [a[1], a[4], a[6], a[5]];  // => 时间, 买入/卖出, 数量, 价格
            });
            item.tradeInfo = item.tradeInfo.reverse();

        });

        // 保存
        viewerJodb.save();
    },

}


/**
 *
 * @param record
 * @param index
 * @return {*}
 */
function beforeGet (record, index) {
    let id = `k_${ record.id }`;
    let example = ViewerMap.VIEWER_MAP[id];
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
}




export { beforeGet }

export default ViewerMap

