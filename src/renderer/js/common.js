/*!
 * Created by j on 2019-03-04.
 */

import eBridge from 'e-bridge'

import $ from 'jquery'
import brick from '@julienedies/brick'

brick.directives.reg('ic-select-path', {
    selfExec: true,
    once: true,
    fn: function ($elm) {
        $(document.body).on('click', '[ic-select-path]', function (e) {
            let $th = $(this)
            let filePaths = eBridge.select()
            let onDone = $th.icPp2('ic-select-path-on-done')
            // 如果选择的路径被回调处理, 并返回false, 则结束, 不用再为关联的input赋值
            if (onDone && onDone(filePaths) === false) return;
            let file = filePaths ? filePaths[0] : ($th.attr('ic-select-path-default') || '')
            // $th.find or $ 注意input的位置和ic-select-path绑定的dom节点
            $(`input[name="${ $th.attr('ic-select-path') }"]`).val(file)
        })
    }
});



