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

const tradingDb = userDb('trading', [])
let tradingJson = JSON.parse(JSON.stringify(tradingDb.json))
sort(tradingJson)

function add (data) {
    console.log(data)
    tradingJson = tradingDb.json.concat(data)
    console.log(11, tradingJson.length)
    tradingJson = clean(tradingJson)
    sort(tradingJson)
    console.log(22, tradingJson.length)
    tradingDb.json = tradingJson
    tradingDb.save()
}

function sort(arr){
    arr.sort((a, b) => {
        let t1 = `${a[0].replace(/^(\d{4})(\d{2})(\d{2})$/img, '$1/$2/$3')} ${a[1]}`
        let t2 = `${b[0].replace(/^(\d{4})(\d{2})(\d{2})$/img, '$1/$2/$3')} ${b[1]}`
        return (new Date(t1)) - (new Date(t2))
    })
}

function clean (arr) {
    return _.uniqBy(arr, (item) => {
        return item[15]
    })
}


brick.reg('mainCtrl', function (scope) {
})

brick.reg('uploadTradingCtrl', function (scope) {

    scope.uploadTrading = function (fields) {
        let $th = $(this).icSetLoading()
        let {tradingFile} = fields
        let cb = (data) => {
            add(data)
            brick.emit('add-trading')
            $th.icClearLoading()
        }

        if (/\.txt$/.test(tradingFile)) {
            jhandy.csv(tradingFile, null, null, false).then(cb)
        } else if (/\.json$/.test(tradingFile)) {
            let json = jo(tradingFile).json
            cb(json)
        }
    }
})

brick.reg('reviewCtrl', function (scope) {
    let $elm = scope.$elm
    let $chart = $('#chart')
    let $info = $('#info')

    let render = () => {
        $elm.icSetLoading()
        tradingJson[0] && scope.render('trading', {model: {data: tradingJson, index: [_.range(tradingJson[0].length)]}}, () =>{
            $elm.icClearLoading()
        })
    }

    render()

    brick.on('add-trading', render)

    scope.reverse = () => {
        tradingJson.reverse()
        render()
    }

    scope.viewKline = function (e, index) {
        let item = tradingJson[index]
        $info.text(JSON.stringify(item))

        let chart = echarts.init($chart[0]);
//////////////////////////////////////////////////////////////////////////

        chart.setOption(a());
///////////////////////////////////////////////////////////////////////
    }

})


//
brick.bootstrap()