/*!
 * Created by j on 2019-03-10.
 */

import '../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'

import { FroalaEditorConfig } from '../../js/constants'

import '../../js/utils.js'


brick.reg('memoCtrl', function () {

    $('title').text(`备忘录_${ formatDate() }`);

    let $memo = $('#memo').icSetLoading();

    $.get('/stock/memo').done(function (data) {
        $memo.icClearLoading();
        $memo.froalaEditor({
            ...FroalaEditorConfig,
            toolbarInline: true,
            /*toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insert'],*/
            // Change save interval (time in miliseconds).
            saveInterval: 2500,
            // Set the save param.
            saveParam: 'text',
            // Set the save URL.
            saveURL: '/stock/memo',
            // HTTP request type.
            saveMethod: 'POST',
            // Additional save params.
            saveParams: {time: +new Date}
        }).froalaEditor('html.set', data.text || '');

    });

    this.saveMemo = function (e) {
        let text = $memo.froalaEditor('html.get', true)
        console.log(text)
        $.post('/stock/memo', {text}).done((o) => {
        });
    };

});


brick.bootstrap();
