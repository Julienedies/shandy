/*!
 * Created by j on 2019-03-04.
 */

import utils from '../../libs/utils'

import $ from 'jquery'
import brick from '@julienedies/brick'

window.TAGS_FILTER = ['交易错误','交易统计','交易风险','行情类型', '目标行情', '买点'];

brick.directives.reg('ic-select-path', {
    selfExec: true,
    once: true,
    fn: function ($elm) {
        $(document.body).on('click', '[ic-select-path]', function (e) {
            let $th = $(this);
            let isDir = $th.attr('ic-select-dir');
            console.log(isDir);
            let filePaths = isDir? utils.selectDir() : utils.select();
            let onDone = $th.icPp2('ic-select-path-on-done')
            console.log(onDone);
            let file = filePaths ? filePaths[0] : ($th.attr('ic-select-path-default') || '')
            $(`input[name="${ $th.attr('ic-select-path') }"]`).val(file)
            onDone && onDone(file)
            // 如果选择的路径被回调处理, 并返回false, 则结束, 不用再为关联的input赋值
            //if (onDone && onDone(file) === false) return;

            // $th.find or $ 注意input的位置和ic-select-path绑定的dom节点
            //$(`input[name="${ $th.attr('ic-select-path') }"]`).val(file)
        })
    }
});



