/**
 * Created by j on 18/8/13.
 */

const fs = require('fs');

const Dob = require('./libs/dob.js');


function main(list){

    let file_name = 'tdx.txt';

    fs.writeFileSync(file_name, '');

    fs.open(file_name, 'a', function(err, fd){
        if(err){
            return console.error(err);
        }

        list.forEach(function(arr, i){
            let code = arr[0];
            let dob = Dob(code);
            let szh = /^6/.test(code) ? 1 : 0;
            let concept =  dob.get('概念').replace(/[，]/img, '  ')+ '  ' + dob.get('行业').replace(/^.+[—]/,'-') + '  ';
            let arr2 = [szh, code, concept, '0.000'];
            fs.writeSync(fd, arr2.join('|') + '\r\n');
            console.info(i);
        });

        fs.close(fd);

    });
}


let list = require('./data/stocks.json');
//let list = [["000001","平安银行"],['002564','天沃科技']];

main(list);