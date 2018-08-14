/**
 * Created by j on 18/8/13.
 * 同花顺数据采集
 */

const fs = require('fs');
const client = require('cheerio-httpcli');

const Dob = require('./libs/dob.js');

String.prototype.j_trim = function(){
    return this.replace(/\s+/img, '');
};

// 同花顺动态页面解析 http://basic.10jqka.com.cn/000001/
function p1($){
    var $table = $('#profile table');
    var $td = $table.eq(0).find('td');
    var concept = $td.eq(2).text().replace('概念强弱排名：', '').replace('涉及概念：', '').replace('详情>>','').j_trim();
    var finance = $td.eq(3).text().replace('财务分析：', '').j_trim();
    var type = $table.eq(1).find('td').eq(3).text().replace('分类：', '').j_trim();
    return {
        '概念':concept,
        '财务':finance,
        '分类':type
    };
}

// 同花顺资料页面解析 http://basic.10jqka.com.cn/000001/company.html
function p2($){
    var $td = $('#detail td');
    var full_name = $td.eq(1).text().replace('公司名称：', '').j_trim();
    var position =  $td.eq(2).text().replace('所属地域：', '').j_trim();
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

client.set('gzip', true);
client.set('timeout', 5000);
client.set('headers', {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.34'
});


function fetch(list){
    let arr = list.shift();
    if(arr){
        let code = arr[0];
        let name = arr[1];
        console.info(code, name);

        client.fetch(`http://basic.10jqka.com.cn/${code}/`, function (err, $, res, body) {

            let op1 = p1($);

            client.fetch(`http://basic.10jqka.com.cn/${code}/company.html`, function (err, $, res, body) {

                console.info($('title').text());

                let op2 = p2($);
                let dob = Dob(code);
                let obj = {code: code, '名称': name};

                Object.assign(obj, op1, op2);

                dob.save(op1);

                setTimeout(function(){
                    fetch(list);
                }, ( Math.random() + 0.1 ) *  2000 );

            });

        });

    }
}


let list = [["600556","ST慧球"],['002564','天沃科技']];
//let list = require('./data/stocks.json');

fetch(list);
