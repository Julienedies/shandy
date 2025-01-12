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


brick.reg('mainCtrl', function () {

    //修改rp.json里item的type值
    /*
    const tagsJd = jd('tags');
    const rpJd = jd('rp');
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
    };*/


    // 修改diary.json, 补全里面缺少的日记记录
    const diaryJd = jd('diary');
    this.fix2 = function (e) {
        function getDatesBetween (startDate) {
            const dates = [];
            const currentDate = new Date(startDate);
            const today = new Date();

            // 去掉时间部分，只比较日期
            today.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            while (currentDate <= today) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return dates;
        }

// 示例使用
        const startDate = '2024-09-09'; // 你可以替换成任何日期
        const datesBetween = getDatesBetween(startDate);

        datesBetween.forEach(date => {
            console.log(date.toISOString().split('T')[0]);
        });


    }

});


brick.bootstrap();
