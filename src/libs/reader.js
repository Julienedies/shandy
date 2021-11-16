/*!
 * Created by j on 2019-03-23.
 */

import $ from 'jquery';
/*
text – 要合成的文字内容，字符串。
lang – 使用的语言，字符串， 例如："zh-cn"
voiceURI – 指定希望使用的声音和服务，字符串。
volume – 声音的音量，区间范围是0到1，默认是1。
rate – 语速，数值，默认值是1，范围是0.1到10，表示语速的倍数，例如2表示正常语速的两倍。
pitch – 表示说话的音高，数值，范围从0（最小）到2（最大）。默认值为1。
 */
let speechSU = new SpeechSynthesisUtterance();
speechSU.volume = 0.5;
speechSU.rate = 1.1;
speechSU.pitch = 1.1;

const speechSU_props = {};

class Reader {

    static style () {
        $(`<style>
            #reader-control-wrapper{
                position:fixed;
                z-index:1000;
                bottom:0;
                left:0;
                right:0;
                background:rgba(0,0,0,0.7);
                padding:1px 10px;
                opacity:0.5;
            }
            #reader-control-wrapper:hover{
                opacity:1;
            }
            #reader-control-wrapper a, #reader-control-wrapper label{
                text-decoration: none!important;
                color:#fff!important;
                padding:0 4px!important;
            }
            #reader-control-wrapper label input{
                display: none;
            }
            #reader-control-wrapper label:hover input{
                display: inline-block;
            }
            .reader-readable-node{
                display: inline-block;
                padding:0 2px;
            }
            .reader-readable-node-mark{
                background:#64c116!important;
                padding: 0 0.6em!important;
                margin-right: 0.5em!important;
                border-radius: 50%!important;
            }
            .reader-reading{
                color:#fff!important;
                background: blue!important;
                //text-decoration: underline;
                font-weight: bold;
/*                background:#95b750;
                color:#0359cc;*/
            }
        </style>`).appendTo(document.head)
    }

    static volume (n) {
        speechSU.volume = n;
    }

    static setSpeechSU (prop, value) {
        speechSU_props[prop] = value;
    }

    constructor (elm = 'body') {
        let that = this;

        this.speechSU = speechSU;
        this.id = +new Date();
        this.state = null;
        this.elm = elm;
        this.list = [];
        this.index = 0;
        this.$elm = null;
        this.$reader = null;
        this.$speakBtn = null;
        this.$pauseBtn = null;
        this.clicentHeight = $(window).height();

        $(window).on('resize', function () {
            that.clicentHeight = $(window).height();
        });

        window.addEventListener('beforeunload', function (e) {
            that.cancel();
        });

        this._gui(this);
    }

    init (elm) {
        this.cancel();
        this.state = 'init'
        this.list = []
        this.index = 0
        this.elm = elm || this.elm
        this.$elm = $(this.elm)
        let dom = this.$elm[0]
        walk(dom, this)
        console.log('init', this)

        // 遍历dom节点, 如果一个元素节点有文本类型的直接子节点, 添加到list
        function walk (dom, that) {
            let childNodes = Array.from(dom.childNodes)
            for (let node of childNodes) {
                // 元素节点
                if (node.nodeType === 1) {
                    walk(node, that)
                }
                // 文本节点, 有文本直接子节点的元素节点做为有效文本容器存储起来
                else if (node.nodeType === 3) {
                    let $parent = $(node.parentNode)
                    let t = node.nodeValue.trim()
                    if (t.length > 1 && $parent.is(':visible')) {
                        //console.log('#', node.parentNode, node.nodeValue)
                        that.list.push(node.parentNode)
                        let index = that.list.length - 1;
                        $parent.prepend(`<a class="reader-readable-node-mark" data-index="${ index }" title="点击播放本段:${ index }"></a>`)
                        $parent.addClass('reader-readable-node');
                    }
                }
            }
        }
    }

    _gui (that) {

        Reader.style()
        let $reader = $(`<div id="reader-control-wrapper"></div>`).appendTo(document.body)

        let $speakBtn = $(`<a>播放</a>`).on('click', function (e) {
            let $th = $(this)
            if (!that.state) {
                that.init()
                that.speak()
            } else if (that.state === 'pause') {
                that.resume()
            } else {
                that.speak()
            }
        }).appendTo($reader)

        let $pauseBtn = $(`<a>暂停</a>`).hide().on('click', function (e) {
            that.pause()
        }).appendTo($reader);

        /*
            volume – 声音的音量，区间范围是0到1，默认是1。
            rate – 语速，数值，默认值是1，范围是0.1到10，表示语速的倍数，例如2表示正常语速的两倍。
            pitch – 表示说话的音高，数值，范围从0（最小）到2（最大）。默认值为1。
          setSpeechSU
         */
        let $volumeBtn = $(`<label>音量 <input type="range" value="7" min="0" max="10"></label>`).on('change', function (e) {
            let val = $(this).find('input').val()
            Reader.setSpeechSU('volume',val / 10)
        }).appendTo($reader)

        let $rateBtn = $(`<label>语速 <input type="range" value="12" min="1" max="100"></label>`).on('change', function (e) {
            let val = $(this).find('input').val()
            Reader.setSpeechSU('rate', val / 10)
        }).appendTo($reader)

        let $pitchBtn = $(`<label>音高 <input type="range" value="10" min="0" max="20"></label>`).on('change', function (e) {
            let val = $(this).find('input').val()
            Reader.setSpeechSU('pitch', val / 10)
        }).appendTo($reader)

        $(document).on('dblclick', '.reader-readable-node', function (e) {
            let $th = $(this);
            let index;
            if ($th.hasClass('reader-readable-node-mark')) {
                index = $th.data('index')
            } else {
                index = $th.find('.reader-readable-node-mark').data('index');
            }
            console.log('开始朗读：', index, that)
            that.position(index)
        })

        that.$reader = $reader
        that.$speakBtn = $speakBtn
        that.$pauseBtn = $pauseBtn
    }

    position (index) {
        this.cancel()
        this.index = index
        this.speak()
    }

    speak () {
        this.setState('speak')
        let that = this;
        let index = this.index
        let $item = $(this.list[index])
        let text = $item.text();
/*        if (/^\s+$/.test(text)) {
            return that.next();
        }*/

        // 重复使用同一个语音合成实例，似乎会导致很多问题，避免重复使用同一个tts实例
        speechSU = new SpeechSynthesisUtterance();
        for(let i in speechSU_props){
            console.log(i, speechSU_props[i]);
            speechSU[i] = speechSU_props[i];
        }
        this.speechSU = speechSU;
        speechSU.onend = function () {
            console.log('onend', index);
            that.next();
        };
        speechSU.text = text;
        speechSynthesis.speak(speechSU)
    }

    next () {
        $(this.list[this.index]).removeClass('reader-reading');
        let index = this.index + 1;
        if (index >= this.list.length) {
            this.index = 0;
            return this.cancel();
        }
        this.index = index;
        this.speak();
    }

    setState (state) {
        console.log('setState:', state, this.index);
        this.state = state
        if (state === 'speak' || state === 'resume') {
            this.$speakBtn.hide()
            this.$pauseBtn.show()
            let $item = $(this.list[this.index]).addClass('reader-reading');
            let clientTop = $item[0].getBoundingClientRect().top;
            console.log(clientTop, this.clicentHeight)
            if (clientTop < 10 || clientTop > this.clicentHeight - 70) {
                //$(document).scrollTop($item.offset().top - 100)
                $('html, body').animate({
                    scrollTop: $item.offset().top - 70
                }, 4000);
            }
        }
        if (state === 'pause' || state === 'cancel') {
            this.$speakBtn.show()
            this.$pauseBtn.hide()
            if (state === 'cancel') {
                $(this.list[this.index]).removeClass('reader-reading')
            }
        }
    }

    cancel () {
        this.speechSU.onend = null;
        speechSynthesis.cancel();
        this.setState('cancel');
    }

    pause () {
        speechSynthesis.pause();
        this.setState('pause');
    }

    resume () {
        speechSynthesis.resume();
        this.setState('resume');
    }

    autoSpeak () {
        this.$speakBtn.click();
    }

}


export default Reader
