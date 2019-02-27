/**
 * Created by j on 18/8/16.
 * 从网页上获取股票信息
 */

const client = require('cheerio-httpcli');

client.set('gzip', true);
client.set('timeout', 5000);
client.set('headers', {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.34'
});

function fetch(code, html_id, callback){

    let html = require(`./${html_id}.js`);

    client.fetch(html.url(code), function (err, $, res, body) {

        let result = html.parse($);

        callback(result, html_id, code);

    });

}


fetch.SOURCE = ['ths_new', 'ths_p', 'ycj'];

module.exports = fetch;