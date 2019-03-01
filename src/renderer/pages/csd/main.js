/*!
 * Created by j on 2019-02-28.
 */

import electron from 'electron'

const {dialog} = electron.remote

import utils from '../../../libs/utils'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

brick.set('ic-select-cla', 'is-info')

brick.reg('mainCtrl', function (scope) {

    this.selectStockJsonFile = function (e) {
        let filePaths = dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
        let file = filePaths[0]
        $('[name="jsonFile"]').val(file)
    }

    this.fetchStart = function() {
        scope.fetchStop = utils.fetch('/Users/j/dev/shandy/data/csd')
    }

})

brick.bootstrap()