/*!
 * Created by j on 2019-02-28.
 */

import './style.scss'

import electron from 'electron'

const {dialog} = electron.remote

import jhandy from 'jhandy'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import utils from '../../../libs/utils'

brick.set('cla.error', 'is-danger');
brick.set('ic-select-cla', 'is-info')

brick.directives.reg('ic-select-path', {
    selfExec: true,
    once: true,
    fn: function ($elm) {
        $(document.body).on('click', '[ic-select-path]', function (e) {
            let filePaths = utils.select()
            let file = filePaths[0]
            $(`input[name="${ $(this).attr('ic-select-path') }"]`).val(file)
        })
    }
})

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
        setting.merge('csd', fields).save()
        jhandy.csv(fields.stocksCsvFile, fields.stocksJsonFile, [0, 1], true)
            .then((stocks) => {
                console.log(stocks, $.tips)
                utils.msg(`创建股票 ${ stocks.length } 支.`, '创建成功')
            })
            .catch((err) => {
                utils.err(err)
                throw new Error(err)
            })
    }

    this.fetchStart = function (fields) {
        console.log(fields)
        setting.merge('csd', fields).save()
        let $th = $(this)
        try {
            $th.icSetLoading()
            jhandy.fetch(fields.csdPath, fields.fetchByStocks, fields.fetchFromIndex, fields.fetchSources, (stat) => {
                $log.text(JSON.stringify(stat))
            })
        } catch (err) {
            $th.icClearLoading()
            utils.err('error')
            console.error(typeof err, err)
        }
    }

    this.fetchStop = function () {
        let stat = jhandy.fetch.stop()
        setting.json.csd.fetchFromIndex = stat.index
        setting.save()
        console.log(stat)
        $('#fetchStartBtn').icClearLoading()
        $('#fetchFromIndex').val(stat.index)
    }

    this.createTdxFile = function (fields) {
        console.log(fields)
        setting.merge('csd', fields).save()
        try {
            let tdxFilePath = jhandy.tdx(fields.csdPath, fields.tdx_extern_user_file)
            if (tdxFilePath) {
                utils.msg(tdxFilePath, '创建成功')
                utils.open2(tdxFilePath)
            } else {
                utils.err('创建失败')
            }
        } catch (err) {
            utils.err('创建失败')
            console.error(err)
        }
    }

})


brick.bootstrap()