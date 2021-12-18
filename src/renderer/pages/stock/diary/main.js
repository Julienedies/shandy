/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import { FroalaEditorConfig, ON_SELECT_TAGS, TAG_SELECT_CHANGE } from '../../../js/constants'
import '../../../js/common-stock.js'

import '@fortawesome/fontawesome-free/css/all.css'
import 'froala-editor/css/froala_editor.pkgd.css'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/js/froala_editor.pkgd.min.js'
import _ from 'lodash'
import utils from '../../../js/utils'

import '../../../js/common-stock.js'
import setTagCtrl from '../../tags/set-tag-ctrl'
import selectTagsCtrl from '../../tags/select-tags-ctrl'

brick.reg('setTagCtrl', setTagCtrl);
brick.reg('selectTagsCtrl', selectTagsCtrl);

brick.reg('diaryCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    scope.order = false;  // 排序方式: 顺序  or  逆序

    function render () {
        let resultArr = list.get();
        scope.order && resultArr.reverse();
        let val = scope.filterKey;
        let filterKey = val === '' ? undefined : val === '_null' ? '' : val;
        // 如果有过滤条件
        if (filterKey) {
            resultArr = resultArr.filter((item) => {
                let tag = item.tag;
                let tags = item.tags;
                let a = Array.isArray(tag) && tag.includes(filterKey);
                let b = Array.isArray(tags) && tags.includes(filterKey);
                return a || b;
            });
        }

        $.icMsg(`render item => ${ resultArr.length }`);
        scope.render('diaryList', resultArr);
    }

    function getTagArr (data) {
        let tags = [];
        let tags2 = [];
        data.map((item, index) => {
            tags = tags.concat(item.tag || []);
            tags2 = tags2.concat(item.tags || []);
            /*  let tag = item.tag;
            if (tag) {
                 tag.forEach((v) => {
                     tags.push(v);
                 });
             }*/
        });
        scope.tagMap = _.countBy(tags);
        let tagArr = _.keys(scope.tagMap);
        tagArr.sort(utils.sortByPy);
        //console.log(tagArr);

        let tagsMap = _.countBy(tags2);
        let tagsArr = _.keys(tagsMap);
        console.log(333, tagsMap);
        scope.tagsMap = _.toPairs(tagsMap);

        /*tagsArr.sort((a, b) => {
            return a.
        })*/
        scope.tagsArr = tagsArr;

        return tagArr;
    }

    this.onGetDiaryDone = function (data) {
        list.init(data);
        scope.tagArr = getTagArr(data);
        scope.render('tags', scope);
        render();
    };

    this.reverse = function () {
        let order = scope.order = !scope.order;
        render();
    };

    this.edit = function (e, id) {
        let diary = (id && list.get(id)) || {};
        scope.emit('diary.edit', {diary, tagArr: scope.tagArr, tagsArr: scope.tagsArr});
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
        scope.filterKey = val;
        render();
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

    // 准备编写或修改交易日记
    scope.on('diary.edit', function (e, model) {
        scope.emit(ON_SELECT_TAGS, model.diary.tags);
        $elm.icPopup(true);
        scope.vm = model;
        render(model);
    });

    // 标签选择改变
    scope.on(TAG_SELECT_CHANGE, function (e, data) {
        let vm = scope.vm;
        let tagsArr = vm.tagsArr;
        let model = getFormVm();
        model.text = $editor.froalaEditor('html.get', true);
        model.tags = data.value;
        tagsArr = _.uniq(tagsArr.concat(data.value));
        vm.tagsArr = tagsArr;
        Object.assign(vm.diary, model);
        render(vm);
    });

    // ajax before 交易日记提交前数据处理
    scope.before = function (fields) {
        fields.text = $editor.froalaEditor('html.get', true);
    };

    // 交易日记提交到服务器完成 ajax done
    scope.done = function (data) {
        scope.emit('diary.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        //scope.render({});
    };

    scope.onTagsChange = function (msg) {
        scope.emit(ON_SELECT_TAGS, msg.value);
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

    function render (model) {
        scope.render('setDiary', model, function () {
            $editor = $elm.find('#editor').froalaEditor({
                ...FroalaEditorConfig,
                fontSizeDefaultSelection: '18',
                //toolbarInline: true,
                height: 340,
            });
            $editor.froalaEditor('html.set', model.diary.text || '');
        });
    }


    function getFormVm () {
        return $elm.find('[ic-form="setDiary"]').icForm();
    }

});
