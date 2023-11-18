/**
 * Created by j on 18/7/28.
 */

import './index.html'
import '../../../css/common/common.scss'
import './style.scss'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import { FroalaEditorConfig, GET_TAGS_DONE, READY_SELECT_TAGS, TAG_SELECT_CHANGE } from '../../../js/constants'
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
import voice from '../../../../libs/voice'

brick.reg('setTagCtrl', setTagCtrl);
brick.reg('selectTagsCtrl', selectTagsCtrl);

brick.reg('diaryCtrl', function () {

    let scope = this;
    let $elm = scope.$elm;
    let list = brick.services.get('recordManager')();

    let listSize = 300;
    let $title = $('title').text(`日记_${ formatDate() }`);

    let anchorArr = location.href.match(/\#([^#]+$)/) || [];
    let anchor = anchorArr[1] || '';

    scope.order = brick.utils.getQuery('order') === 'true';  // 排序方式: 顺序  or  逆序
    scope.pn = brick.utils.getQuery('pn') || 1;
    scope.total = 0;


    function render () {
        let resultArr = list.get();
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

        // 分页显示
        let pn = scope.pn * 1;
        let resultArr2 = resultArr.slice((pn - 1) * listSize, pn * listSize);

        // 判断分页显示是否有数据， 否则不用分页
        if (resultArr2.length === 0){
            resultArr2 = resultArr;
        }

        // 排序方式：正序 或 反序
        scope.order && resultArr2.reverse();

        $.icMsg(`render item => ${ resultArr2.length }`);
        scope.render('diaryList', resultArr2, function () {
            if (anchor) {
                let domA = document.querySelector(`a[name="${ anchor }"]`);
                if (domA) {
                    domA.scrollIntoViewIfNeeded(false);
                    //domA.scrollIntoView(true);
                }
            }
        });

        $title.text(`日记_${ val }_${ formatDate() }`);
    }

    function getTagArr (data) {
        let tags = [];
        let tags2 = [];
        data.map((item, index) => {
            tags = tags.concat(item.tag || []);
            tags2 = tags2.concat(item.tags || []);
        });
        scope.tagMap = _.countBy(tags);
        let tagArr = _.keys(scope.tagMap);
        tagArr.sort(utils.sortByPy);
        //console.log(tagArr);

        let tagsMap = _.countBy(tags2);
        //let tagsArr = _.keys(tagsMap);

        let tagsArr = _.toPairs(tagsMap);

        tagsArr.sort((a, b) => {
            return b[1] - a[1];
        });
        scope.tagsArr = tagsArr.map((item) => {
            return item[0];
        });

        tagsMap = {};
        _.forEach(tagsArr, (item) => {
            tagsMap[item[0]] = item[1];
        });

        scope.tagsMap = tagsMap;
        //console.log(333, tagsMap, tagsArr);

        return tagArr;
    }

    // 这段代码只会在首次取回数据后执行一次；
    let def2 = $.Deferred();
    this.onGetDiaryDone = function (data) {
        def2.resolve(data);
    };

    // 等待标签数据获取后，否则 TAGS_MAP_BY_ID 不存在
    scope.on(GET_TAGS_DONE, function (e, data) {
        $.when(window.GET_TAGS_DEF, def2).done((d1, d2) => {
            console.log('when', d2);
            _onGetDiaryDone(d2);   // 只执行一次分页
            scope.onGetDiaryDone = function (data) {
                _onGetDiaryDone2(data);
                render();
            };
        });
    });

    function _onGetDiaryDone2 (data) {
        list.init(data);
        scope.tagArr = getTagArr(data);
        scope.total = Math.ceil((data.length + 20) / listSize); // 加20是为了处理新建日记后并不修改分页
        scope.render('tags', scope);
        //render();
        // 等待标签数据获取后，否则 TAGS_MAP_BY_ID 不存在
        //setTimeout(render, 400); // 改为通过分页触发渲染
    }

    function _onGetDiaryDone (data) {
        _onGetDiaryDone2(data);
        scope.render('pagination', scope, function () {
            // 分页
            $('#pg').on('ic-pagination.change', function (e, msg) {
                //当前激活的分页
                console.log(msg);
                scope.pn = msg;
                render();
                _pushState('pn', msg);
            });
        });
    }


    function _pushState (key, val) {
        let url = location.href;
        let url2 = url.split('?')[0];
        let o = brick.utils.getQuery() || {};
        o[key] = val;
        let s = '';
        for (let i in o) {
            s = s + i + '=' + o[i] + '&';
        }
        s = s.replace(/[&]$/img, '');
        history.pushState(null, null, `${ url2 }?${ s }#${ anchor }`);
    }


    // 反转排序方式
    this.reverse = function () {
        let order = scope.order = !scope.order;
        render();
        _pushState('order', order);
        /*        let url = location.href.split('?')[0];
                let _order = order ? `?order=${ order }` : '';
                history.pushState(null, null, `${ url }${ _order }`);*/
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

    this.play = function (e) {
        let text = $(this).closest('li').find('.pre').text();
        text = `${ text } ${ text } ${ text }`;
        voice.clear();
        voice(text);
    };
    this.stop = function (e) {
        voice.clear();
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

    const DIARY_CACHE = 'DIARY_CACHE';
    let scope = this;
    let $elm = this.$elm;

    let $date = $elm.find('#date');
    let $id = $elm.find('#id');
    let $editor = $elm.find('#editor');

    // 保存传递过来要修改的 diary object
    scope.vm = {};

    let isAutoSave = true;

    $elm.on('click', '#saveDiaryButton', function (e) {
        console.log(e.originalEvent);
        // 手动触发 e.originalEvent有值，编程触发无值
        isAutoSave = !!!e.originalEvent;
    });

    // 准备编写或修改交易日记
    scope.on('diary.edit', function (e, model) {
        scope.emit(READY_SELECT_TAGS, model.diary.tags);
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
        //console.log(444, fields);
    };

    // 交易日记提交到服务器完成 ajax done
    scope.done = function (data) {
        // 如果是定时自动保存, 更新id, 否则会因为空ID而产生很多新数据项
        if (isAutoSave) {
            $id.val(data[0].id);
            return;
        }
        scope.emit('diary.edit.done', data);
        $elm.icPopup(false);
    };

    scope.reset = function () {
        //scope.render({});
    };

    // 恢复文本内容
    scope.recover = function () {
        $editor.froalaEditor('html.set', localStorage.getItem(DIARY_CACHE) || '');
    };

    scope.onTagsChange = function (msg) {
        // 首次渲染触发不通知
        if (msg.time === 0) return console.log(msg.time);
        scope.emit(READY_SELECT_TAGS, msg.value);
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
                height: 970,
            });

            $editor.froalaEditor('html.set', model.diary.text || '<p>#大局观  &nbsp;&nbsp;&nbsp;#市场偏好  &nbsp;&nbsp;&nbsp;#主流热点龙头&nbsp;&nbsp;&nbsp;#预案应对：</p>');

            // 自动保存输入数据
            $editor.on('froalaEditor.input', _.throttle(saveForm, 2900));

            // 开启全屏
            //$editor.froalaEditor('fullscreen.isActive');
            /*setTimeout( () => {
                let b = $elm.find('#fullscreen-1').click();
                console.log(b);
            }, 7900);*/


/*            let editor = new FroalaEditor('#editor', {
                ...FroalaEditorConfig,
                fontSizeDefaultSelection: '18',
                //toolbarInline: true,
                height: 210,
            }, function () {

                editor.html.set(model.diary.text || '');
                editor.fullscreen.isActive();

            });*/


        });
    }

    function saveForm (e, editor) {
        console.log('auto save');
        isAutoSave = true;
        //$elm.find('[ic-form="setDiary"]').icFormSubmit();
        let text = $editor.froalaEditor('html.get', true);
        console.log(text.length, 'text.length:');
        if (text.length > 14) {
            localStorage.setItem(DIARY_CACHE, text);
        }
    }

    function getFormVm () {
        return $elm.find('[ic-form="setDiary"]').icForm();
    }

});


