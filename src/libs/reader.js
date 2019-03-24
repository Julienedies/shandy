/*!
 * Created by j on 2019-03-23.
 */

import $ from 'jquery'

let speechSU = new SpeechSynthesisUtterance();

class Reader {
    constructor (elm = 'body') {
        let that = this

        this.state = null
        this.elm = elm
        this.list = []
        this.index = 0

        speechSU.onend = () => {
            console.log('speechSU.onend')
        }

        window.addEventListener('beforeunload', function (e) {
            that.cancel()
        })

        this._gui(this)
    }

    init (elm) {
        this.state = 'init'
        this.list = []
        this.index = 0
        this.elm = elm || this.elm
        let dom = $(this.elm)[0]
        walk(dom, this)

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
                    if (t.length > 5 && $parent.is(':visible')) {
                        //console.log('#', node.parentNode, node.nodeValue)
                        that.list.push(node.parentNode)
                        let index = that.list.length - 1
                        $parent.prepend(`<a class="reader-readable-node" data-index="${ index }" title="点击播放本段:${ index }"> </a>`)
                    }
                }
            }
        }
    }

    speak () {
        let index = this.index
        let $item = $(this.list[index])
        speechSU.text = $item.text()
        speechSynthesis.speak(speechSU)
        setTimeout(() => {
            speechSU.onend = () => this.next()
        }, 3000)
        this.setState('speak')
    }

    cancel () {
        speechSU.onend = null
        speechSynthesis.cancel()
        this.setState('cancel')
    }

    pause () {
        speechSynthesis.pause();
        this.setState('pause')
    }

    resume () {
        speechSynthesis.resume();
        this.setState('resume')
    }

    volume (n) {
        speechSU.volume = n // 0.3;
    }

    position (index) {
        this.cancel()
        this.index = index
        this.speak()
    }

    next () {
        let index = this.index + 1;
        if (index >= this.list.length) {
            index = 0
        }
        this.position(index)
    }

    setState (state) {
        console.log('state: ', state, speechSU)
        this.state = state
        if (state === 'speak' || state === 'resume') {
            this.$speakBtn.hide()
            this.$pauseBtn.show()
            let $item = $(this.list[this.index]).addClass('reader-reading')
            $(document).scrollTop($item.offset().top - 15)
        }
        if (state === 'pause' || state === 'cancel') {
            this.$speakBtn.show()
            this.$pauseBtn.hide()
            if (state === 'cancel') {
                $(this.list[this.index]).removeClass('reader-reading')
            }
        }
    }

    _gui (that) {
        this._style()
        let $reader = $(`<div id="reader-wrapper" style=""></div>`).appendTo(document.body)

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
        }).appendTo($reader)

        let $volumeBtn = $(`<label>音量 <input type="range" value="7" min="0" max="10"></label>`).on('change', function (e) {
            let val = $(this).find('input').val()
            console.log(val)
            that.volume(val / 10)
        }).appendTo($reader)

        $(document).on('click', 'a.reader-readable-node', function (e) {
            let index = $(this).data('index')
            that.position(index)
        })

        that.$reader = $reader
        that.$speakBtn = $speakBtn
        that.$pauseBtn = $pauseBtn
    }

    _style () {
        $(`<style>
            #reader-wrapper{
                position:fixed;
                z-index:10000;
                bottom:0;
                left:20px;
                background:rgba(0,0,0,0.7);
                padding:3px 7px;
            }
            #reader-wrapper a, #reader-wrapper label, .reader-readable-node{
                text-decoration: none!important;
                color:#fff!important;
                padding:0 4px!important;
            }
            #reader-wrapper label input{
                display: none;
            }
            #reader-wrapper label:hover input{
                display: inline-block;
            }
            .reader-readable-node{
                background:#64c116!important;
                display: inline-block!important;
                width: 1em!important;
                height: 1em!important;
                padding: 0!important;
                margin-right: 0.5em!important;
                border-radius: 50%!important;
            }
            .reader-reading{
                color:#64c116;
            }
        </style>`).appendTo(document.head)
    }

}


export default Reader
