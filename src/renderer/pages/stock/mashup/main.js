/**
 * Created by j on 18/8/13.
 */

import _ from 'lodash'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

brick.reg('main_ctrl', function(){

    let scope = this;
    let model = brick.utils.get_query();

    this.render('ajax', model, function(){
        $(this).find('[ic-ajax]').click();
    });

    this.done = function(data){
        console.info(data);
        scope.render('base', data);
        $(this).remove();
    }

});




brick.reg('ajax_ctrl', function(){






});
