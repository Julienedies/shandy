/**
 * Created by j on 18/6/13.
 */

const schedule = require('node-schedule');

exports.voiceWarning = function (f) {

    let rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    rule.hour = 9;
    rule.minute = 5;
    return schedule.scheduleJob(rule, function () {
        console.log('schedule');
        f();
    });

};