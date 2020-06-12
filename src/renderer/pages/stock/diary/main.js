/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/common-stock.js'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'

// 把当前日期转换为 yyyy-mm-dd格式
window.jFormatDate = () => {
    let d = new Date;
    return d.toLocaleDateString().split('/').map((v) => {
        return v.length > 1 ? v : '0' + v;
    }).join('-');
};


brick.reg('diaryCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    this.onGetDiaryDone = function (data) {
        list.init(data);
        scope.render('diaryList', data);
    };

    this.edit = function(e, id) {
        scope.emit('diary.edit', id && list.get(id));
    };

    this.onDelDone = function (data) {
        scope.onGetDiaryDone(data);
    };

    scope.on('diary.edit.done', function (e, data) {
        scope.onGetDiaryDone(data);
    });

});


brick.reg('setDiaryCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    let $text = $elm.find('#text');
    let $date = $elm.find('#date');
    let $id = $elm.find('#id');

    $text.froalaEditor({
        height: 480,
        //toolbarInline: true,
        /*toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'emoticons', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'indent', 'outdent', '-', 'insertImage', 'insertLink', 'insertFile', 'insert'],*/
        // Change save interval (time in miliseconds).
        //saveInterval: 2500,
        // Set the save param.
        //saveParam: 'text',
        // Set the save URL.
        //saveURL: '/stock/memo',
        // HTTP request type.
        //saveMethod: 'POST',
        // Additional save params.
        //saveParams: {time: +new Date}
    });

    scope.before = function (formDataObj) {
        let text = $text.froalaEditor('html.get', true);
        formDataObj.text = text;
    };

    scope.done = function (data) {
        scope.emit('diary.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        //scope.render({});
    };

    scope.on('diary.edit', function (e, diaryObj) {
        $elm.icPopup(true);
        diaryObj = diaryObj || {};
        $id.val(diaryObj.id);
        $date.val(diaryObj.date || jFormatDate());
        $text.froalaEditor('html.set', diaryObj.text || '');
    });

});
