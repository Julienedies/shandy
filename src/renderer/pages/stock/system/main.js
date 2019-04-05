/*!
 * Created by j on 2019-02-22.
 */
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

brick.reg('systemCtrl', function(scope){

})

brick.reg('setSystemCtrl', function (scope) {

    scope.setSystem = (fields) => {
        console.log(fields)
    }

})
