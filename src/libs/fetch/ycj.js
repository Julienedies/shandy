/**
 * Created by j on 18/8/16.
 * 云财经股票页面数据解析
 */

module.exports = {
    url: function(code){
        code = ( /^6/.test(code) ? 'sh' : 'sz' ) + code;
        return `http://www.yuncaijing.com/quote/${code}.html`;
    },
    parse: function($) {
        return {
            'ralate': $('.ralate').html(),
            'news': $('.tab-panel.active').html()
        }
    }
};