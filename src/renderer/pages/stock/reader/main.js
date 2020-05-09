/**
 * Created by j on 18/7/28.
 */

import './style.scss'
import '../../../css/common/common.scss'

import './index.html'
import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common.js'

import Reader from '../../../../libs/reader'

brick.set('render.wrapModel', true);


brick.reg('uploadTextFileCtrl', function (scope) {

    //const readerDb = jsonDb('reader');
    //const readerJoDb = userJodb('reader', [], {joinType: 'push'});

    const reader = new Reader('#readerBox');

    let $readerBox = $('#readerBox');

    let init = (htmlStr) => {
        $readerBox.html(htmlStr);
        reader.init();
    }

    function render (data) {
        scope.render('textList', data);
    }

    this.onGetReaderDone = function (data) {
        render(data);
    };

    this.onUpload = function (e) {
        let file = this.files[0];
        if (!file) return;
        $(this).prev().val(file.name);
        console.log(file);
        let fileReader = new FileReader;
        fileReader.onload = function (e) {
            let data = this.result;
            console.log(data);

            $.ajax({
                url: '/reader',
                method: 'post',
                data: {name: file.name, text: data},
                dataType: 'json'
            }).done((data) => {
                init(data.html);
            });
        };
        fileReader.readAsText(file);
    };

    this.onGetReaderByIdDone = function (data) {
        console.log(data);
        init(data.text);
    };

    this.speak = function (e, id) {
        $.ajax({
            url: `/reader/${ id }`,
            method: 'get',
            dataType: 'json'
        }).done((data) => {
            console.log(data);
            init(data.text);
        });
    };

    this.remove = function (e, id) {
        let that = this;
        $.ajax({
            url: `/reader/${ id }`,
            method: 'delete'
        }).done((data) => {
            $(that).parent().remove();
        });
    };

});


