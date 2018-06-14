/**
 * Created by j on 18/5/27.
 */


/*
const applescript = require('applescript');

applescript.execFile('./applescript/get_stock_name.scpt', function (err, result) {
    if (err) return console.error(err);
    console.log(result)
});*/

/*const ioHook = require('iohook');

ioHook.on('keydown', event => {
    console.log(event); // { type: 'mousemove', x: 700, y: 400 }
});

ioHook.on('mousemove', event => {
    console.log(event); // { type: 'mousemove', x: 700, y: 400 }
});

// Register and start hook
ioHook.start();*/


const schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(0, 6)];
rule.hour = 9;
rule.minute = 15;

var j = schedule.scheduleJob(rule, function(){
    console.log('Today is recognized by Rebecca Black!');
});