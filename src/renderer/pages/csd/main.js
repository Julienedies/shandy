/*!
 * Created by j on 2019-02-28.
 */

import jhandy from 'jhandy'
import utils from '../../../libs/utils'

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
    })

    this.createStocksJson = function (fields) {
        console.log(fields)
        let $th = $(this).icSetLoading()
        setting.merge('csd', fields).save()

        jhandy.csv(fields.stocksCsvFile, fields.stocksJsonFile, [0, 1], true)
            .then((stocks) => {
                console.log(stocks)
                $th.icClearLoading()
                utils.msg(`共创建股票 ${ stocks.length } 支.`, '创建成功')
            })
            .catch((err) => {
                console.error(err)
                $th.icClearLoading()
                utils.err('创建stocks.json失败,请重新尝试.')
            })

    }

    this.fetchStart = function (fields) {
        console.log(fields)
        let $th = $(this).icSetLoading()
        setting.merge('csd', fields).save()

        jhandy.fetch(fields.csdPath, fields.fetchByStocks, fields.fetchFromIndex, fields.fetchSources, (stat) => {
            $log.text(JSON.stringify(stat))
        })
            .then(stats => {
                $th.icClearLoading()
                setting.json.csd.fetchFromIndex = 0
                setting.save()
            })
            .catch(err => {
                console.error(typeof err, err)
                scope.fetchStop()
                utils.err('fetch出现错误, 请重新尝试.')
            })

    }

    this.fetchStop = function () {
        let stat = jhandy.fetch.stop()
        setting.json.csd.fetchFromIndex = stat.index
        setting.save()
        $('#fetchStartBtn').icClearLoading()
        $('#fetchFromIndex').val(stat.index)
    }

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

    }

})


brick.bootstrap()
