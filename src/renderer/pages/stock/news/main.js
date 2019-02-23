/*!
 * Created by j on 18/9/20.
 */
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common.js'

brick.reg('news_ctrl', function(){

    var scope = this;

    this.done = function(data){
        scope.render('news', data);
    };

    this.removed = this.done;
});