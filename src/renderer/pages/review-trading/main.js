/*!
 * Created by j on 2019-02-09.
 */

import './style.scss'

import echarts from 'echarts'

import userDb from '../../../libs/user-db'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

import {a,b} from './ls'

const tradingJson = userDb('trading').get()

brick.reg('mainCtrl', function(scope){

})

brick.reg('uploadTradingCtrl', function(scope){
    scope.uploadTrading = function(fields){

    }
})

brick.reg('reviewCtrl', function (scope) {
    let $chart = $('#chart')
    let $info = $('#info')

    scope.render('trading', tradingJson)

    scope.viewKline = function(e, index){
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