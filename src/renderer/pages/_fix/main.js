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
    this.fix = function(e) {
        const tagsJd = jd('tags');
        const rpJd = jd('rp');

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
    /*this.fix2 = function (e) {

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

        let diaryJd = jd('diary');

        // 示例使用
        const startDate = '2024-09-10'; // 你可以替换成任何日期
        const datesBetween = getDatesBetween(startDate);

        datesBetween.forEach(date => {
            let timestamp = date.getTime();
            let ymd = date.toISOString().split('T')[0];
            console.log(ymd, timestamp);

            diaryJd.add({
                date: ymd,
                timestamp: timestamp,
                tag: [],
                tags: [],
                text: '',
            })
        });
    }*/


    // 补全 replay.json,  补全复盘记录
    this.fix3 = function (e) {
        let jsonDb = jd('replay', {key: 'date'});

        let dateArray = jsonDb.get2();

        let currentDate = new Date(dateArray[0].date);
        let i = 0;
        let length = dateArray.length;

        while (currentDate >= new Date(dateArray[length - 1].date)) {
            console.log(i);
            // 排除周六和周日
            if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
                currentDate.setDate(currentDate.getDate() - 1);
                continue;
            }

            let date = new Date(dateArray[i].date);

            if (i < length && date.getTime() === currentDate.getTime()) {
                // 日期匹配，移动到下一个日期
                console.log('=', date.toLocaleDateString());
                i++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                // 找到插入位置
                let insertIndex = i;
                while (insertIndex < length && new Date(dateArray[insertIndex].date).getTime() > currentDate.getTime()) {
                    insertIndex++;
                }

                // 日期缺失，插入 currentDate
                let d = currentDate;
                let dt = d.toISOString().split('T')[0]
                let obj = {date: dt, timestamp: d.getTime() };
                console.log('+', dt)
                jsonDb.add(obj);
                dateArray.splice(insertIndex, 0, obj);
                length++; // 更新数组长度
                i++;
                currentDate.setDate(currentDate.getDate() - 1);
            }
        }

        console.table(dateArray.map((v, i) => {
            let date = v.date;
            return {date};
        }));

        let replayArr = jsonDb.get();
        replayArr.sort((a, b) => {
            let ad = new Date(a.date);
            let bd = new Date(b.date);
            return bd - ad;
        });

        jsonDb.save();
    }


});


brick.bootstrap();
