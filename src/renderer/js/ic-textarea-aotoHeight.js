/**
 *
 * Created by j on 2024/9/2.
 * 没有使用,
 */

import $ from 'jquery'
import brick from '@julienedies/brick'

brick.directives.reg('ic-textarea-auto-height', {
    fn: function ($elm) {

        console.log('ic-textarea-auto-height', $elm);

        $elm.css('height', $elm[0].scrollHeight + 'px');

        $elm.on('input', function (e) {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

    }
});
