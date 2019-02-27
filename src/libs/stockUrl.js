/**
 * Created by j on 18/6/4.
 * 股票资料页面url管理
 */

/**
 * @param code {String} 股票代码
 * @param flag {Number} url映射
 */
export default function (code, flag) {
    let prefix_code = (/^6/.test(code) ? 'sh' : 'sz') + code;
    let url;

    switch (flag) {
        case 0 :
            return `http://localhost:3000/web/stock_c.html?code=${ code }`;
        case 1 :
            return 'http://basic.10jqka.com.cn/*/company.html'.replace('*', code);
        case 2 :
            return 'http://basic.10jqka.com.cn/*/'.replace('*', code);
        case 3 :
            return 'http://www.yuncaijing.com/quote/*.html'.replace('*', prefix_code);
        case 4 :
            return 'http://www.yuncaijing.com/quote/*.html'.replace('*', prefix_code);
        case 5 :
            return 'http://www.yuncaijing.com/quote/*.html'.replace('*', prefix_code);
        case 6 :
            return 'http://www.yuncaijing.com/quote/*.html'.replace('*', prefix_code);
        case 7 :
            return 'http://www.yuncaijing.com/quote/*.html'.replace('*', prefix_code);
        default :
            return 'http://basic.10jqka.com.cn/*/'.replace('*', code);
    }
}