/*!
 * Created by j on 2019-03-23.
 */

import $ from 'jquery'

let speechSU = new SpeechSynthesisUtterance();


class Reader {
    constructor (elm = 'body') {
        let that = this
        this.elm = elm
        this.list = []
        this.index = 0
        speechSU.onend = () => {
            $(that.list[that.index]).css({color:''})
            that.index = that.index + 1
            that.speak()
        }

        $(document).on('click', 'a.reader-readable-node', function (e) {
            let index = $(this).data('index')
            that.position(index)
        })

        this.gui()
    }

    init () {
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
                        console.log('#', node.parentNode, node.nodeValue)
                        that.list.push(node.parentNode)
                        $parent.prepend(`<a class="reader-readable-node" style="background:#64c116;color:#fff;padding:5px;" data-index="${ that.list.length - 1 }"> ▶ </a>`)
                    }
                }
            }
        }
    }

    gui () {
        let that = this;
        let $wrapper = $(`<div id="reader-wrapper" style="position:fixed;z-index:10000;bottom:0;left:20px;background:rgba(0,0,0,0.7);padding:3px 7px;"></div>`)
        let $speakBtn = $(`<a style="color:#fff;">播放</a>`).on('click', function (e) {
            let $th = $(this)
            let isPause = $th.attr('data-pause')

            if (isPause === undefined) {
                that.init()
                that.speak()
                $th.attr('data-pause', 'false')
                $th.text('暂停')
            } else if (isPause === 'true') {
                $th.text('暂停')
                that.resume()
                $th.attr('data-pause', 'false')
            } else {
                $th.attr('data-pause', 'true')
                $th.text('播放')
                that.pause()
            }
        })
        $wrapper.append($speakBtn).appendTo(document.body)
    }

    position (index) {
        this.cancel()
        this.index = index
        this.speak()
    }

    speak () {
        let index = this.index
        speechSU.text = $(this.list[index]).css({color:'#64c116'}).text();
        speechSynthesis.speak(speechSU);
    }

    cancel () {
        $(this.list[this.index]).css({color:''})
        speechSynthesis.cancel();
    }

    pause () {
        speechSynthesis.pause();
    }

    resume () {
        speechSynthesis.resume();
    }

}


export default Reader
