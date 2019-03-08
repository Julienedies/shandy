/*!
 * Created by j on 2019-02-09.
 */

import userDb from '../../../libs/user-db'
import jo from '../../../libs/jsono'
import jhandy from 'jhandy'

import './style.scss'

import echarts from 'echarts'

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

import { a, b } from './ls'

const tradingDB = userDb('trading', [])
let tradingJson = JSON.parse(JSON.stringify(tradingDB.json))
tradingJson.reverse()


brick.reg('mainCtrl', function (scope) {
})

brick.reg('uploadTradingCtrl', function (scope) {

    scope.uploadTrading = function (fields) {
        let $th = $(this).icSetLoading()
        let {tradingFile} = fields
        let add = (data) => {
            console.log(data)
            tradingJson = tradingDB.json.concat(data)
            console.log(11, tradingJson.length)
            tradingJson = clean(tradingJson)
            console.log(22, tradingJson.length)
            tradingDB.json = tradingJson
            tradingDB.save()
            console.log(tradingJson.reverse())
            brick.emit('add-trading')
            $th.icClearLoading()
        }
        let clean = (arr) => {
            return _.uniqBy(arr, (item) => {
                return item[15]
            })
        }

        if (/\.txt$/.test(tradingFile)) {
            jhandy.csv(tradingFile, null, null, false).then(add)
        } else if (/\.json$/.test(tradingFile)) {
            let json = jo(tradingFile).json
            add(json)
        }
    }
})

brick.reg('reviewCtrl', function (scope) {
    let $chart = $('#chart')
    let $info = $('#info')

    let render = () => {
        scope.render('trading', {model: {data: tradingJson, index: [_.range(tradingJson[0].length)]}})
    }

    render()

    brick.on('add-trading', render)


    scope.viewKline = function (e, index) {
        let item = tradingJson[index]
        $info.text(JSON.stringify(item))

        let chart = echarts.init($chart[0]);
//////////////////////////////////////////////////////////////////////////

        chart.setOption(b());
///////////////////////////////////////////////////////////////////////
    }

})


//
brick.bootstrap()