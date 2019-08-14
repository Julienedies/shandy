/**
 * Created by j on 18/7/28.
 */

import './style.scss'
import '../../css/common/common.scss'

import './index.html'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../js/common.js'

import Reader from '../../../libs/reader'

import jsonDb from '../../../libs/jsonDb'
import setting from '../../../libs/setting'
import userJodb from '../../../libs/user-jodb'

import createReaderHtml from './createReaderHtml'

brick.set('render.wrapModel', true)

const readerDb = jsonDb('reader');


brick.reg('uploadTextFileCtrl', function (scope) {

    const readerJoDb = userJodb('reader', []);

    const reader = new Reader('#readerBox');

    let $readerBox = $('#readerBox');

    let render = () => {
        scope.render('textList', readerJoDb.get())
    }

    readerJoDb.on('change', render);

    render();

    this.onSelectFileDone = (paths) => {
        if (!paths) return;
        let file = paths[0];

        let cb = (htmlStr) => {
            $readerBox.html(htmlStr);
            reader.init();
        }

        let name = file.split('/').pop().replace('.txt', '');
        console.log(name);
        let jo = readerDb(name);

        let record = readerJoDb.get(name, 'name')[0];
        if (record) {
            cb(jo.get('text'))
        } else {
            readerJoDb.add({name})
            createReaderHtml(file).then((htmlStr) => {
                cb(htmlStr);
                jo.set({text: htmlStr});
                jo.save();
            });
        }

    }


});


