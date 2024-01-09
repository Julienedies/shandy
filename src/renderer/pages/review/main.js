/*
 * 股票交割单 Stock Exchange Lists
 * Created by j on 2019-02-09.
 */

import 'babel-polyfill'

import './style.scss'
import '../../css/custom-font/icon.scss'
import './index.html'

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import echarts from 'echarts'
import jhandy from 'jhandy'

import '../../js/common.js'

import createOpt from '../../js/stock-chart'
//import { a, b } from './ls'

import userDb from '../../../libs/jsono-user'
import jo from '../../../libs/jsono'
import csd from '../../../libs/csd'
import utils from '../../../libs/utils'

function sort (arr) {
    // 按交易时间进行排序
    arr.sort((a, b) => {
        let t1 = `${ a[0].replace(/^(\d{4})(\d{2})(\d{2})$/img, '$1/$2/$3') } ${ a[1] }`;
        let t2 = `${ b[0].replace(/^(\d{4})(\d{2})(\d{2})$/img, '$1/$2/$3') } ${ b[1] }`;
        return (new Date(t2)) - (new Date(t1));
    });
}

const tradingDb = userDb('SEL', []);
let tradingJson = JSON.parse(JSON.stringify(tradingDb.json));
//sort(tradingJson);

/*const tjo = userDb('trading', []);
let tjoArr = JSON.parse(JSON.stringify(tjo.json));
tradingDb.json = tjoArr.map( (v) => {
    return [v[0],v[1],v[3],v[4],v[5],v[6],v[7],v[8],v[9],v[10],v[11],v[12],v[13],v[14]];
});
tradingDb.save();*/

brick.reg('mainCtrl', function (scope) {});

brick.reg('uploadTradingCtrl', function (scope) {

    function add (data) {
        console.log(data);
        tradingJson = tradingDb.json.concat(data);
        console.log(11, tradingJson.length);
        tradingJson = clean(tradingJson);
        sort(tradingJson);
        console.log(22, tradingJson.length);
        tradingDb.json = tradingJson;
        tradingDb.save();
    }

    function clean (arr) {
        return _.uniqBy(arr, (item) => {
            return item[13];  // 交易id, 用于区分每一次交易
        });
    }


    scope.uploadTrading = function (fields) {
        let $th = $(this).icSetLoading();
        let {tradingFile} = fields;
        let cb = (data) => {
            add(data);
            brick.emit('add-trading');
            $th.icClearLoading();
        };

        if (/\.txt$/.test(tradingFile)) {
            jhandy.csv(tradingFile, null, [0,1,3,4,5,6,7,8,9,10,11,12,13,14], false).then(cb);
        } else if (/\.json$/.test(tradingFile)) {
            let json = jo(tradingFile).json;
            cb(json);
        }
    }
});

brick.reg('reviewCtrl', function (scope) {
    let $elm = scope.$elm;
    let $info = $('#info');
    let $dayChart = $('#dayChart');
    let $tickChart = $('#tickChart');

    let render = () => {
        $elm.icSetLoading();
        tradingJson[0] && scope.render('trading', {model: {data: tradingJson, index: [_.range(tradingJson[0].length)]}}, () => {
            $elm.icClearLoading();
        });
    };

    render();

    brick.on('add-trading', render);

    scope.reverse = () => {
        tradingJson.reverse();
        render();
    };

    async function tickChart(opt){
        let {code, day} = opt;
        let data = await csd.getTick({code, day});
        console.info(data);
        let chart = echarts.init($tickChart[0]);
        chart.setOption(createOpt.initMOption(data));
    }

    async function dayChart(opt){
        let {code, day} = opt;
        $dayChart.icSetLoading();
        let data = await csd.getDay({code, day});
        $dayChart.icClearLoading();
        console.log(data);
        data.shift();
        data.reverse();
        data = data.map((v) => {
            return [v[0], v[3], v[4], v[5], v[6], v[7]];
        });
        let chart = echarts.init($dayChart[0]);
        chart.setOption(createOpt.initKOption(data));
    }

    scope.viewKline = function (e, index) {
        let arr = tradingJson[index];
        let code = arr[2];
        let day = arr[0];
        scope.code = code;
        scope.index = index;
        $info.text(JSON.stringify(arr));
        setTimeout( () => {
            dayChart({code, day});
            tickChart({code, day});
        }, 3000);
    };

    scope.viewInFtnn = function (e) {
        utils.viewInFtnn(scope.code);
    };

});


//
brick.bootstrap();
