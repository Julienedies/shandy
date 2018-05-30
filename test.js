/**
 * Created by j on 18/5/27.
 */


const applescript = require('applescript');

applescript.execFile('./applescript/get_stock_name.scpt', function (err, result) {
    if (err) return console.error(err);
    console.log(result)
});