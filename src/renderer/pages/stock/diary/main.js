/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import { FroalaEditorConfig } from '../../../js/constants'
import '../../../js/common-stock.js'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'
import _ from 'lodash'
import utils from '../../../js/utils'

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

        let tags = [];
        data.map((item, index) => {
            let tag = item.tag;
            if (tag) {
                tag.forEach((v) => {
                    tags.push(v);
                });
            }
        });
        scope.tagMap = _.countBy(tags);
        let tagArr = _.keys(scope.tagMap);
        tagArr.sort(utils.sortByPy);
        scope.tagArr = tagArr;
        scope.render('tags', scope);
        scope.render('diaryList', data);
    };

    this.edit = function (e, id) {
        let diary = (id && list.get(id)) || {};
        scope.emit('diary.edit', {diary, tagArr: scope.tagArr});
    };

    this.toggleText = function (e) {
        let cla = 'scroll';
        let $th = $(this).toggleClass(cla);
        $th.closest('li').find('.pre').toggleClass(cla);
    };

    this.onDelDone = function (data) {
        scope.onGetDiaryDone(data);
    };

    // 过滤标签改变
    this.onFilterKeyChange = function (msg) {
        scope._onFilterKeyChange(msg.value);
    };

    this.onFilterKeyChange2 = function (e, val) {
        scope._onFilterKeyChange(val);
        scope.render('tags', scope);
    };

    this._onFilterKeyChange = function (val) {
        let resultArr = list.get();

        let filterKey = scope.filterKey = val === '' ? undefined : val === '_null' ? '' : val;
        // 如果有过滤条件
        if (filterKey) {
            resultArr = resultArr.filter((item) => {
                let tag = item.tag;
                return Array.isArray(tag) && tag.includes(filterKey);
            });
        }

        scope.render('diaryList', resultArr);
        $.icMsg(`render item => ${ resultArr.length }`);
    };


    scope.on('diary.edit.done', function (e, data) {
        scope.onGetDiaryDone(data);
    });

});


brick.reg('setDiaryCtrl', function () {

    let scope = this;
    let $elm = this.$elm;

    let $date = $elm.find('#date');
    let $id = $elm.find('#id');
    let $editor = $elm.find('#editor');

    // 保存传递过来要修改的 diary object
    scope.vm = {};

    // ajax before 提交前数据处理
    scope.before = function (fields) {
        fields.text = $editor.froalaEditor('html.get', true);
        //  tag属性如果是空数组，recordManager.set 由于合并的关系，似乎并不会在服务器端删除，临时处理，先把tag设为''
        if (fields.tag && fields.tag.length === 0) {
            fields.tag = '';
        }
    };

    // ajax done
    scope.done = function (data) {
        scope.emit('diary.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        //scope.render({});
    };

    scope.addTag = function (e) {
        let vm = scope.vm;
        let str = $(this).val();
        if (!str) return;
        if (!vm.tagArr.includes(str)) {
            vm.tagArr.push(str);
        }
        let obj = getFormVm();
        obj.text = $editor.froalaEditor('html.get', true);
        obj.tag = obj.tag || [];
        obj.tag.push(str);
        Object.assign(vm.diary, obj);

        render(vm);
    };

    scope.on('diary.edit', function (e, model) {
        $elm.icPopup(true);
        scope.vm = model;
        render(model);
    });

    function getFormVm () {
        return $elm.find('[ic-form="setDiary"]').icForm();
    }

    function render (model) {
        scope.render('setDiary', model, function () {
            $editor = $elm.find('#editor').froalaEditor({
                ...FroalaEditorConfig,
                height: 450,
            });
            $editor.froalaEditor('html.set', model.diary.text || '');
        });
    }

});
