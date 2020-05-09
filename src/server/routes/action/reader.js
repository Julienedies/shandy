/**
 *
 * Created by j on 20/5/9.
 */

import dobFactory from '../../../libs/dob.js'
import jsonDb from '../../../libs/json-jo'
import userJodb from '../../../libs/user-jodb'

import createReaderHtml from '../../helper/createReaderHtml'

const readerDb = jsonDb('reader');
const readerJoDb = userJodb('reader', [], {joinType: 'push'});

function getDb () {
    getDb.dob = getDb.dob || dobFactory('logic');
    return getDb.dob;
}

function getData () {
    let dob = getDb();
    return dob.get();
}


export default {

    get (req, res) {
        let id = req.params.id;
        if (id) {
            let item = readerJoDb.get2(id);
            let name = item.name;
            let jo = readerDb(name);
            console.log(33, item, id, typeof id, jo.get());
            res.json(jo.get());
        } else {
            res.json(readerJoDb.get());
        }
    },

    post (req, res) {
        let obj = req.body;
        let name = obj.name;
        let text = obj.text;
        let jo = readerDb(name);

        readerJoDb.set({name});

        let htmlStr = '';
        text = text.replace(/^\s+$/img, '');
        let resultArr = text.match(/[^\r.;!。；！]+(?:[.;!]|[。；！]|[\r])/img);

        resultArr.map((item, index) => {
            console.log(index, item);
            htmlStr += `<i id="T_${ index }">${ item }</i>`;
        });

        jo.set({text: htmlStr});
        jo.save();
        res.json({name, html: htmlStr});
    },

    del (req, res) {
        let dob = getDb();
        let id = req.params.id;
        dob.remove(id);
        res.json(getData());
    },

}
