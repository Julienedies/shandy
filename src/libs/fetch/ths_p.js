/**
 * Created by j on 18/8/16.
 * 同花顺公司资料页面解析 http://basic.10jqka.com.cn/000001/company.html
 */

module.exports = {
    url: function(code){
        return `http://basic.10jqka.com.cn/${code}/company.html`;
    },
    parse: function($) {
        var $td = $('#detail td');
        var full_name = $td.eq(1).text().replace('公司名称：', '').j_trim();
        var position = $td.eq(2).text().replace('所属地域：', '').j_trim();
        var business = $td.eq(4).text().replace('所属行业：', '').j_trim();
        var industry = $td.eq(7).text().replace('主营业务：', '').j_trim();
        var product = $td.eq(8).text().replace('产品名称：', '').j_trim();
        return {
            '全名': full_name,
            '地域': position,
            '行业': business,
            '业务': industry,
            '产品': product
        };
    }
};
