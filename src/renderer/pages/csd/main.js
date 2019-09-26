/*!
 * Created by j on 2019-02-28.
 */

import 'babel-polyfill'

import jhandy from 'jhandy'
import stocksManager from '../../../libs/stocks-manager'
import utils from '../../../libs/utils'
import jo from '../../../libs/jsono'

import './index.html'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

brick.set('cla.error', 'is-danger');
brick.set('ic-select-cla', 'is-info')

brick.reg('mainCtrl', function (scope) {

    let setting = utils.setting()
    let model = {...setting.json.csd, SOURCES: jhandy.fetch.SOURCES}
    let $log = $('#log')

    console.log(model)

    scope.render('csd', {model}, () => {
        $log = $('#log')
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

    this.createStocksJson = async function (fields) {
        console.log(fields)
        let $th = $(this).icSetLoading();
        setting.merge('csd', fields).save();

        let stockArr = await jhandy.csv(fields.stocksCsvFile, null, [0, 1], true);
        let stocksJo = jo(fields.stocksJsonFile, []);
        let oldSize = stocksJo.json.length;
        $th.icClearLoading();
        // 如果解析stockArr失败
        if (!Array.isArray(stockArr)) {
            console.err(stockArr);
            return utils.err('创建stocks.json失败,请重新尝试.')
        }

        // 合并stock
        stocksJo.json = merge(stocksJo.json, stockArr);
        stocksJo.save();
        // 更新股票列表管理器
        stocksManager.refresh();
        utils.msg(`共有股票 ${ stocksJo.json.length } 支. 新添加股票 ${ stocksJo.json.length - oldSize }`, 'OK');
    };

    this.fetchErrorCount = 0;
    this.fetchStart = async function (fields) {
        console.log(fields)
        let $th = $(this).icSetLoading()
        setting.merge('csd', fields).save()

        let stockArr;
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
                setting.json.csd.fetchFromIndex = 0;
                setting.save();
            }
        });

    };

    this.fetchStop = function () {
        let stat = jhandy.fetch.stop()
        setting.json.csd.fetchFromIndex = stat.index
        setting.save()
        $('#fetchStartBtn').icClearLoading()
        $('#fetchFromIndex').val(stat.index)
    };

    this.createTdxFile = function (fields) {
        console.log(fields)
        let $th = $(this).icSetLoading()
        setting.merge('csd', fields).save()

        jhandy.tdx(fields.csdPath, fields.tdx_extern_user_file)
            .then(tdxFilePath => {
                $th.icClearLoading()
                utils.msg(`创建成功, 自定义数据文件预览: ${ tdxFilePath }.`)
                // utils.openItem(tdxFilePath)
            })
            .catch(err => {
                $th.icClearLoading()
                utils.err('自定义数据文件创建失败.')
                console.error(err)
            })
    };

});


brick.bootstrap();
