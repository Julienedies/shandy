/*!
 * Created by j on 2019-02-28.
 */

// babel-polyfill for async await 功能
import 'babel-polyfill'

import './index.html'
import '../../css/common/common.scss'
import './style.scss'

import fs from 'fs'
import path from 'path'

import _ from 'lodash'

import jhandy from 'jhandy'
import utils from '../../../libs/utils'
import jo from '../../../libs/jsono'
import stockJo from '../../../libs/stock-jo'
import userDob from '../../../libs/jodb-user'
import stocksManager from '../../../libs/stocks-manager'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'
import jd from '../../../libs/jodb-data'

const tagsJd = jd('tags');
const rpJd = jd('rp');

brick.reg('mainCtrl', function () {

    this.fix = function(e) {
        if(window.confirm('确定执行操作，会对json数据做出修改，可能会损坏数据，注意提前备份数据')){

            //
            let result = tagsJd.get('rpmqs', 'type');
            console.log(result);
            let map = {};
            for(let i in result){
                let tag = result[i];
                map[tag.key] = tag.text;
            }

            console.log(map);

            rpJd.each((item) => {
                let oldType = item.type;
                item.type = map[oldType];
            });

            rpJd.save();
            console.log(rpJd.get());
        }
    };



});


brick.bootstrap();
