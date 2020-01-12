/*!
 * Created by j on 2019-02-28.
 */

// babel-polyfill for async await 功能
import 'babel-polyfill'

import './index.html'
import './style.scss'

import fs from "fs"
import path from "path"

import _ from 'lodash'

import jhandy from 'jhandy'
import stocksManager from '../../../libs/stocks-manager'
import utils from '../../../libs/utils'
import jo from '../../../libs/jsono'
import stockJo from '../../../libs/stock-jo'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'


brick.set('cla.error', 'is-danger');
brick.set('ic-select-cla', 'is-info');

brick.reg('mainCtrl', function (scope) {

    let $elm = scope.$elm;
    let setting = utils.setting();
    let model = {...setting.json.csd, SOURCES: jhandy.fetch.SOURCES};
    let $log = $('#log');

    scope.csdPath = model.csdPath;
    scope.tdx_extern_user_file = model.tdx_extern_user_file;
    scope.tdxProps = ['概念', '概念y', '产品', '业务', '全名', '备注', '概念z'];

    console.log(model);

    scope.render('csd', {model}, () => {
        $log = $('#log');
    });

    // 数组合并去重， 主要用于处理stocks.json数据
    function merge (oldArr, newArr) {
        let map = {};
        let result = [];
        let f = (item, index) => {
            let code = item[0];
            map[code] = item[1];
        };
        oldArr.forEach(f);
        newArr.forEach(f);

        for (let i in map) {
            result.push([i, map[i]]);
        }
        return result;
    }

    // ------------------------------------------------------------------------------
    // 创建stocks.json
    this.createStocksJson = async function (fields) {
        console.log(fields)
        let $th = $(this).icSetLoading();
        setting.refresh().merge('csd', fields);

        let stockArr = await jhandy.csv(fields.stocksCsvFile, null, [0, 1], true);
        let stocksJo = jo(fields.stocksJsonFile, []);
        let oldSize = stocksJo.json.length;
        $th.icClearLoading();
        // 如果解析stockArr失败
        if (!Array.isArray(stockArr)) {
            console.err(stockArr);
            return utils.err('创建stocks.json失败,请重新尝试.');
        }

        // 合并stock
        stocksJo.json = merge(stocksJo.json, stockArr);
        stocksJo.save();
        // 更新股票列表管理器
        stocksManager.refresh();
        utils.msg(`共有股票 ${ stocksJo.json.length } 支. 新添加股票 ${ stocksJo.json.length - oldSize }`, 'OK');
    };

    // ------------------------------------------------------------------------------
    // fetch csd
    this.fetchErrorCount = 0;
    this.fetchStart = async function (fields) {
        console.log(fields);
        let $th = $(this).icSetLoading();
        setting.refresh().merge('csd', fields);

        let stockArr;
        // 如果是csv格式的txt文件, 先解析成json
        if (/\.txt$/.test(fields.fetchByStocks)) {
            stockArr = await jhandy.csv(fields.fetchByStocks, null, [0, 1], true);
        }

        jhandy.fetch(fields.csdPath, stockArr || fields.fetchByStocks, fields.fetchFromIndex, fields.fetchSources, (stat, err) => {
            console.log('fetch => ', stat.name, stat.index, err);
            $log.text(JSON.stringify(stat));
            if (err) {
                console.error(err);
                $th.icClearLoading();
                scope.fetchStop();
                scope.fetchErrorCount += 1;
                // 重新尝试
                if (scope.fetchErrorCount < 4) {
                    setTimeout(() => {
                        console.log('fetchStart again =>', scope.fetchErrorCount);
                        $th.click();
                    }, 9000);
                }
                return;
            }
            if (stat.over) {
                $th.icClearLoading();
                setting.refresh().set('csd.fetchFromIndex', 0);
            }
        });

    };

    this.fetchStop = function () {
        let stat = jhandy.fetch.stop();
        setting.refresh().set('csd.fetchFromIndex', stat.index);
        $('#fetchStartBtn').icClearLoading();
        $('#fetchFromIndex').val(stat.index);
    };

    // 重置fetch index
    this.resetFetchIndex = () => {
        $elm.find('#fetchFromIndex').val(0);
    };

    // ------------------------------------------------------------------------------
    // 创建通达信自定义数据文件
    this.createTdxFile = function (fields) {
        console.log(fields);
        let $th = $(this).icSetLoading();
        setting.refresh().merge('csd', fields);

        jhandy.tdx(fields.csdPath, fields.tdx_extern_user_file)
            .then(tdxFilePath => {
                $th.icClearLoading();
                utils.msg(`创建成功, 自定义数据文件预览: ${ tdxFilePath }.`);
                // utils.openItem(tdxFilePath);
            })
            .catch(err => {
                $th.icClearLoading();
                utils.err('自定义数据文件创建失败.');
                console.error(err);
            });
    };

    // ------------------------------------------------------------------------------
    // 热点分析; 获取每一个股票的相关概念，统计同概念数量最多的概念即为当前热点
    let hotPoints;  // 用于创建热点自定义数据
    this.findHot = async function (fields) {
        console.log(fields);
        let $th = $(this).icSetLoading();
        setting.refresh().merge('csd', fields);

        let keys = []; // 概念关键词
        let stockArr;
        // 如果是csv格式的txt文件, 先解析成json
        if (/\.txt$/.test(fields.hotCsvFile)) {
            stockArr = await jhandy.csv(fields.hotCsvFile, null, [0, 1], true);
        }
        console.log('findHot =>', stockArr.length);

        stockArr.forEach(([code, name]) => {
            let sjo = stockJo(code);
            let c1 = sjo.json['概念'].split(/[，]+\s*/img);
            //let c2 = sjo.json['概念y'].replace(/-\d+%/img,'').split(/[，]?\s+/img);
            let c3 = (sjo.json['概念z'] || '').split(/[，]?\s+/img);

            let arr = _.flatten([c1, c3]);
            keys.push(arr);
        });

        keys = _.flatten(keys);
        keys = _.compact(keys);
        console.log(keys);

        let resultArr = Object.entries(_.countBy(keys));
        resultArr = resultArr.filter(([name, count]) => {
            return count > 1;
        });
        resultArr.sort((a, b) => {
            return b[1] - a[1];
        });
        console.log(JSON.stringify(resultArr, null, '\t'));
        $th.icClearLoading();

        scope.render('hotResult', {vm: resultArr});
    };

    scope.onHotChange = function (msg) {
        $.icMsg(JSON.stringify(msg));
        hotPoints = msg.value;
    };

    scope.setHot = function () {
        let $th = $(this).icSetLoading();
        if (hotPoints) {
            jhandy.tdx(scope.csdPath, scope.tdx_extern_user_file, undefined, (tempFile, csdPath, stocks) => {
                let result = '';

                stocks.forEach(([code, name]) => {
                    let szh = /^6/.test(code) ? 1 : 0;
                    let sjo = jo(path.resolve(csdPath, `./s/${ code }.json`));
                    let concept = `${ sjo.get('概念') } ${ sjo.get('概念y') } ${ sjo.get('概念z') }`;
                    let hotStr = '';
                    hotPoints.forEach((point) => {
                        if(concept.search(point) > -1){
                            hotStr+= ' * ' + point;
                        }
                    });
                    if(hotStr){
                        result += [szh, code, 14, hotStr, '0.000'].join('|') + '\r\n';
                    }
                });

                console.log(result);

                // 附加热点自定义数据到整体自定义数据文件
                fs.writeFileSync(tempFile, result, {encoding: 'utf8', flag: 'a'});

            }).then(tdxFilePath => {
                $th.icClearLoading();
                utils.msg(`创建成功, 自定义数据文件预览: ${ tdxFilePath }.`);
                // utils.openItem(tdxFilePath);
            }).catch(err => {
                $th.icClearLoading();
                utils.err('自定义数据文件创建失败.');
                console.error(err);
            });

        }
    };

});


brick.bootstrap();
