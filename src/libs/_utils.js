/**
 *
 * Created by j on 20/5/9.
 */

import moment from 'moment'

export default {
    /**
     * 是否是交易日; 周一至周五返回true
     * @returns {boolean}
     */
    isTradingDate () {
        let mo = moment();
        let day = mo.day(); // 礼拜几: 0 - 6
        return day > 0 && day < 6;
    },
    /**
     * 是否是交易时段
     * @returns {boolean}
     */
    isTradingTime () {
        let mo = moment();
        let h = mo.hour(); // 0 - 23
        return h > 5 && h < 15;
    },
    /**
     * 是否是A股交易时间
     * @returns {boolean}
     */
    isTrading () {
        let a = this.isTradingDate();
        let b = this.isTradingTime();
        return a && b;
    },
}
