/**
 * 浏览器语音合成接口封装
 * Created by j on 18/6/15.
 */

// 存储要发音的文本队列
let q = [];
// 上一次语音合成是否结束， 如果是false，则要等待结束后再进行下次语音合成
let isEnd = true;

function speak () {
    if (isEnd) {
        let o = q.shift();
        if (o) {
            //isEnd = false;
            let speechSU = new SpeechSynthesisUtterance(o.text);
            speechSU.onend = function (event) {
                isEnd = true;
                o.cb && o.cb();
                setTimeout(() => {
                    speak();
                },30);
            };
            speechSynthesis.speak(speechSU);
        }
    }
    console.log('voice 队列 =>', JSON.stringify(q));
}

/**
 * @todo 语音合成发声
 * @param {String|Number}  [sign] - 语音合成文本内容标记，可以用于取消对应的语音合成发声
 * @param {String|undefined|Function} [text] - 语音合成文本内容
 * @param {Function} [cb] - 语音合成结束后回调函数
 * @example voice('hello'); voice('601318','中国平安',()=>{console.log('over')}); voice('中国平安',()=>{console.log('over')});
 */
function voice (sign, text, cb) {
    if (typeof text === 'undefined') {
        text = sign;
        sign = null;
        cb = null;
    }
    if (typeof text === 'function') {
        cb = text;
        text = sign;
        sign = null;
    }
    // 转换为String，如果是空字符，语音合成取消
    text += '';
    if(text.length <= 0 ) return;

    let item = {sign, text, cb};

    // 有sign，表示优先级高，加入队列头部
    if (sign) {
        q.unshift(item);
        speechSynthesis.cancel();
    } else {
        q.push(item);
    }
    console.log('exec: voice => ', isEnd, JSON.stringify(q.map((v) => {
        return v.text;
    })));
    speak();
}

voice.remove = function (sign) {
    //speechSynthesis.cancel();
    isEnd = true;
    q.forEach(function (v, i) {
        if (v.sign === sign) {
            console.log('删除', sign, v.text);
            q.splice(i, 1);
        }
    });
};

voice.clear = voice.cancel = function (sign) {
    speechSynthesis.cancel();
    isEnd = true;
    if (sign) {
        voice.remove(sign);
    } else {
        q = [];
    }
};

voice.pause = function () {
    speechSynthesis.pause();
};

voice.resume = function () {
    speechSynthesis.resume();
};

voice.debug = function () {
    console.log('voice debug =>', isEnd, q);
};


export default voice
