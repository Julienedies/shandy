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

import jsonDb from '../../../libs/json-jo'
import setting from '../../../libs/setting'
import userJodb from '../../../libs/jodb-user'

import createReaderHtml from './createReaderHtml'

brick.set('render.wrapModel', true)


brick.reg('uploadTextFileCtrl', function (scope) {

    const readerDb = jsonDb('reader');
    const readerJoDb = userJodb('reader', [], {joinType: 'push'});

    const reader = new Reader('#readerBox');

    let $readerBox = $('#readerBox');

    let init = (htmlStr) => {
        $readerBox.html(htmlStr);
        reader.init();
    }

    this.onSelectFileDone = (paths) => {
        if (!paths) return;
        let filePath = paths[0];

        let name = filePath.split('/').pop().replace('.txt', '');

        let jo = readerDb(name);

        readerJoDb.set({name})

        createReaderHtml(filePath).then((htmlStr) => {
            init(htmlStr);
            jo.set({text: htmlStr});
            jo.save();
        });

    }

    let render = () => {
        scope.render('textList', readerJoDb.get())
    };

    readerJoDb.on('change', render);

    render();

    this.speak = function (e, name) {
        let jo = readerDb(name);
        init(jo.get('text'));
    };

    this.remove = function (e, id) {
        readerJoDb.remove(id);
    }

});


