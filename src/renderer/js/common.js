/*!
 * Created by j on 2019-03-04.
 */

import utils from '../../libs/utils'

import $ from 'jquery'
import brick from '@julienedies/brick'

brick.directives.reg('ic-select-path', {
    selfExec: true,
    once: true,
    fn: function ($elm) {
        $(document.body).on('click', '[ic-select-path]', function (e) {
            let $th = $(this)
            let filePaths = utils.select()
            let file = filePaths ? filePaths[0] : ( $th.attr('ic-select-path-default') || '')
            $(`input[name="${ $th.attr('ic-select-path') }"]`).val(file)
        })
    }
})