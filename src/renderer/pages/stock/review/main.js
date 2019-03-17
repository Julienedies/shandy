/*!
 * Created by j on 2019-03-17.
 */

import echarts from 'echarts'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import { initKOption, initMOption } from '../../../js/stock-chart'

import './style.scss'

brick.reg('mainCtrl', function (scope) {
    let $dayChart = $('#dayChart')
    let $tickChart = $('#tickChart')

    $dayChart.icSetLoading()
    $.getJSON('/csd/days?code=002230&day=20190315').done((data) => {
        $dayChart.icClearLoading()
        console.log(data)
        data.shift()
        data.reverse()
        data = data.map((v) => {
            return [v[0], v[3], v[4], v[5], v[6], v[7]]
        })
        let chart = echarts.init($dayChart[0]);
        chart.setOption(initKOption(data));
    })

})

brick.bootstrap()