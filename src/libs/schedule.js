/**
 * Created by j on 18/6/13.
 */

import schedule from 'node-schedule'

export default function (f, h, m) {

    let rule = new schedule.RecurrenceRule()
    rule.dayOfWeek = [0, new schedule.Range(1, 6)]
    rule.hour = h || 9
    rule.minute = m || 5
    return schedule.scheduleJob(rule, function () {
        console.log('schedule ', (new Date).toLocaleString())
        f()
    })

}